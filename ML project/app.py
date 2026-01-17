import sys
import os
import pandas as pd

from fastapi import FastAPI, File, UploadFile, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from starlette.responses import RedirectResponse
from uvicorn import run as app_run

from fastapi.templating import Jinja2Templates

from networksecurity.decision.preset_scenarios import PRESET_SCENARIOS
from networksecurity.decision.alert_engine import AlertEngine
from networksecurity.decision.decision_engine import GroundwaterDecisionEngine
from networksecurity.exception.exception import NetworkSecurityException
from networksecurity.logging.logger import logging
from networksecurity.pipeline.training_pipeline import TrainingPipeline
from networksecurity.utils.main_utils.utils import load_object
from networksecurity.decision.scenario_simulator import ScenarioSimulator, ScenarioConfig
from networksecurity.decision.dashboard_aggregator import DashboardAggregator
from networksecurity.decision.hotspot_detector import HotspotDetector
from networksecurity.decision.trend_analyzer import TrendAnalyzer
from networksecurity.decision.geojson_builder import GeoJSONBuilder
from networksecurity.decision.pdf_report_generator import PDFReportGenerator
from fastapi.responses import FileResponse


from pydantic import BaseModel

class ScenarioRequest(BaseModel):
    availability_change_pct: float = 0.0  # e.g. -0.3 for -30%
    demand_change_pct: float = 0.0         # e.g. +0.2 for +20%

# ===============================
# App Init
# ===============================
app = FastAPI(title="Generic ML Training & Prediction API")

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

templates = Jinja2Templates(directory="./templates")

# ===============================
# Routes
# ===============================
@app.get("/", tags=["root"])
async def index():
    return RedirectResponse(url="/docs")

# ===============================
# New GET Endpoints for Live Dashboard
# ===============================
from data_loader import get_dashboard_stats, get_stations_for_map, get_historical_trends

@app.get("/api/dashboard/stats", tags=["dashboard-live"])
async def dashboard_stats():
    try:
        return get_dashboard_stats()
    except Exception as e:
        raise NetworkSecurityException(e, sys)

@app.get("/api/map/stations", tags=["dashboard-live"])
async def map_stations():
    try:
        return get_stations_for_map()
    except Exception as e:
        raise NetworkSecurityException(e, sys)

@app.get("/api/trends/history", tags=["dashboard-live"])
async def trends_history():
    try:
        return get_historical_trends()
    except Exception as e:
        raise NetworkSecurityException(e, sys)

from data_loader import get_nearest_station

@app.get("/api/water-level/nearest", tags=["dashboard-live"])
async def nearest_water_level(lat: float, lon: float):
    try:
        result = get_nearest_station(lat, lon)
        if result:
            return result
        return Response("No station found", status_code=404)
    except Exception as e:
        raise NetworkSecurityException(e, sys)


@app.get("/train", tags=["training"])
async def train_route():
    try:
        logging.info("Training request received")

        train_pipeline = TrainingPipeline()
        train_pipeline.run_pipeline()

        return Response("Training completed successfully")

    except Exception as e:
        raise NetworkSecurityException(e, sys)


@app.post("/predict", tags=["prediction"])
async def predict_route(request: Request, file: UploadFile = File(...)):
    try:
        logging.info("Prediction request received")

        # ===============================
        # Load CSV
        # ===============================
        df = pd.read_csv(file.file)

        if df.shape[0] == 0:
            return Response("Uploaded file is empty")

        # ===============================
        # Load trained model (single object)
        # ===============================
        model_path = os.path.join("final_model", "model.pkl")

        if not os.path.exists(model_path):
            return Response("Model not found. Please train the model first using /train")

        network_model = load_object(model_path)

        # ===============================
        # Predict
        # ===============================
        y_pred = network_model.predict(df)
        df["prediction"] = y_pred

        # ===============================
        # Decision Engine: Stress Index + Zone
        # ===============================
        required_cols = [
            "Annual_Ground_Water_Draft_Total",
            "Net_Ground_Water_Availability"
        ]

        for col in required_cols:
            if col not in df.columns:
                raise Exception(f"Required column missing for decision engine: {col}")

        zones = []
        stress_indexes = []

        for _, row in df.iterrows():
            demand = float(row["Annual_Ground_Water_Draft_Total"])
            availability = float(row["Net_Ground_Water_Availability"])

            decision = GroundwaterDecisionEngine.evaluate(
                demand=demand,
                availability=availability
            )

            zones.append(decision.zone)
            stress_indexes.append(decision.stress_index)

        df["stress_index"] = stress_indexes
        df["zone"] = zones

        # ===============================
        # Alert Engine
        # ===============================
        all_alerts = []
        alert_summaries = []

        for i in range(len(df)):
            zone = df.loc[i, "zone"]
            stress_index = df.loc[i, "stress_index"]

            alerts = AlertEngine.generate_alerts(
                zone=zone,
                stress_index=stress_index
            )

            if len(alerts) == 0:
                alert_summaries.append("NO_ALERT")
            else:
                # Combine messages
                messages = [alert.message for alert in alerts]
                alert_summaries.append(" | ".join(messages))

                # Store detailed alerts (optional, for API / DB later)
                for alert in alerts:
                    all_alerts.append({
                        "row": int(i),
                        "level": alert.level,
                        "zone": alert.zone,
                        "stress_index": alert.stress_index,
                        "message": alert.message,
                    })

        df["alerts"] = alert_summaries

        # ===============================
        # Save Output
        # ===============================
        os.makedirs("prediction_output", exist_ok=True)
        output_path = os.path.join("prediction_output", "output.csv")
        df.to_csv(output_path, index=False)

        # ===============================
        # Render Table
        # ===============================
        table_html = df.to_html(classes="table table-striped")

        return templates.TemplateResponse(
            "table.html",
            {"request": request, "table": table_html},
        )

    except Exception as e:
        raise NetworkSecurityException(e, sys)

@app.post("/simulate", tags=["simulation"])
async def simulate_route(
    request: Request,
    file: UploadFile = File(...),
    availability_change_pct: float = 0.0,
    demand_change_pct: float = 0.0,
):
    try:
        logging.info("Scenario simulation request received")

        # ===============================
        # Load CSV
        # ===============================
        df = pd.read_csv(file.file)

        if df.shape[0] == 0:
            return Response("Uploaded file is empty")

        # ===============================
        # Validate required columns
        # ===============================
        required_cols = [
            "Annual_Ground_Water_Draft_Total",
            "Net_Ground_Water_Availability",
        ]

        for col in required_cols:
            if col not in df.columns:
                raise Exception(f"Required column missing: {col}")

        # ===============================
        # Build scenario config
        # ===============================
        scenario = ScenarioConfig(
            availability_change_pct=availability_change_pct,
            demand_change_pct=demand_change_pct,
        )

        # ===============================
        # Run simulation row by row
        # ===============================
        old_stress = []
        old_zone = []
        new_stress = []
        new_zone = []
        new_demand_list = []
        new_availability_list = []
        scenario_alerts = []

        for _, row in df.iterrows():
            demand = float(row["Annual_Ground_Water_Draft_Total"])
            availability = float(row["Net_Ground_Water_Availability"])

            # ---- Before scenario ----
            decision_before = GroundwaterDecisionEngine.evaluate(
                demand=demand,
                availability=availability,
            )

            # ---- Apply scenario ----
            scenario_result = ScenarioSimulator.simulate(
                demand=demand,
                availability=availability,
                scenario=scenario,
            )

            # ---- After scenario ----
            decision_after = GroundwaterDecisionEngine.evaluate(
                demand=scenario_result.new_demand,
                availability=scenario_result.new_availability,
            )
            
            # Generate alerts for scenario result
            alerts_after = AlertEngine.generate_alerts(
                zone=decision_after.zone,
                stress_index=decision_after.stress_index
            )

            if len(alerts_after) == 0:
                alert_summary = "NO_ALERT"
            else:
                alert_summary = " | ".join([a.message for a in alerts_after])

            scenario_alerts.append(alert_summary)
            # Collect results
            old_stress.append(decision_before.stress_index)
            old_zone.append(decision_before.zone)

            new_stress.append(decision_after.stress_index)
            new_zone.append(decision_after.zone)

            new_demand_list.append(scenario_result.new_demand)
            new_availability_list.append(scenario_result.new_availability)

        # ===============================
        # Append results to dataframe
        # ===============================
        df["scenario_alerts"] = scenario_alerts
        df["old_stress_index"] = old_stress
        df["old_zone"] = old_zone

        df["scenario_new_demand"] = new_demand_list
        df["scenario_new_availability"] = new_availability_list

        df["new_stress_index"] = new_stress
        df["new_zone"] = new_zone

        # ===============================
        # Save Output
        # ===============================
        os.makedirs("prediction_output", exist_ok=True)
        output_path = os.path.join("prediction_output", "scenario_output.csv")
        df.to_csv(output_path, index=False)

        # ===============================
        # Render Table
        # ===============================
        table_html = df.to_html(classes="table table-striped")

        return templates.TemplateResponse(
            "table.html",
            {"request": request, "table": table_html},
        )

    except Exception as e:
        raise NetworkSecurityException(e, sys)

@app.post("/summary/zones", tags=["dashboard"])
async def zone_summary_route(file: UploadFile = File(...)):
    try:
        df = pd.read_csv(file.file)

        if "zone" not in df.columns:
            return Response("CSV must contain 'zone' column", status_code=400)

        summary = DashboardAggregator.zone_distribution(df)

        return summary

    except Exception as e:
        raise NetworkSecurityException(e, sys)

@app.post("/summary/stress", tags=["dashboard"])
async def stress_summary_route(file: UploadFile = File(...)):
    try:
        df = pd.read_csv(file.file)

        if "stress_index" not in df.columns:
            return Response("CSV must contain 'stress_index' column", status_code=400)

        summary = DashboardAggregator.stress_summary(df)

        return summary

    except Exception as e:
        raise NetworkSecurityException(e, sys)

@app.post("/summary/full", tags=["dashboard"])
async def full_dashboard_summary_route(file: UploadFile = File(...)):
    try:
        df = pd.read_csv(file.file)

        required_cols = ["zone", "stress_index"]
        for col in required_cols:
            if col not in df.columns:
                return Response(f"CSV must contain '{col}' column", status_code=400)

        summary = DashboardAggregator.full_summary(df)

        return summary

    except Exception as e:
        raise NetworkSecurityException(e, sys)


@app.post("/simulate/preset", tags=["simulation"])
async def simulate_preset_route(
    request: Request,
    file: UploadFile = File(...),
    scenario_type: str = "drought"
):
    try:
        logging.info(f"Preset scenario simulation requested: {scenario_type}")

        # ===============================
        # Validate scenario
        # ===============================
        if scenario_type not in PRESET_SCENARIOS:
            return Response(
                f"Invalid scenario_type. Available: {list(PRESET_SCENARIOS.keys())}",
                status_code=400
            )

        scenario = PRESET_SCENARIOS[scenario_type]

        # ===============================
        # Load CSV
        # ===============================
        df = pd.read_csv(file.file)

        if df.shape[0] == 0:
            return Response("Uploaded file is empty")

        # ===============================
        # Validate required columns
        # ===============================
        required_cols = [
            "Annual_Ground_Water_Draft_Total",
            "Net_Ground_Water_Availability",
        ]

        for col in required_cols:
            if col not in df.columns:
                raise Exception(f"Required column missing: {col}")

        # ===============================
        # Run simulation
        # ===============================
        old_zone = []
        old_stress = []
        new_zone = []
        new_stress = []
        alerts_list = []

        for _, row in df.iterrows():
            demand = float(row["Annual_Ground_Water_Draft_Total"])
            availability = float(row["Net_Ground_Water_Availability"])

            before = GroundwaterDecisionEngine.evaluate(demand, availability)

            scenario_result = ScenarioSimulator.simulate(
                demand=demand,
                availability=availability,
                scenario=scenario,
            )

            after = GroundwaterDecisionEngine.evaluate(
                scenario_result.new_demand,
                scenario_result.new_availability
            )

            alerts = AlertEngine.generate_alerts(after.zone, after.stress_index)

            if len(alerts) == 0:
                alert_summary = "NO_ALERT"
            else:
                alert_summary = " | ".join([a.message for a in alerts])

            old_zone.append(before.zone)
            old_stress.append(before.stress_index)
            new_zone.append(after.zone)
            new_stress.append(after.stress_index)
            alerts_list.append(alert_summary)

        # ===============================
        # Append
        # ===============================
        df["old_zone"] = old_zone
        df["old_stress_index"] = old_stress
        df["new_zone"] = new_zone
        df["new_stress_index"] = new_stress
        df["scenario_type"] = scenario_type
        df["alerts"] = alerts_list

        # ===============================
        # Save
        # ===============================
        os.makedirs("prediction_output", exist_ok=True)
        output_path = os.path.join("prediction_output", f"preset_{scenario_type}.csv")
        df.to_csv(output_path, index=False)

        table_html = df.to_html(classes="table table-striped")

        return templates.TemplateResponse(
            "table.html",
            {"request": request, "table": table_html},
        )

    except Exception as e:
        raise NetworkSecurityException(e, sys)
@app.post("/summary/by-district", tags=["dashboard"])
async def summary_by_district(file: UploadFile = File(...)):
    try:
        df = pd.read_csv(file.file)

        required_cols = ["district", "zone", "stress_index"]
        for col in required_cols:
            if col not in df.columns:
                return Response(f"CSV must contain '{col}' column", status_code=400)

        summary = DashboardAggregator.summary_by_region(df, region_col="district")

        return summary

    except Exception as e:
        raise NetworkSecurityException(e, sys)
@app.post("/summary/by-state", tags=["dashboard"])
async def summary_by_state(file: UploadFile = File(...)):
    try:
        df = pd.read_csv(file.file)

        required_cols = ["state", "zone", "stress_index"]
        for col in required_cols:
            if col not in df.columns:
                return Response(f"CSV must contain '{col}' column", status_code=400)

        summary = DashboardAggregator.summary_by_region(df, region_col="state")

        return summary

    except Exception as e:
        raise NetworkSecurityException(e, sys)
@app.post("/hotspots/top", tags=["hotspots"])
async def top_hotspots_route(
    file: UploadFile = File(...),
    region_col: str = "district",
    top_n: int = 10
):
    try:
        df = pd.read_csv(file.file)

        required_cols = [region_col, "zone", "stress_index"]
        for col in required_cols:
            if col not in df.columns:
                return Response(f"CSV must contain '{col}' column", status_code=400)

        hotspots = HotspotDetector.top_hotspots(
            df=df,
            region_col=region_col,
            top_n=top_n
        )

        return {
            "region_column": region_col,
            "top_n": top_n,
            "hotspots": hotspots
        }

    except Exception as e:
        raise NetworkSecurityException(e, sys)
@app.post("/trends/yearly", tags=["trends"])
async def yearly_trend_api(
    file: UploadFile = File(...),
    date_col: str = "Date",
    value_col: str = "Water_Level"
):
    try:
        df = pd.read_csv(file.file)

        for col in [date_col, value_col]:
            if col not in df.columns:
                return Response(f"CSV must contain '{col}' column", status_code=400)

        trend = TrendAnalyzer.yearly_trend(
            df=df,
            date_col=date_col,
            value_col=value_col,
        )

        return {
            "date_column": date_col,
            "value_column": value_col,
            "trend": trend
        }

    except Exception as e:
        raise NetworkSecurityException(e, sys)
@app.post("/trends/monthly", tags=["trends"])
async def monthly_trend_api(
    file: UploadFile = File(...),
    date_col: str = "Date",
    value_col: str = "Water_Level"
):
    try:
        df = pd.read_csv(file.file)

        for col in [date_col, value_col]:
            if col not in df.columns:
                return Response(f"CSV must contain '{col}' column", status_code=400)

        trend = TrendAnalyzer.monthly_trend(
            df=df,
            date_col=date_col,
            value_col=value_col,
        )

        return {
            "date_column": date_col,
            "value_column": value_col,
            "trend": trend
        }

    except Exception as e:
        raise NetworkSecurityException(e, sys)
@app.post("/trends/by-region", tags=["trends"])
async def trend_by_region_api(
    file: UploadFile = File(...),
    date_col: str = "Date",
    value_col: str = "Water_Level",
    region_col: str = "district"
):
    try:
        df = pd.read_csv(file.file)

        for col in [date_col, value_col, region_col]:
            if col not in df.columns:
                return Response(f"CSV must contain '{col}' column", status_code=400)

        trend = TrendAnalyzer.trend_by_region(
            df=df,
            date_col=date_col,
            value_col=value_col,
            region_col=region_col,
        )

        return {
            "region_column": region_col,
            "date_column": date_col,
            "value_column": value_col,
            "trend": trend
        }

    except Exception as e:
        raise NetworkSecurityException(e, sys)
@app.post("/map/geojson", tags=["map"])
async def geojson_map_api(
    file: UploadFile = File(...),
    lat_col: str = "LAT",
    lon_col: str = "LON"
):
    try:
        df = pd.read_csv(file.file)

        required_cols = [lat_col, lon_col, "zone", "stress_index"]
        for col in required_cols:
            if col not in df.columns:
                return Response(f"CSV must contain '{col}' column", status_code=400)

        geojson = GeoJSONBuilder.build_point_geojson(
            df=df,
            lat_col=lat_col,
            lon_col=lon_col
        )

        return geojson

    except Exception as e:
        raise NetworkSecurityException(e, sys)
@app.post("/report/policy-pdf", tags=["report"])
async def generate_policy_report_api(file: UploadFile = File(...)):
    try:
        df = pd.read_csv(file.file)

        required_cols = ["zone", "stress_index"]
        for col in required_cols:
            if col not in df.columns:
                return Response(f"CSV must contain '{col}' column", status_code=400)

        output_path = os.path.join("reports", "groundwater_policy_report.pdf")

        PDFReportGenerator.generate_policy_report(
            df=df,
            output_path=output_path,
            title="Real-Time Groundwater Decision Support Report"
        )

        return FileResponse(
            path=output_path,
            filename="groundwater_policy_report.pdf",
            media_type="application/pdf"
        )

    except Exception as e:
        raise NetworkSecurityException(e, sys)


# ===============================
# Run App
# ===============================
if __name__ == "__main__":
    app_run(app, host="0.0.0.0", port=8001)

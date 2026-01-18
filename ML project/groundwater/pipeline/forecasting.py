import os
import sys
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta

from groundwater.utils.main_utils.utils import load_object
from groundwater.exception.exception import GroundwaterException
from groundwater.logging.logger import logging
from groundwater.decision.decision_engine import GroundwaterDecisionEngine
from data_loader import get_latest_data

class ForecastingPipeline:
    def __init__(self):
        self.model_path = os.path.join("final_model", "model.pkl")
        self.model = None

    def load_model(self):
        if self.model is None:
            if not os.path.exists(self.model_path):
                raise Exception("Model not found. Please train the model first.")
            self.model = load_object(self.model_path)

    def predict_future(self, station_id=None, years=5, 
                       demand_change_pct=0.0, supply_change_pct=0.0):
        try:
            self.load_model()
            
            # 1. Get Start Point (Result is a dict)
            start_row = get_latest_data(station_id)
            if not start_row:
                raise Exception("No data available for this station to forecast from.")
            
            # Iterate
            # We forecast quarterly (every 3 months) or monthly? 
            # Dataset row says "Month" is 1, 5, 8, 11 -> Quarterly approx.
            # We will generate 4 points per year.
            
            steps = years * 4 
            predictions = []
            
            # Initial State
            current_state = start_row.copy()
            
            # Ensure safe numeric types
            current_state['Annual_Ground_Water_Draft_Total'] = float(current_state.get('Annual_Ground_Water_Draft_Total', 0))
            current_state['Net_Ground_Water_Availability'] = float(current_state.get('Net_Ground_Water_Availability', 0))
            current_state['Water_Level'] = float(current_state.get('Water_Level', 0))
            current_state['Water_Level_Lag1'] = float(current_state.get('Water_Level_Lag1', current_state['Water_Level'])) # Fallback
            
            # Start Date - Force 2025 start as per user request
            # We treat the latest data point as the "current state" for the 2025 projection
            current_date = datetime(2025, 1, 1)

            for step in range(steps):
                # Prepare DataFrame for Model
                input_df = pd.DataFrame([current_state])
                
                # Ensure Date is string (Model trained on CSV strings)
                if 'Date' in input_df.columns:
                    input_df['Date'] = input_df['Date'].astype(str)

                # Fix: Model expects Integer Month for median imputation, but data might have Strings 'May'
                # Map Month name to Integer 1-12
                month_map = {
                    'Jan': 1, 'Feb': 2, 'Mar': 3, 'Apr': 4, 'May': 5, 'Jun': 6,
                    'Jul': 7, 'Aug': 8, 'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dec': 12
                }
                
                if 'Month' in input_df.columns:
                    # If it's a string like "May", map it. If it's already int, keep it.
                    val = input_df['Month'].iloc[0]
                    if isinstance(val, str):
                        # Try mapping short name
                        if val in month_map:
                            input_df['Month'] = month_map[val]
                        # Try parsing if not in map? or just let it fail/impute
                    
                # Explicitly cast columns to float to avoid object dtype issues
                for col in ['Annual_Ground_Water_Draft_Total', 'Net_Ground_Water_Availability', 
                            'Water_Level', 'Water_Level_Lag1']:
                    if col in input_df.columns:
                        input_df[col] = pd.to_numeric(input_df[col], errors='coerce')
                
                # Predict Target (Next Level)
                predicted_target = self.model.predict(input_df)[0]
                
                # --- Update State for Next Step ---
                
                # 1. Shift Lag
                # Water_Level (T) becomes Lag1 (T+1)
                next_lag1 = current_state['Water_Level']
                
                # 2. Update Water Level
                # Target (predicted T+1) becomes Water_Level (T+1)
                next_water_level = float(predicted_target)
                
                # 3. Time Increment (3 months)
                next_date = current_date + relativedelta(months=3)
                next_year = next_date.year
                next_month = next_date.month 
                # Mapping month to dataset convention if needed (1,4,7,10 or 1,5,8,11?) 
                # Model handles integer month. We just pass exact month.

                # 4. Apply Growth to Demand/Supply
                # Rate is Annual. Quarterly rate ~= rate / 4
                d_growth = (demand_change_pct / 100.0) / 4.0
                s_growth = (supply_change_pct / 100.0) / 4.0
                
                next_demand = current_state['Annual_Ground_Water_Draft_Total'] * (1 + d_growth)
                next_supply = current_state['Net_Ground_Water_Availability'] * (1 + s_growth)
                
                # 5. Recalculate Stress & Zone
                decision = GroundwaterDecisionEngine.evaluate(next_demand, next_supply)
                
                # Create Next State Row
                next_state = current_state.copy()
                next_state['Date'] = next_date
                next_state['Year'] = next_year
                next_state['Month'] = next_month
                next_state['Water_Level'] = next_water_level
                next_state['Water_Level_Lag1'] = next_lag1
                next_state['Annual_Ground_Water_Draft_Total'] = next_demand
                next_state['Net_Ground_Water_Availability'] = next_supply
                next_state['Stress_Index'] = decision.stress_index
                # 'zone' might be needed if model uses it (likely encoded)
                next_state['zone'] = decision.zone
                
                 # Remove Target if it exists in state
                if 'Target' in next_state:
                    del next_state['Target']

                # Store prediction
                predictions.append({
                    "Year": next_year,
                    "Month": next_date.strftime("%b"), # Jan, Feb
                    "Date": next_date.strftime("%Y-%m-%d"),
                    "Water_Level": round(next_water_level, 2),
                    "Lower_Bound": round(next_water_level * 0.95, 2), # Mock confidence
                    "Upper_Bound": round(next_water_level * 1.05, 2),
                    "Demand": round(next_demand, 2),
                    "Supply": round(next_supply, 2),
                    "Stress_Index": round(decision.stress_index, 4),
                    "Zone": decision.zone
                })
                
                # Advance loop
                current_state = next_state
                current_date = next_date
                
            return predictions

        except Exception as e:
            raise GroundwaterException(e, sys)

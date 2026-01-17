from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.lib import colors
from datetime import datetime
import pandas as pd
import os
import matplotlib.pyplot as plt
import uuid

class PDFReportGenerator:

    @staticmethod
    def _generate_zone_pie_chart(df: pd.DataFrame, output_dir: str) -> str:
        zone_counts = df["zone"].value_counts()

        plt.figure(figsize=(5, 5))
        plt.pie(zone_counts.values, labels=zone_counts.index, autopct="%1.1f%%", startangle=140)
        plt.title("Zone Distribution")

        filename = f"zone_pie_{uuid.uuid4().hex}.png"
        path = os.path.join(output_dir, filename)

        plt.tight_layout()
        plt.savefig(path)
        plt.close()

        return path

    @staticmethod
    def _generate_stress_trend_chart(df: pd.DataFrame, output_dir: str) -> str:
        # If Date column exists, plot by date, else just index-wise
        if "Date" in df.columns:
            df_plot = df.copy()
            df_plot["Date"] = pd.to_datetime(df_plot["Date"])
            df_plot = df_plot.sort_values("Date")
            x = df_plot["Date"]
        else:
            x = range(len(df))

        y = df["stress_index"]

        plt.figure(figsize=(8, 4))
        plt.plot(x, y, linewidth=1)
        plt.title("Stress Index Trend")
        plt.xlabel("Time")
        plt.ylabel("Stress Index")
        plt.grid(True)

        filename = f"stress_trend_{uuid.uuid4().hex}.png"
        path = os.path.join(output_dir, filename)

        plt.tight_layout()
        plt.savefig(path)
        plt.close()

        return path

    @staticmethod
    def generate_policy_report(
        df: pd.DataFrame,
        output_path: str,
        title: str = "Groundwater Decision Support Report"
    ):
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        temp_dir = os.path.join(os.path.dirname(output_path), "tmp_charts")
        os.makedirs(temp_dir, exist_ok=True)

        doc = SimpleDocTemplate(output_path, pagesize=A4)
        styles = getSampleStyleSheet()

        story = []

        # ======================
        # Title
        # ======================
        story.append(Paragraph(title, styles["Title"]))
        story.append(Spacer(1, 12))
        story.append(Paragraph(f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", styles["Normal"]))
        story.append(Spacer(1, 12))

        # ======================
        # Summary
        # ======================
        total = len(df)
        zone_counts = df["zone"].value_counts().to_dict()

        story.append(Paragraph("Executive Summary", styles["Heading2"]))
        story.append(Spacer(1, 6))

        story.append(Paragraph(f"Total records analyzed: {total}", styles["Normal"]))

        for zone, count in zone_counts.items():
            pct = round((count / total) * 100, 2)
            story.append(Paragraph(f"{zone}: {count} ({pct}%)", styles["Normal"]))

        story.append(Spacer(1, 12))

        # ======================
        # Stress Stats
        # ======================
        story.append(Paragraph("Stress Index Statistics", styles["Heading2"]))
        story.append(Spacer(1, 6))

        avg_stress = round(df["stress_index"].mean(), 4)
        max_stress = round(df["stress_index"].max(), 4)
        min_stress = round(df["stress_index"].min(), 4)

        story.append(Paragraph(f"Average Stress Index: {avg_stress}", styles["Normal"]))
        story.append(Paragraph(f"Maximum Stress Index: {max_stress}", styles["Normal"]))
        story.append(Paragraph(f"Minimum Stress Index: {min_stress}", styles["Normal"]))

        story.append(Spacer(1, 12))

        # ======================
        # Charts Section
        # ======================
        story.append(Paragraph("Visual Analysis", styles["Heading2"]))
        story.append(Spacer(1, 12))

        # --- Pie Chart ---
        pie_path = PDFReportGenerator._generate_zone_pie_chart(df, temp_dir)
        story.append(Paragraph("Zone Distribution", styles["Heading3"]))
        story.append(Spacer(1, 6))
        story.append(Image(pie_path, width=300, height=300))
        story.append(Spacer(1, 12))

        # --- Line Chart ---
        trend_path = PDFReportGenerator._generate_stress_trend_chart(df, temp_dir)
        story.append(Paragraph("Stress Index Trend", styles["Heading3"]))
        story.append(Spacer(1, 6))
        story.append(Image(trend_path, width=400, height=200))
        story.append(Spacer(1, 12))

        # ======================
        # Critical Observations
        # ======================
        story.append(Paragraph("Critical Observations", styles["Heading2"]))
        story.append(Spacer(1, 6))

        critical_count = zone_counts.get("CRITICAL", 0) + zone_counts.get("OVER_EXPLOITED", 0)
        critical_pct = round((critical_count / total) * 100, 2)

        if critical_pct > 50:
            level = "SEVERE"
        elif critical_pct > 25:
            level = "HIGH RISK"
        elif critical_pct > 10:
            level = "MODERATE RISK"
        else:
            level = "STABLE"

        story.append(Paragraph(f"Critical + Over-Exploited Percentage: {critical_pct}%", styles["Normal"]))
        story.append(Paragraph(f"Overall Risk Level: {level}", styles["Normal"]))

        story.append(Spacer(1, 12))

        # ======================
        # Top 10 Table
        # ======================
        story.append(Paragraph("Top 10 Highest Stress Records", styles["Heading2"]))
        story.append(Spacer(1, 6))

        top10 = df.sort_values("stress_index", ascending=False).head(10)

        table_data = [["Index", "Stress Index", "Zone"]]

        for i, row in top10.iterrows():
            table_data.append([str(i), str(round(row["stress_index"], 4)), str(row["zone"])])

        table = Table(table_data)
        table.setStyle(TableStyle([
            ("BACKGROUND", (0,0), (-1,0), colors.lightgrey),
            ("GRID", (0,0), (-1,-1), 1, colors.black),
        ]))

        story.append(table)

        # ======================
        # Build PDF
        # ======================
        doc.build(story)

        # ======================
        # Cleanup temp images
        # ======================
        try:
            for f in os.listdir(temp_dir):
                os.remove(os.path.join(temp_dir, f))
            os.rmdir(temp_dir)
        except:
            pass

        return output_path

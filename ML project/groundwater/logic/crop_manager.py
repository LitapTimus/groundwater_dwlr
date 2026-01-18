
import pandas as pd

# Mock Crop Database with Water Requirements (mm per season)
CROP_DB = {
    "Kharif": [
        {"name": "Rice (Paddy)", "water_mm": 1200, "yield_per_acre": "25-30 quintals", "market_price": "2200/q"},
        {"name": "Maize", "water_mm": 500, "yield_per_acre": "20-25 quintals", "market_price": "1900/q"},
        {"name": "Cotton", "water_mm": 700, "yield_per_acre": "8-12 quintals", "market_price": "6000/q"},
        {"name": "Sugarcane", "water_mm": 1500, "yield_per_acre": "300-400 quintals", "market_price": "350/q"},
        {"name": "Pulses (Moong)", "water_mm": 300, "yield_per_acre": "4-6 quintals", "market_price": "7000/q"}
    ],
    "Rabi": [
        {"name": "Wheat", "water_mm": 450, "yield_per_acre": "18-22 quintals", "market_price": "2125/q"},
        {"name": "Mustard", "water_mm": 250, "yield_per_acre": "6-8 quintals", "market_price": "5000/q"},
        {"name": "Gram (Chana)", "water_mm": 300, "yield_per_acre": "8-10 quintals", "market_price": "5200/q"},
        {"name": "Vegetables", "water_mm": 400, "yield_per_acre": "Variable", "market_price": "High"}
    ]
}

class CropManager:
    @staticmethod
    def get_recommendations(season, acres, soil_type, water_level_m=None):
        """
        Returns a list of recommended crops with total water budget.
        Filters out water-intensive crops if groundwater depth is critical (>20m).
        """
        if season not in CROP_DB:
            return []

        recommendations = []
        base_crops = CROP_DB[season]

        # Dynamic Rule: If water level is deep (>15m), avoid high water crops
        exclude_high_water = False
        warning_message = None
        
        if water_level_m and water_level_m > 15:
            exclude_high_water = True
            warning_message = "Due to low groundwater levels (>15m), water-intensive crops are not recommended."

        for crop in base_crops:
            water_need = crop['water_mm']
            
            # Filter logic
            if exclude_high_water and water_need > 800:
                continue

            # Simple water budget calculation (total liters for the acres)
            # 1 mm over 1 acre = 4046.86 liters
            total_liters = water_need * acres * 4047 
            
            recommendations.append({
                "crop": crop['name'],
                "water_req_mm": water_need,
                "total_water_liters": round(total_liters),
                "estimated_yield": crop['yield_per_acre'],
                "market_price": crop['market_price'],
                "suitability": "High" if soil_type == "Alluvial" else "Medium",
                "warning": warning_message if exclude_high_water else None
            })
            
        return recommendations

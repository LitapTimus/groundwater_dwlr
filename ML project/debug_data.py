import sys
import pandas as pd
import data_loader

print("--- Testing load_dataset ---")
try:
    df = data_loader.load_dataset()
    print(f"Dataset Shape: {df.shape}")
    print(f"Columns: {df.columns.tolist()}")
    print("Head(1):")
    print(df.head(1).T)
except Exception as e:
    print(f"FAIL load_dataset: {e}")

print("\n--- Testing get_water_level_trend ---")
try:
    trend = data_loader.get_water_level_trend()
    print(f"Trend Data (first 3): {trend[:3]}")
    if not trend:
        print("WARNING: Trend data is EMPTY")
except Exception as e:
    print(f"FAIL get_water_level_trend: {e}")

print("\n--- Testing get_stations_list ---")
try:
    stations = data_loader.get_stations_list()
    print(f"Stations found: {len(stations)}")
    print(f"First station: {stations[0] if stations else 'None'}")
except Exception as e:
    print(f"FAIL get_stations_list: {e}")

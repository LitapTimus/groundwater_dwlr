import pandas as pd
import json
import data_loader

print("--- Testing get_seasonal_pattern serialization ---")
try:
    data = data_loader.get_seasonal_pattern(station_id=None)
    # Simulate API response serialization with strict compliance (Starlette/FastAPI default effectively)
    json_output = json.dumps(data, allow_nan=False)
    print("Serialization SUCCESS")
    print(data) # Print full data to check Month names
except Exception as e:
    print("Serialization FAILED")
    print(e)

import pandas as pd

print("--- Inspecting File Raw Content ---")
with open("dataset.csv", "rb") as f:
    # Read first 100 bytes to check for BOM or weird chars
    header_bytes = f.read(100)
    print(f"First 100 bytes: {header_bytes}")
    print(f"Decoded (utf-8): {header_bytes.decode('utf-8', errors='replace')}")

print("\n--- Pandas Read Test ---")
try:
    # Try default
    df = pd.read_csv("dataset.csv")
    print(f"Default Read - Columns[0]: {df.columns[0]}")
    
    # Try explicit header=0
    df0 = pd.read_csv("dataset.csv", header=0)
    print(f"Header=0 Read - Columns[0]: {df0.columns[0]}")
    
    # Try header=None
    df_none = pd.read_csv("dataset.csv", header=None)
    print(f"Header=None Read - Row 0 Col 0: {df_none.iloc[0,0]}")
    
except Exception as e:
    print(e)

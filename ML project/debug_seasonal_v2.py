import pandas as pd
import data_loader

print("--- Deep Debug Seasonal Logic ---")

# 1. Load Data
df = data_loader.load_dataset()
print(f"Month Column valid? {'Month' in df.columns}")
if 'Month' not in df.columns:
    print("EXIT: Month column missing")
    exit()

month_col = df['Month']
print(f"Dtype: {month_col.dtype}")
print(f"Unique values: {month_col.unique()}")

# 2. Simulate Logic
print("\n--- Simulating Mapping ---")
temp_df = df.copy()

month_map = {
    1: 'Jan', 2: 'Feb', 3: 'Mar', 4: 'Apr', 5: 'May', 6: 'Jun', 
    7: 'Jul', 8: 'Aug', 9: 'Sep', 10: 'Oct', 11: 'Nov', 12: 'Dec'
}

# Check direct map
mapped_numeric = temp_df['Month'].map(month_map)
print(f"Mapping if numeric keys used: {mapped_numeric.dropna().unique()}")

# Check string map just in case
month_map_str = {str(k): v for k,v in month_map.items()}
mapped_str = temp_df['Month'].astype(str).map(month_map_str)
print(f"Mapping if string keys used: {mapped_str.dropna().unique()}")

# 3. Test Actual Function Path
print("\n--- Testing Logic Block ---")
if 'Month' in temp_df.columns and temp_df['Month'].nunique() > 1:
    print("Entered IF block")
    
    is_numeric = pd.api.types.is_numeric_dtype(temp_df['Month'])
    print(f"Is Numeric? {is_numeric}")
    
    if is_numeric:
        temp_df['Month'] = temp_df['Month'].map(month_map)
        print("Applied Numeric Map")
    else:
        print("Skipped Numeric Map (Dtype is not numeric)")
    
    print(f"Values after map block: {temp_df['Month'].unique()}")
    
    # Categorical
    month_order = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    temp_df['Month'] = pd.Categorical(temp_df['Month'], categories=month_order, ordered=True)
    
    print(f"Values after Categorical: {temp_df['Month'].unique()}")
    
    # Groupby
    trend = temp_df.groupby('Month')['Water_Level'].mean().reset_index()
    print("Trend Head:")
    print(trend.head(12))

else:
    print("Entered ELSE block")

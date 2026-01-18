import pandas as pd
import data_loader

print("--- Inspecting Date and Month columns ---")
try:
    df = data_loader.load_dataset()
    print("Columns:", df.columns.tolist())
    
    if 'Date' in df.columns:
        print("\nDate Column Sample (first 10):")
        print(df['Date'].head(10).tolist())
        
    if 'Month' in df.columns:
        print("\nMonth Column Sample (first 10):")
        print(df['Month'].head(10).tolist())
        print("\nUnique Months:", df['Month'].unique())
        
    # Check if we have col_5 if Month isn't named explicitly (though load_dataset should have named it)
    
except Exception as e:
    print(e)

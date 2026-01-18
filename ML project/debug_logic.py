import pandas as pd
import data_loader

print("--- Inspecting Data Values ---")
try:
    df = data_loader.load_dataset()
    
    cols = ['Annual_Ground_Water_Draft_Total', 'Net_Ground_Water_Availability', 'Water_Level', 'Stress_Index']
    # Check which actually exist (or mapped defaults)
    existing_cols = [c for c in cols if c in df.columns]
    
    print(f"Columns found: {existing_cols}")
    
    sample = df[existing_cols].head(10)
    print("\nSample Data (First 10 rows):")
    print(sample)
    
    print("\n--- Statistics ---")
    desc = df[existing_cols].describe()
    print(desc)
    
    # Check consistency of Stress Index
    # Is Stress ~ Demand / Supply ?
    if 'Annual_Ground_Water_Draft_Total' in df.columns and 'Net_Ground_Water_Availability' in df.columns and 'Stress_Index' in df.columns:
        # Avoid zero division
        df_safe = df[df['Net_Ground_Water_Availability'] > 0].copy()
        
        # Calculate derived stress (ratio)
        df_safe['Calculated_Stress'] = df_safe['Annual_Ground_Water_Draft_Total'] / df_safe['Net_Ground_Water_Availability']
        
        # Check correlation
        corr = df_safe['Calculated_Stress'].corr(df_safe['Stress_Index'])
        print(f"\nCorrelation between (Demand/Supply) and Stress_Index: {corr}")
        
        print("\nSample Comparisons (Calculated vs Actual):")
        print(df_safe[['Annual_Ground_Water_Draft_Total', 'Net_Ground_Water_Availability', 'Calculated_Stress', 'Stress_Index']].head(10))

except Exception as e:
    print(e)

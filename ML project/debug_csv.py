import pandas as pd
try:
    df = pd.read_csv("dataset.csv")
    print("Columns:", list(df.columns))
    print("First row:", df.iloc[0].tolist())
except Exception as e:
    print(e)

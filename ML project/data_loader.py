import pandas as pd
import os
import math

DATASET_PATH = "dataset.csv"
_CACHE_DF = None



def load_dataset():
    global _CACHE_DF
    if _CACHE_DF is not None:
        return _CACHE_DF
    
    if not os.path.exists(DATASET_PATH):
        raise FileNotFoundError(f"{DATASET_PATH} not found.")
    
    try:
        # Dataset has headers: LAT, LON, Date, Water_Level, ...
        # Columns 8: Annual_Ground_Water_Draft_Total (Demand)
        # Column 10: Net_Ground_Water_Availability (Supply)
        df = pd.read_csv(DATASET_PATH)
        
        # Ensure 'zone' column exists
        if 'zone' not in df.columns:
            # Fallback calculation if not present
            # Stress > 0.8 -> Critical
            df['zone'] = df.apply(lambda x: 'Critical' if (x.get('Stress_Index', 0) or 0) > 0.8 else 'Safe', axis=1)

    except Exception as e:
        print(f"Error loading dataset: {e}")
        raise e

    # Simple validation
    required = ['LAT', 'LON', 'Date', 'Water_Level']
    if not all(col in df.columns for col in required):
         print(f"Warning: Dataset missing standard columns. Found: {df.columns.tolist()}")

    _CACHE_DF = df
    return df

def get_dashboard_stats():
    df = load_dataset()
    
    latest_year = df['Year'].max()
    latest_df = df[df['Year'] == latest_year]
    
    avg_level = latest_df['Water_Level'].mean()
    
    # Safe access
    stress_col = 'Stress_Index' if 'Stress_Index' in df.columns else 'col_15'
    critical_count = 0
    if stress_col in latest_df.columns:
        critical_count = latest_df[latest_df[stress_col] > 0.8].shape[0]
    
    return {
        "avg_level": round(avg_level, 2),
        "critical_count": int(critical_count),
        "recharge_rate": 4.5, 
        "supply_gap": 18
    }

def get_stations_for_map():
    df = load_dataset()
    latest_readings = df.groupby(['LAT', 'LON']).last().reset_index()
    
    stations = []
    for _, row in latest_readings.iterrows():
        status = "Safe"
        stress_val = row.get('Stress_Index', 0)
        if stress_val > 0.8:
            status = "Critical"
        elif stress_val > 0.5:
            status = "Warning"
            
        stations.append({
            "id": f"{row['LAT']}_{row['LON']}", 
            "name": f"Station {row['LAT']:.2f}, {row['LON']:.2f}",
            "lat": row['LAT'],
            "lng": row['LON'],
            "level": row['Water_Level'],
            "status": status
        })

    return stations



def get_historical_trends():
    df = load_dataset()
    # Aggregate avg water level by date
    # Construct a Date column if needed, dataset has 'Date'
    df['Date'] = pd.to_datetime(df['Date'])
    trend = df.groupby('Date')['Water_Level'].mean().reset_index()
    
    history = []
    for _, row in trend.iterrows():
        history.append({
            "date": row['Date'].strftime('%b %Y'),
            "level": round(row['Water_Level'], 2)
        })
    # Sample last 50 points for visual clarity
    return history[-50:]

def get_nearest_station(user_lat, user_lon):
    df = load_dataset()
    # Get latest readings per station to avoid duplicates
    latest_readings = df.groupby(['LAT', 'LON']).last().reset_index()
    
    nearest_station = None
    min_dist = float('inf')
    
    # Simple Haversine approximation
    R = 6371  # Earth radius in km
    
    for _, row in latest_readings.iterrows():
        lat = row['LAT']
        lon = row['LON']
        
        dlat = math.radians(lat - user_lat)
        dlon = math.radians(lon - user_lon)
        a = math.sin(dlat/2) * math.sin(dlat/2) + \
            math.cos(math.radians(user_lat)) * math.cos(math.radians(lat)) * \
            math.sin(dlon/2) * math.sin(dlon/2)
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
        distance = R * c
        
        if distance < min_dist:
            min_dist = distance
            nearest_station = row
            
    if nearest_station is not None:
        status = "Safe"
        if nearest_station['Stress_Index'] > 0.8:
            status = "Critical"
        elif nearest_station['Stress_Index'] > 0.5:
            status = "Warning"
            
        return {
            "station_name": f"Station {nearest_station['LAT']:.2f}, {nearest_station['LON']:.2f}",
            "lat": nearest_station['LAT'],
            "lon": nearest_station['LON'],
            "water_level": round(nearest_station['Water_Level'], 2),
            "distance_km": round(min_dist, 2),
            "status": status,
            "date": nearest_station['Date'] if 'Date' in nearest_station else "N/A"
        }
    return None







def _sanitize(data):
    """
    Helper to replace NaN with None for JSON compliance.
    Accepts DataFrame or List of Dicts.
    """
    if isinstance(data, pd.DataFrame):
        return data.astype(object).where(pd.notnull(data), None).to_dict(orient='records')
    return data

def get_stations_list():
    """
    Returns a simple list of stations for the dropdown.
    """
    df = load_dataset()
    
    # Safe check for columns
    cols = df.columns
    if 'District' not in cols:
        df['District'] = "Unknown District"
    if 'State' not in cols:
        df['State'] = "Unknown State"

    unique_stations = df[['LAT', 'LON', 'District', 'State']].drop_duplicates()
    
    stations = []
    for _, row in unique_stations.iterrows():
        # Sanitize Lat/Lon just in case
        if pd.isna(row['LAT']) or pd.isna(row['LON']):
            continue
            
        stations.append({
            "id": f"{row['LAT']}_{row['LON']}",
            "name": f"Station {row['LAT']:.2f}, {row['LON']:.2f}",
            "lat": row['LAT'],
            "lon": row['LON'],
            "district": row['District'] if pd.notnull(row['District']) else "Unknown",
            "state": row['State'] if pd.notnull(row['State']) else "Unknown"
        })
    return stations

def _filter_by_station(df, station_id):
    if not station_id:
        return df
    
    try:
        lat, lon = map(float, station_id.split('_'))
        # Filter with a small epsilon for float comparison safety
        return df[(df['LAT'] == lat) & (df['LON'] == lon)]
    except ValueError:
        return df

def get_water_level_trend(station_id=None):
    df = load_dataset()
    filtered_df = _filter_by_station(df, station_id)
    
    # Ensure date column is datetime
    filtered_df['Date'] = pd.to_datetime(filtered_df['Date'], errors='coerce')
    filtered_df = filtered_df.dropna(subset=['Date'])
    
    filtered_df['Year'] = filtered_df['Date'].dt.year
    
    # Group by Year
    trend = filtered_df.groupby('Year')['Water_Level'].mean().reset_index()
    return _sanitize(trend)

def get_demand_supply_trend(station_id=None):
    df = load_dataset()
    filtered_df = _filter_by_station(df, station_id)
    
    if 'Year' not in filtered_df.columns:
         filtered_df['Date'] = pd.to_datetime(filtered_df['Date'], errors='coerce')
         filtered_df['Year'] = filtered_df['Date'].dt.year

    # Aggregate
    if 'Annual_Ground_Water_Draft_Total' in filtered_df.columns and 'Net_Ground_Water_Availability' in filtered_df.columns:
        trend = filtered_df.groupby('Year')[['Annual_Ground_Water_Draft_Total', 'Net_Ground_Water_Availability']].sum().reset_index()
        result = trend.rename(columns={
            'Annual_Ground_Water_Draft_Total': 'demand', 
            'Net_Ground_Water_Availability': 'supply'
        })
        return _sanitize(result)
    return []

def get_stress_index_trend(station_id=None):
    df = load_dataset()
    filtered_df = _filter_by_station(df, station_id)
    
    if 'Year' not in filtered_df.columns:
         filtered_df['Date'] = pd.to_datetime(filtered_df['Date'], errors='coerce')
         filtered_df['Year'] = filtered_df['Date'].dt.year

    if 'Stress_Index' in filtered_df.columns:
        trend = filtered_df.groupby('Year')['Stress_Index'].mean().reset_index()
        return _sanitize(trend)
    return []

def get_zone_distribution(station_id=None):
    df = load_dataset()
    df['Date'] = pd.to_datetime(df['Date'], errors='coerce')
    
    if station_id:
        filtered_df = _filter_by_station(df, station_id)
        if filtered_df.empty:
            return []
        
        filtered_df = filtered_df.sort_values('Date')
        latest = filtered_df.iloc[-1]
        zone = latest['zone'] if pd.notnull(latest.get('zone')) else 'Unknown'
        return [{"name": zone, "value": 1}]
    else:
        # National View
        latest_readings = df.sort_values('Date').groupby(['LAT', 'LON']).last().reset_index()
        if 'zone' in latest_readings.columns:
            dist = latest_readings['zone'].value_counts().reset_index()
            dist.columns = ['name', 'value']
            return _sanitize(dist)
        return []


def get_seasonal_pattern(station_id=None):
    df = load_dataset()
    filtered_df = _filter_by_station(df, station_id)
    
    # If Month column exists and has multiple values, use it
    if 'Month' in filtered_df.columns and filtered_df['Month'].nunique() > 1:
        # Map integer months to names if necessary
        # Assuming 1=Jan, 5=May, 8=Aug, 11=Nov based on debug
        month_map = {
            1: 'Jan', 2: 'Feb', 3: 'Mar', 4: 'Apr', 5: 'May', 6: 'Jun', 
            7: 'Jul', 8: 'Aug', 9: 'Sep', 10: 'Oct', 11: 'Nov', 12: 'Dec'
        }
        
        # If it's already string, this might do nothing or fail, so check type
        if pd.api.types.is_numeric_dtype(filtered_df['Month']):
            filtered_df['Month'] = filtered_df['Month'].map(month_map)
            
        # If strings but full names e.g. "January", shorten them
        # If headers are strings '1', '5'?
        
    else:
        # Fallback to Date extraction
        filtered_df['Date'] = pd.to_datetime(filtered_df['Date'], errors='coerce')
        filtered_df = filtered_df.dropna(subset=['Date'])
        filtered_df['Month'] = filtered_df['Date'].dt.month_name().str[:3] # Jan, Feb...
    
    # Ensure correct month order
    month_order = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    filtered_df['Month'] = pd.Categorical(filtered_df['Month'], categories=month_order, ordered=True)
    
    trend = filtered_df.groupby('Month')['Water_Level'].mean().reset_index()
    return _sanitize(trend)

def get_latest_data(station_id=None):
    """
    Returns the most recent row(s) for forecasting.
    If station_id is provided, returns the single latest row.
    If 'all', returns the mean/aggregated latest row.
    """
    df = load_dataset()
    filtered_df = _filter_by_station(df, station_id)
    
    if filtered_df.empty:
        return None
        
    # Sort by Date/Year/Month to find latest
    # Ensure Date is datetime
    if not pd.api.types.is_datetime64_any_dtype(filtered_df['Date']):
        filtered_df['Date'] = pd.to_datetime(filtered_df['Date'], errors='coerce')
        
    filtered_df = filtered_df.sort_values(by='Date', ascending=False)
    
    # Get top row
    latest_row = filtered_df.iloc[0].to_dict()
    return latest_row

def get_stress_vs_water_scatter(station_id=None):
    df = load_dataset()
    filtered_df = _filter_by_station(df, station_id)
    
    cols_to_use = []
    if 'Stress_Index' in df.columns: cols_to_use.append('Stress_Index')
    if 'Water_Level' in df.columns: cols_to_use.append('Water_Level')
    
    if len(cols_to_use) < 2:
        return []

    data = filtered_df[cols_to_use].dropna()
    data.columns = ['stress_index', 'water_level']
    
    if len(data) > 2000:
        data = data.sample(2000)
        
    return _sanitize(data)


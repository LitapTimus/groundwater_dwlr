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
    
    df = pd.read_csv(DATASET_PATH)
    _CACHE_DF = df
    return df

def get_dashboard_stats():
    df = load_dataset()
    
    # Latest data (assuming dataset is sorted or has dates, we take a snapshot)
    # For a real app, we might filter by the latest Year/Month available in data
    latest_year = df['Year'].max()
    latest_df = df[df['Year'] == latest_year]
    
    avg_level = latest_df['Water_Level'].mean()
    
    # Classify Critical
    # Stress Index > 0.5 can be considered Warning, > 0.8 Critical (adjust logic as needed)
    critical_count = latest_df[latest_df['Stress_Index'] > 0.8].shape[0]
    
    return {
        "avg_level": round(avg_level, 2),
        "critical_count": int(critical_count),
        "recharge_rate": 4.5, # Placeholder or calculated if column exists
        "supply_gap": 18      # Placeholder
    }

def get_stations_for_map():
    df = load_dataset()
    # Get unique stations (approx by Lat/Lon) and their latest reading
    # Sort by date usually, but here we just take the last occurrence for simplicity
    latest_readings = df.groupby(['LAT', 'LON']).last().reset_index()
    
    stations = []
    for _, row in latest_readings.iterrows():
        status = "Safe"
        if row['Stress_Index'] > 0.8:
            status = "Critical"
        elif row['Stress_Index'] > 0.5:
            status = "Warning"
            
        stations.append({
            "id": f"{row['LAT']}_{row['LON']}",  # Unique ID
            "name": f"Station {row['LAT']:.2f}, {row['LON']:.2f}",
            "lat": row['LAT'],
            "lng": row['LON'],
            "level": row['Water_Level'],
            "status": status
        })

    return stations # Return all stations


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


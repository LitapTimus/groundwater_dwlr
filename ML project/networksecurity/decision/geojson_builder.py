import pandas as pd

class GeoJSONBuilder:

    ZONE_COLORS = {
        "SAFE": "#2ecc71",            # Green
        "SEMI_CRITICAL": "#f1c40f",    # Yellow
        "CRITICAL": "#e67e22",         # Orange
        "OVER_EXPLOITED": "#e74c3c",   # Red
    }

    @staticmethod
    def build_point_geojson(
        df: pd.DataFrame,
        lat_col: str = "LAT",
        lon_col: str = "LON",
    ) -> dict:

        features = []

        for _, row in df.iterrows():
            lat = float(row[lat_col])
            lon = float(row[lon_col])

            zone = str(row.get("zone", "UNKNOWN"))
            stress = float(row.get("stress_index", 0))

            color = GeoJSONBuilder.ZONE_COLORS.get(zone, "#95a5a6")

            feature = {
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [lon, lat],
                },
                "properties": {
                    "zone": zone,
                    "stress_index": stress,
                    "color": color,
                }
            }

            features.append(feature)

        return {
            "type": "FeatureCollection",
            "features": features
        }

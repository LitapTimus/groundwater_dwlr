import urllib.request
import json
import urllib.parse

url = "http://localhost:8001/api/predict/forecast"

def test_endpoint(name, params):
    print(f"\n--- Testing {name} ---")
    try:
        query_string = urllib.parse.urlencode(params)
        full_url = f"{url}?{query_string}"
        
        with urllib.request.urlopen(full_url) as response:
            if response.status == 200:
                data = json.loads(response.read().decode())
                print(f"Success! Received {len(data)} data points.")
                if len(data) > 0:
                    print("First point sample:")
                    print(json.dumps(data[0], indent=2))
                    print("Last point sample:")
                    print(json.dumps(data[-1], indent=2))
            else:
                print(f"Failed. Status: {response.status}")
                
    except Exception as e:
        print(f"Test Failed: {e}")

# Test 1: Default
test_endpoint("Forecast (Default)", {"years": 1})

# Test 2: High Demand
test_endpoint("Forecast (High Demand)", {"years": 1, "demand_change_pct": 5.0})

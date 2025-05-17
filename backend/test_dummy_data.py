import requests

# Test the dummy data endpoint
try:
    response = requests.post("http://localhost:8002/quests/dummy-data")
    print(f"Status code: {response.status_code}")
    try:
        print(f"Response: {response.json()}")
    except Exception as e:
        print(f"Error parsing JSON: {e}")
        print(f"Response text: {response.text}")
except Exception as e:
    print(f"Request error: {e}") 
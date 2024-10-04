import requests
import json

def fetch_matches():
    url = "http://localhost:3000/api/ml/matches"
    response = requests.get(url)
    
    if response.status_code == 200:
        data = response.json()
        return data
    else:
        print(f"Failed to fetch matches. Status code: {response.status_code}")
        return None

matches = fetch_matches()

if matches:
    print(f"Successfully fetched {len(matches)} matches.")
    # Example of accessing the first match data
    if matches:
        first_match = matches[0]
        print("First match data:")
        print(f"Item counts: {first_match['itemCounts']}")
        print(f"Winner side: {first_match['winnerSide']}")
else:
    print("No matches data available.")

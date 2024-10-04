import requests
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report

def fetch_matches():
    url = "http://localhost:3000/api/ml/matches"
    response = requests.get(url)
    
    if response.status_code == 200:
        data = response.json()
        return data
    else:
        print(f"Failed to fetch matches. Status code: {response.status_code}")
        return None

def prepare_data(matches):
    X = []  # Input features (item counts)
    y = []  # Output labels (winner side)
    
    for match in matches:
        # Flatten the item counts for both sides into a single feature vector
        feature_vector = np.array(match['itemCounts']).flatten()
        X.append(feature_vector)
        y.append(match['winnerSide'])
    
    return np.array(X), np.array(y)

def train_model(X, y):
    # Split the data into training and testing sets
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Create and train the logistic regression model
    model = LogisticRegression(random_state=42)
    model.fit(X_train, y_train)
    
    # Make predictions on the test set
    y_pred = model.predict(X_test)
    
    # Calculate and print the accuracy
    accuracy = accuracy_score(y_test, y_pred)
    print(f"Model accuracy: {accuracy:.2f}")
    
    # Print detailed classification report
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))
    
    return model

def main():
    matches = fetch_matches()
    
    if matches:
        print(f"Successfully fetched {len(matches)} matches.")
        
        X, y = prepare_data(matches)
        model = train_model(X, y)
        
        # Example prediction
        if len(matches) > 0:
            example_match = matches[0]
            example_input = np.array(example_match['itemCounts']).flatten().reshape(1, -1)
            prediction = model.predict(example_input)
            print(f"\nExample prediction:")
            print(f"Input item counts: {example_match['itemCounts']}")
            print(f"Predicted winner side: {prediction[0]}")
            print(f"Actual winner side: {example_match['winnerSide']}")
    else:
        print("No matches data available.")

if __name__ == "__main__":
    main()


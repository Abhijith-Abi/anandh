import os
import json
import numpy as np
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_recall_fscore_support

def generate_synthetic_data(n_samples=1200, random_state=42):
    """
    Generates realistic, correlated academic data.
    """
    np.random.seed(random_state)
    
    # Generate latent variables representing student's general performance capability/motivation
    # ranging from 0 (very poor) to 1 (outstanding)
    capability = np.random.beta(a=3, b=3, size=n_samples) # centered around 0.5
    
    # Correlate features with capability, adding reasonable noise
    attendance = 50 + capability * 48 + np.random.normal(0, 3, n_samples)
    attendance = np.clip(attendance, 40, 100)
    
    study_hours = 2 + capability * 28 + np.random.normal(0, 2, n_samples)
    study_hours = np.clip(study_hours, 1, 35)
    
    internal_marks = 30 + capability * 65 + np.random.normal(0, 5, n_samples)
    internal_marks = np.clip(internal_marks, 0, 100)
    
    assignment_marks = 35 + capability * 60 + np.random.normal(0, 5, n_samples)
    assignment_marks = np.clip(assignment_marks, 0, 100)
    
    quiz_marks = 25 + capability * 70 + np.random.normal(0, 6, n_samples)
    quiz_marks = np.clip(quiz_marks, 0, 100)
    
    gpa = 3.0 + capability * 6.5 + np.random.normal(0, 0.4, n_samples)
    gpa = np.clip(gpa, 2.0, 10.0)
    
    # Calculate an overall performance index score
    score = (
        (attendance * 0.15) + 
        (internal_marks * 0.25) + 
        (assignment_marks * 0.20) + 
        (quiz_marks * 0.15) + 
        (study_hours * 2.0) + 
        (gpa * 10.0)
    )
    
    # Map score to target categories
    # Excellent >= 200, Good >= 160, Average >= 115, Poor < 115
    grades = []
    for s in score:
        if s >= 195:
            grades.append('Excellent')
        elif s >= 155:
            grades.append('Good')
        elif s >= 110:
            grades.append('Average')
        else:
            grades.append('Poor')
            
    df = pd.DataFrame({
        'attendance': attendance,
        'internal_marks': internal_marks,
        'assignment_marks': assignment_marks,
        'quiz_marks': quiz_marks,
        'study_hours': study_hours,
        'gpa': gpa,
        'grade': grades
    })
    
    return df

def train_model():
    print("Generating synthetic student data...")
    df = generate_synthetic_data()
    
    # Features and labels
    X = df[['attendance', 'internal_marks', 'assignment_marks', 'quiz_marks', 'study_hours', 'gpa']]
    y = df['grade']
    
    # Split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    # Standardize
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Train Random Forest
    print("Training Random Forest Classifier...")
    model = RandomForestClassifier(n_estimators=100, random_state=42, max_depth=12)
    model.fit(X_train_scaled, y_train)
    
    # Evaluate
    y_pred = model.predict(X_test_scaled)
    
    accuracy = accuracy_score(y_test, y_pred)
    precision, recall, f1, _ = precision_recall_fscore_support(y_test, y_pred, average='weighted')
    
    metrics = {
        'accuracy': round(float(accuracy), 4),
        'precision': round(float(precision), 4),
        'recall': round(float(recall), 4),
        'f1_score': round(float(f1), 4)
    }
    
    print(f"Model evaluation complete: {metrics}")
    
    # Ensure save directory exists
    ml_dir = os.path.dirname(os.path.abspath(__file__))
    os.makedirs(ml_dir, exist_ok=True)
    
    # Save scaler and classifier
    joblib.dump(scaler, os.path.join(ml_dir, 'scaler.joblib'))
    joblib.dump(model, os.path.join(ml_dir, 'classifier.joblib'))
    
    # Save metrics JSON
    with open(os.path.join(ml_dir, 'metrics.json'), 'w') as f:
        json.dump(metrics, f, indent=4)
        
    print(f"Artifacts successfully saved in {ml_dir}")
    return metrics

if __name__ == '__main__':
    train_model()

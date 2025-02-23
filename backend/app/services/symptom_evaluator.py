class SymptomEvaluator:
    # Severity levels: 1 (Minor) to 5 (Critical)
    SYMPTOM_SEVERITY = {
        # Cardiovascular
        'chest pain': 5,
        'heart palpitations': 4,
        'shortness of breath': 4,
        'dizziness': 3,
        
        # Neurological
        'severe headache': 4,
        'confusion': 4,
        'seizure': 5,
        'loss of consciousness': 5,
        'stroke symptoms': 5,
        'numbness': 3,
        
        # Respiratory
        'difficulty breathing': 5,
        'wheezing': 3,
        'coughing': 2,
        
        # Trauma
        'bleeding': 4,
        'severe bleeding': 5,
        'head injury': 5,
        'broken bone': 4,
        'burn': 4,
        'severe burn': 5,
        
        # Abdominal
        'severe abdominal pain': 4,
        'vomiting': 2,
        'vomiting blood': 5,
        
        # General
        'fever': 2,
        'high fever': 4,
        'severe pain': 4,
        'mild pain': 2,
        'allergic reaction': 4,
        'severe allergic reaction': 5
    }
    
    @classmethod
    def evaluate_symptoms(cls, symptoms):
        if not symptoms:
            return 0
            
        # Get severity scores for all recognized symptoms
        severity_scores = [cls.SYMPTOM_SEVERITY.get(symptom.lower(), 1) for symptom in symptoms]
        
        # Calculate weighted score:
        # - Maximum severity has highest weight
        # - Number of symptoms increases overall severity
        # - Additional high severity symptoms increase overall severity
        max_severity = max(severity_scores)
        high_severity_count = sum(1 for score in severity_scores if score >= 4)
        total_symptoms = len(symptoms)
        
        # Base score is the maximum severity
        score = max_severity
        
        # Adjust for multiple high severity symptoms
        if high_severity_count > 1:
            score = min(score + 0.5 * (high_severity_count - 1), 5)
            
        # Adjust for total number of symptoms
        if total_symptoms > 2:
            score = min(score + 0.25 * (total_symptoms - 2), 5)
            
        return round(score, 2)
    
    @classmethod
    def get_severity_description(cls, score):
        if score >= 4.5:
            return "Critical - Immediate Response Required"
        elif score >= 3.5:
            return "Severe - Urgent Response Required"
        elif score >= 2.5:
            return "Moderate - Prompt Response Required"
        elif score >= 1.5:
            return "Minor - Standard Response"
        else:
            return "Low - Non-urgent Response"

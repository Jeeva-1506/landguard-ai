import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, mean_absolute_error, mean_squared_error, r2_score

class LandAcquisitionRiskPredictor:
    def __init__(self):
        self.model_version = "v1.2.0-scikit-rf"
        self._train_baseline_models()

    def _train_baseline_models(self):
        # Synthetic baseline dataset representing land acquisition cases
        np.random.seed(42)
        n_samples = 300
        
        # Features: [landArea, ownersCount, ownershipDispute, documentsComplete, compensationStatus, objectionFiled, courtCase, surveyCompleted, environmentalClearance, previousDelay, distanceFromProject]
        X = []
        y_delay_days = []
        y_risk_class = []

        for _ in range(n_samples):
            land_area = np.random.uniform(0.5, 10.0)
            owners = np.random.randint(1, 10)
            dispute = np.random.choice([0, 1], p=[0.7, 0.3])
            doc_complete = np.random.choice([0, 1], p=[0.4, 0.6])
            comp_status = np.random.choice([0, 1, 2], p=[0.5, 0.3, 0.2]) # Paid, Pending, Disputed
            objection = np.random.choice([0, 1], p=[0.75, 0.25])
            court = np.random.choice([0, 1], p=[0.85, 0.15])
            survey = np.random.choice([0, 1], p=[0.3, 0.7])
            env = np.random.choice([0, 1], p=[0.2, 0.8])
            prev_delay = np.random.choice([0, 1], p=[0.8, 0.2])
            dist = np.random.uniform(0.1, 15.0)

            features = [land_area, owners, dispute, doc_complete, comp_status, objection, court, survey, env, prev_delay, dist]
            
            # Target delay calculation rule
            base_days = 20 + (land_area * 3) + (court * 90) + (dispute * 45) + (objection * 30) + ((1 - doc_complete) * 20)
            noise = np.random.normal(0, 5)
            delay = max(10, int(base_days + noise))
            
            risk_class = 2 if delay > 70 else (1 if delay > 35 else 0)
            
            X.append(features)
            y_delay_days.append(delay)
            y_risk_class.append(risk_class)

        X = np.array(X)
        y_delay_days = np.array(y_delay_days)
        y_risk_class = np.array(y_risk_class)

        # Fit Random Forest Regressor & Classifier
        self.rf_reg = RandomForestRegressor(n_estimators=50, random_state=42)
        self.rf_reg.fit(X, y_delay_days)

        self.rf_clf = RandomForestClassifier(n_estimators=50, random_state=42)
        self.rf_clf.fit(X, y_risk_class)

        # Compute model metrics
        y_reg_pred = self.rf_reg.predict(X)
        self.mae = mean_absolute_error(y_delay_days, y_reg_pred)
        self.rmse = np.sqrt(mean_squared_error(y_delay_days, y_reg_pred))
        self.r2 = r2_score(y_delay_days, y_reg_pred)

        y_clf_pred = self.rf_clf.predict(X)
        self.accuracy = accuracy_score(y_risk_class, y_clf_pred)
        self.precision = precision_score(y_risk_class, y_clf_pred, average='weighted')
        self.recall = recall_score(y_risk_class, y_clf_pred, average='weighted')
        self.f1 = f1_score(y_risk_class, y_clf_pred, average='weighted')

    def predict_parcel(self, data: dict) -> dict:
        land_area = float(data.get("landArea") or data.get("area") or 1.5)
        owners = int(data.get("ownersCount") or 1)
        dispute = 1 if data.get("ownershipDispute") or data.get("ownershipStatus") == "Disputed" else 0
        doc_complete = 1 if data.get("documentsComplete") else 0
        comp_status = 2 if data.get("compensationStatus") == "Disputed" else (1 if data.get("compensationStatus") == "Pending" else 0)
        objection = 1 if data.get("objectionFiled") else 0
        court = 1 if data.get("courtCase") or data.get("legalStatus") == "Court Stay Order" else 0
        survey = 1 if data.get("surveyCompleted") else 0
        env = 1 if data.get("environmentalClearance") else 0
        prev_delay = 1 if data.get("previousDelay") else 0
        dist = float(data.get("distanceFromProject") or 1.0)

        features = np.array([[land_area, owners, dispute, doc_complete, comp_status, objection, court, survey, env, prev_delay, dist]])
        
        predicted_days = int(self.rf_reg.predict(features)[0])
        prob_class = self.rf_clf.predict_proba(features)[0]
        delay_probability = int(min(98, max(12, int((prob_class[1] * 50) + (prob_class[2] * 90) + (court * 20)))))

        risk_level = "High" if delay_probability > 65 else ("Medium" if delay_probability > 35 else "Low")

        # Explainable AI risk factors
        risk_factors = []
        if court:
            risk_factors.append({"factor": "Active Court Case / Injunction Stay Order", "weight": "+30%", "category": "Legal"})
        if dispute:
            risk_factors.append({"factor": "Title / Ownership Dispute", "weight": "+20%", "category": "Ownership"})
        if comp_status == 2:
            risk_factors.append({"factor": "Disputed Land Compensation Assessment", "weight": "+18%", "category": "Financial"})
        if objection:
            risk_factors.append({"factor": "Section-15 Landowner Objection Filed", "weight": "+15%", "category": "Public"})
        if not doc_complete:
            risk_factors.append({"factor": "Incomplete Patta / Revenue Documentation", "weight": "+12%", "category": "Documentation"})
        if not survey:
            risk_factors.append({"factor": "Pending Demarcation & Survey Verification", "weight": "+10%", "category": "Survey"})

        if not risk_factors:
            risk_factors.append({"factor": "Standard Acquisition Timeline & Clear Titles", "weight": "0%", "category": "General"})

        # Recommended Actions
        recommended_actions = []
        if court:
            recommended_actions.append("Expedite legal representation in high court to vacate stay order.")
        if dispute:
            recommended_actions.append("Initiate Revenue Divisional Inquiry to settle joint family title disputes.")
        if comp_status == 2:
            recommended_actions.append("Schedule District Collector compensation negotiation tribunal.")
        if not doc_complete:
            recommended_actions.append("Issue 14-day notice to landowner for mandatory document submission.")

        if not recommended_actions:
            recommended_actions.append("Proceed with 3A/3D notification publication and final award issuance.")

        # Cost Overrun calculation
        comp_amount = float(data.get("compensationAmount") or (land_area * 2500000))
        overrun_rate = 0.04 + (0.14 if court else 0) + (0.08 if dispute else 0) + (0.06 if objection else 0)
        expected_additional_cost = int(comp_amount * overrun_rate)
        expected_final_cost = int(comp_amount + expected_additional_cost)
        cost_overrun_percentage = round(overrun_rate * 100, 1)

        return {
          "delayProbability": delay_probability,
          "riskLevel": risk_level,
          "expectedDelayDays": predicted_days,
          "expectedAdditionalCost": expected_additional_cost,
          "expectedFinalCost": expected_final_cost,
          "costOverrunPercentage": cost_overrun_percentage,
          "legalRiskProbability": min(98, delay_probability + 5 if court or dispute else max(10, delay_probability - 15)),
          "legalRiskLevel": "High" if court or dispute else risk_level,
          "riskFactors": risk_factors,
          "recommendedActions": recommended_actions,
          "modelVersion": self.model_version,
          "metrics": {
            "regressor": {"mae": round(self.mae, 2), "rmse": round(self.rmse, 2), "r2": round(self.r2, 2)},
            "classifier": {"accuracy": round(self.accuracy, 2), "precision": round(self.precision, 2), "recall": round(self.recall, 2), "f1": round(self.f1, 2)}
          }
        }

predictor = LandAcquisitionRiskPredictor()

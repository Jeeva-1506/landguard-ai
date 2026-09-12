from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, Optional
from models.predictor import predictor

app = FastAPI(
    title="LandGuard AI ML Microservice",
    description="Predictive Delay, Cost Overrun & Legal Risk API for Land Acquisition",
    version="1.2.0"
)

class ParcelPredictionInput(BaseModel):
    landArea: Optional[float] = 1.0
    area: Optional[float] = 1.0
    ownersCount: Optional[int] = 1
    ownershipDispute: Optional[bool] = False
    documentsComplete: Optional[bool] = True
    compensationStatus: Optional[str] = "Pending"
    objectionFiled: Optional[bool] = False
    courtCase: Optional[bool] = False
    surveyCompleted: Optional[bool] = True
    environmentalClearance: Optional[bool] = True
    previousDelay: Optional[bool] = False
    distanceFromProject: Optional[float] = 1.0
    compensationAmount: Optional[float] = 1000000.0

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "ml-service",
        "model_version": predictor.model_version
    }

@app.post("/predict/delay")
def predict_delay(input_data: ParcelPredictionInput):
    data = input_data.model_dump()
    res = predictor.predict_parcel(data)
    return res

@app.post("/predict/cost")
def predict_cost(input_data: ParcelPredictionInput):
    data = input_data.model_dump()
    res = predictor.predict_parcel(data)
    return {
        "estimatedAdditionalCost": res["expectedAdditionalCost"],
        "expectedFinalCost": res["expectedFinalCost"],
        "costOverrunPercentage": res["costOverrunPercentage"],
        "riskLevel": res["riskLevel"]
    }

@app.post("/predict/legal")
def predict_legal(input_data: ParcelPredictionInput):
    data = input_data.model_dump()
    res = predictor.predict_parcel(data)
    return {
        "legalRiskProbability": res["legalRiskProbability"],
        "legalRiskLevel": res["legalRiskLevel"],
        "riskFactors": res["riskFactors"],
        "recommendedActions": res["recommendedActions"]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

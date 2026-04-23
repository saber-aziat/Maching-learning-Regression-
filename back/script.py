from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import joblib

app = FastAPI()

# Autoriser les requetes depuis ton frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # pour test (plus tard on limite)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Charger le modèle
model = joblib.load("linear_regression_model.joblib")

class PriceData(BaseModel):
    income: float
    age: float
    rooms: float
    bedrooms: float
    population: float

@app.post("/predict-price")
def predict_price(data: PriceData):
    try:
        prediction = model.predict([[
            data.income,
            data.age,
            data.rooms,
            data.bedrooms,
            data.population
        ]])

        return {
            "price": float(prediction[0])
        }

    except Exception as e:
        return {
            "error": str(e)
        }
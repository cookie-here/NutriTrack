from fastapi import APIRouter

router = APIRouter(prefix="/static", tags=["Static Info"])

@router.get("/nutrition-tips")
def get_nutrition_tips():
    return {
        "tips": [
            "Eat plenty of fruits and vegetables",
            "Include iron-rich foods like lean meat and beans",
            "Take prenatal vitamins with folic acid",
            # Add more from reliable sources
        ]
    }

@router.get("/safe-foods")
def get_safe_unsafe_foods():
    return {
        "safe": ["Pasteurized dairy", "Cooked meats", "Washed fruits/veggies"],
        "unsafe": ["Raw fish", "Unpasteurized cheese", "Deli meats (unless heated)", "Alcohol"]
    }

@router.get("/vaccine-schedule")
def get_vaccine_schedule():
    return {
        "schedule": [
            {
                "vaccine": "Tdap (Tetanus, Diphtheria, Pertussis)",
                "timing": "27–36 weeks of pregnancy (preferably early in this window)",
                "note": "Recommended during every pregnancy to protect baby from whooping cough"
            },
            {
                "vaccine": "Influenza (Flu shot - inactivated)",
                "timing": "Any trimester (ideally before or during flu season)",
                "note": "Safe and recommended; get every year"
            },
            {
                "vaccine": "COVID-19 (updated 2025-2026 formulation)",
                "timing": "Any trimester",
                "note": "Strongly recommended; protects mom and passes antibodies to baby"
            },
            {
                "vaccine": "RSV (Abrysvo by Pfizer only)",
                "timing": "32–36 weeks of pregnancy (September–January in most areas)",
                "note": "Seasonal; protects baby from severe RSV in first 6 months"
            }
        ],
        "source": "Based on CDC and ACOG guidelines (2025)",
        "disclaimer": "Always consult your healthcare provider for personalized advice"
    }

@router.get("/feeding-guide")
def get_feeding_guide():
    return {
        "by_age": {
            "0-6 months": "Exclusive breast milk or formula",
            "6-8 months": "Introduce purees, 2-3 meals",
            "9-12 months": "Finger foods, 3 meals + snacks"
        }
    }

@router.get("/daily-tip")
def get_daily_tip():
    tips = ["Stay hydrated", "Walk daily", "Rest when needed"]  # Can randomize
    return {"tip": tips[0]}
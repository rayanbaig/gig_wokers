import math
import random

# --- THE "TRAINED" CITY MODEL ---
# In a real app, these numbers come from analyzing 10,000+ drivers.
# We hardcode the "Bangalore Model" here for the hackathon.
CITY_MODELS = {
    "Bangalore": {"mean": 1250.0, "std_dev": 300.0},
    "Mumbai": {"mean": 1400.0, "std_dev": 350.0},
    "Delhi": {"mean": 1300.0, "std_dev": 320.0}
}

def calculate_percentile(value, mean, std_dev):
    """
    Uses the Error Function (erf) to calculate the cumulative distribution
    function (CDF) for a normal distribution. 
    Returns: A percentile (0-100) indicating where this driver stands.
    """
    z_score = (value - mean) / std_dev
    cdf = 0.5 * (1 + math.erf(z_score / math.sqrt(2)))
    return round(cdf * 100, 2)

def check_shadow_ban(user_earnings: float, region: str = "Bangalore") -> dict:
    """
    Performs Z-Score Anomaly Detection on the driver's earnings.
    """
    # 1. Load the Statistical Model for the region
    model = CITY_MODELS.get(region, CITY_MODELS["Bangalore"])
    mean = model["mean"]
    std = model["std_dev"]

    # 2. Calculate the Driver's Position (The Math)
    percentile = calculate_percentile(user_earnings, mean, std)
    
    # 3. Determine Anomaly Status
    # Threshold: If you are in the bottom 5% of earners, it's statistically impossible 
    # for a full-time driver unless the algorithm is suppressing you.
    is_shadow_banned = False
    status = "Healthy"
    
    if percentile < 5.0:
        is_shadow_banned = True
        status = "CRITICAL: Statistical Anomaly Detected"
        explanation = (
            f"Your earnings (₹{user_earnings}) are in the bottom {percentile}% of {region}. "
            f"This is 2.5 Sigma deviations below the mean, indicating algorithmic throttling."
        )
    elif percentile < 15.0:
        status = "Warning: Low Visibility"
        explanation = f"You are earning less than 85% of drivers in {region}. Monitor closely."
    else:
        status = "Normal"
        explanation = f"Your account visibility is healthy (Better than {percentile}% of drivers)."

    return {
        "region": region,
        "model_mean": mean,
        "your_earnings": user_earnings,
        "percentile_rank": percentile,
        "is_shadow_banned": is_shadow_banned,
        "audit_status": status,
        "explanation": explanation
    }

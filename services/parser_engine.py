import re
from datetime import datetime

def parse_gig_receipt(raw_text: str) -> dict:
    """
    Analyzes raw OCR text to find financial data and flags.
    Returns a structured dictionary.
    """
    # 1. Clean the text (remove extra spaces, convert to lowercase for searching)
    text = raw_text.replace("\n", " ").strip()
    text_lower = text.lower()

    # 2. Extract Money (Regex looks for ₹ followed by numbers, allowing for commas)
    # Pattern: ₹ 1,200.50 or 1200
    # We add '?' because OCR often mistakes '₹' for '?'. Hackathon survival tip!
    money_pattern = r"[₹|Rs|?|INR]\.?\s?([\d,]+\.?\d*)"
    amounts = re.findall(money_pattern, text, re.IGNORECASE)
    
    # Convert strings to floats
    valid_amounts = []
    for amount in amounts:
        try:
            val = float(amount.replace(",", ""))
            valid_amounts.append(val)
        except:
            continue
    
    # Heuristic: The largest number is usually the "Total Earnings"
    total_earnings = max(valid_amounts) if valid_amounts else 0.0

    # 3. Detect Penalties
    # We look for keywords that indicate money was taken away
    penalty_keywords = ["penalty", "adjustment", "deduction", "dr"]
    penalty_detected = any(keyword in text_lower for keyword in penalty_keywords)
    
    # 4. Extract Date (Looking for YYYY-MM-DD or DD/MM/YYYY)
    date_pattern = r"(\d{2}[/-]\d{2}[/-]\d{2,4})"
    date_match = re.search(date_pattern, text)
    extracted_date = date_match.group(1) if date_match else datetime.now().strftime("%Y-%m-%d")

    return {
        "detected_date": extracted_date,
        "total_earnings": total_earnings,
        "penalty_flag": penalty_detected,
        "raw_amounts_found": valid_amounts
    }
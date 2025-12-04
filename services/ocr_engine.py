import easyocr
import numpy as np
import cv2

# 1. Initialize the Model (Loads into RAM once)
# gpu=False ensures it runs on CPU if needed (safer for prototypes)
print("Loading OCR Model... this might take a moment.")
reader = easyocr.Reader(['en'], gpu=False) 

async def extract_text_from_image(image_bytes: bytes) -> str:
    """
    Takes raw image bytes, converts to OpenCV format, and extracts text.
    Returns: A single string of all detected text.
    """
    try:
        # 2. Convert bytes to numpy array (efficient memory usage)
        nparr = np.frombuffer(image_bytes, np.uint8)
        
        # 3. Decode image for OpenCV
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        # 4. Run the AI Extraction
        # detail=0 gives us just the text strings, not the boxes
        result = reader.readtext(image, detail=0) 
        
        # 5. Join list into a single paragraph
        return " ".join(result)
    
    except Exception as e:
        print(f"OCR Error: {e}")
        return ""
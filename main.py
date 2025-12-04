from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware  # <--- CRITICAL IMPORT
from fastapi.staticfiles import StaticFiles         # <--- Needed for dashboard
from fastapi.responses import FileResponse          # <--- Needed for dashboard
from services.ocr_engine import extract_text_from_image
from services.parser_engine import parse_gig_receipt

app = FastAPI(title="GigGuard API")

# --- CORS BLOCK (THE BRIDGE) ---
# This allows your friend's laptop to talk to your laptop.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows ALL origins (Safe for Hackathon, Bad for Prod)
    allow_credentials=True,
    allow_methods=["*"],  # Allows GET, POST, OPTIONS, etc.
    allow_headers=["*"],  # Allows all headers
)
# -------------------------------

# Mount the static directory for the Dashboard
# (Create a folder named 'static' if you haven't yet!)
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
async def read_index():
    # Serve the dashboard HTML instead of JSON
    return FileResponse("static/index.html")

@app.post("/analyze/ocr")
async def scan_screenshot(file: UploadFile = File(...)):
    # Existing basic endpoint
    content = await file.read()
    extracted_text = await extract_text_from_image(content)
    return {"filename": file.filename, "raw_text": extracted_text}

@app.post("/analyze/full")
async def analyze_receipt(file: UploadFile = File(...)):
    """
    The Smart Endpoint: OCR -> Text -> Structured Data
    """
    if file.content_type not in ["image/jpeg", "image/png"]:
        raise HTTPException(status_code=400, detail="Invalid file type.")

    # 1. Read File
    content = await file.read()
    
    # 2. Vision (Get the text)
    raw_text = await extract_text_from_image(content)
    
    # 3. Intelligence (Parse the data)
    structured_data = parse_gig_receipt(raw_text)
    
    return {
        "filename": file.filename,
        "analysis": structured_data,
        "debug_text": raw_text[:100]  # First 100 chars to check accuracy
    }
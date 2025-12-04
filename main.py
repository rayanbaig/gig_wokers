from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, StreamingResponse
from services.ocr_engine import extract_text_from_image
from services.parser_engine import parse_gig_receipt
from services.report_generator import generate_evidence_pdf
from services.benchmark_engine import check_shadow_ban
from services.audio_engine import transcribe_audio
from database import log_event, get_recent_logs
from typing import Optional
from datetime import datetime
import io

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
    
    # Log the event
    log_event(
        event="OCR_SCAN_COMPLETE",
        status="UNFAIR PENALTY" if structured_data.get("penalty_flag") else "SAFE",
        earnings=structured_data.get("total_earnings", 0)
    )
    
    return {
        "filename": file.filename,
        "analysis": structured_data,
        "debug_text": raw_text[:100]  # First 100 chars to check accuracy
    }

@app.post("/generate-report")
async def get_evidence_report(
    image: UploadFile = File(...), 
    audio: Optional[UploadFile] = File(None) # Audio is optional
):
    """
    Generates a PDF with Screenshot + Optional Audio Transcript.
    """
    # 1. Process Image
    image_content = await image.read()
    raw_text = await extract_text_from_image(image_content)
    data = parse_gig_receipt(raw_text)
    
    # 2. Process Audio (If provided)
    transcript = None
    if audio:
        audio_content = await audio.read()
        # This uses our new AI Service
        transcript = transcribe_audio(audio_content)
    
    # Log the event
    log_event(
        event="EVIDENCE_PACK_GENERATED",
        status="PDF + AUDIO COMPILED",
        earnings=data.get("total_earnings", 0)
    )

    # 3. Generate Super PDF
    pdf_buffer = generate_evidence_pdf(data, image_content, transcript)
    
    return StreamingResponse(
        pdf_buffer, 
        media_type="application/pdf", 
        headers={"Content-Disposition": "attachment; filename=evidence_pack_plus.pdf"}
    )

@app.post("/analyze/shadow-ban")
async def detect_shadow_ban(file: UploadFile = File(...)):
    """
    Checks if the user is being secretly throttled by the algorithm.
    """
    # 1. Get Earnings from the Receipt
    content = await file.read()
    raw_text = await extract_text_from_image(content)
    data = parse_gig_receipt(raw_text)
    earnings = data.get("total_earnings", 0)

    # 2. Run the Benchmark
    audit_result = check_shadow_ban(earnings)

    # Log the event
    log_event(
        event="SHADOW_BAN_AUDIT",
        status="HIGH RISK DETECTED" if audit_result["is_shadow_banned"] else "NORMAL VISIBILITY",
        earnings=audit_result["your_earnings"]
    )

    return {
        "filename": file.filename,
        "audit": audit_result
    }

@app.get("/monitor")
async def view_monitor():
    return FileResponse("static/monitor.html")

@app.get("/api/logs")
async def get_logs():
    # Fetch from Real DB instead of list
    return get_recent_logs()
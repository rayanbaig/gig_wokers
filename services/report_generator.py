from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
import io
from datetime import datetime

def generate_evidence_pdf(data: dict, image_bytes: bytes, audio_transcript: str = None) -> io.BytesIO:
    """
    Generates a PDF buffer containing Visual + Verbal evidence.
    """
    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter

    # --- Header ---
    c.setFont("Helvetica-Bold", 20)
    c.drawString(50, height - 50, "GigGuard: Multi-Modal Audit Report") # Updated Title
    
    c.setFont("Helvetica", 10)
    c.drawString(50, height - 70, f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    c.setLineWidth(1)
    c.line(50, height - 95, width - 50, height - 95)

    # --- Analysis Results ---
    y = height - 130
    c.setFont("Helvetica-Bold", 14)
    c.drawString(50, y, "1. Automated Analysis Result")
    
    y -= 25
    c.setFont("Helvetica", 12)
    c.drawString(50, y, f"Detected Date: {data.get('detected_date', 'Unknown')}")
    y -= 20
    c.drawString(50, y, f"Total Earnings: INR {data.get('total_earnings', 0)}")
    y -= 20
    if data.get('penalty_flag'):
        c.setFillColorRGB(0.8, 0, 0)
        c.drawString(50, y, "STATUS: UNFAIR PENALTY DETECTED")
    else:
        c.setFillColorRGB(0, 0.5, 0)
        c.drawString(50, y, "STATUS: FAIR PAY VERIFIED")
    c.setFillColorRGB(0, 0, 0)

    # --- NEW SECTION: Verbal Evidence ---
    y -= 50
    if audio_transcript:
        c.setFont("Helvetica-Bold", 14)
        c.drawString(50, y, "2. Driver's Verbal Testimony (Transcribed)")
        y -= 25
        c.setFont("Helvetica-Oblique", 10)
        # Wrap text simply
        text_object = c.beginText(50, y)
        text_object.setFont("Helvetica-Oblique", 10)
        
        # Simple word wrap logic
        words = audio_transcript.split()
        line = ""
        for word in words:
            if c.stringWidth(line + word, "Helvetica-Oblique", 10) < 500:
                line += word + " "
            else:
                text_object.textLine(line)
                line = word + " "
                y -= 15 # Move y down for tracking
        text_object.textLine(line)
        c.drawText(text_object)
        y -= 30

    # --- The Screenshot Evidence ---
    y -= 40
    c.setFont("Helvetica-Bold", 14)
    c.drawString(50, y, "3. Visual Evidence")
    
    try:
        img = ImageReader(io.BytesIO(image_bytes))
        # FIXED: Lowered the image position so it doesn't overlap text
        c.drawImage(img, 50, y - 350, width=300, height=350, preserveAspectRatio=True)
    except Exception:
        c.drawString(50, y - 20, "[Image could not be rendered]")

    # --- Footer ---
    c.setFont("Helvetica", 8)
    c.drawString(50, 30, "Powered by GigGuard Voice Witness Protocol")

    c.save()
    buffer.seek(0)
    return buffer
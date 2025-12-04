import speech_recognition as sr
import io
from pydub import AudioSegment

def transcribe_audio(file_bytes: bytes) -> str:
    """
    Converts audio voice notes (wav/mp3) into text evidence.
    """
    recognizer = sr.Recognizer()
    
    try:
        # 1. Convert any format to WAV (SpeechRecognition needs WAV)
        audio = AudioSegment.from_file(io.BytesIO(file_bytes))
        wav_io = io.BytesIO()
        audio.export(wav_io, format="wav")
        wav_io.seek(0)
        
        # 2. Transcribe
        with sr.AudioFile(wav_io) as source:
            audio_data = recognizer.record(source)
            # Uses Google's free API
            text = recognizer.recognize_google(audio_data)
            return text
            
    except Exception as e:
        print(f"Transcription Error: {e}")
        return "Audio evidence provided but transcription failed (Background noise or unsupported format)."

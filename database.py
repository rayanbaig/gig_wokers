import sqlite3
from datetime import datetime

DB_NAME = "gigguard.db"

def init_db():
    """Creates the database table if it doesn't exist."""
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    
    # Create Audit Logs Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS audit_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT,
            event TEXT,
            status TEXT,
            earnings REAL
        )
    ''')
    
    conn.commit()
    conn.close()
    print("✅ Database Initialized: gigguard.db")

def log_event(event: str, status: str, earnings: float):
    """Inserts a new log entry."""
    try:
        conn = sqlite3.connect(DB_NAME)
        cursor = conn.cursor()
        
        timestamp = datetime.now().strftime("%H:%M:%S")
        cursor.execute('''
            INSERT INTO audit_logs (timestamp, event, status, earnings)
            VALUES (?, ?, ?, ?)
        ''', (timestamp, event, status, earnings))
        
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"DB Error: {e}")

def get_recent_logs(limit=10):
    """Fetches the latest logs for the Monitor."""
    conn = sqlite3.connect(DB_NAME)
    # This allows us to access columns by name (row["event"])
    conn.row_factory = sqlite3.Row 
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT * FROM audit_logs ORDER BY id DESC LIMIT ?
    ''', (limit,))
    
    rows = cursor.fetchall()
    conn.close()
    
    # Convert to list of dicts for JSON response
    return [dict(row) for row in rows]

# Initialize immediately when this module is imported
init_db()

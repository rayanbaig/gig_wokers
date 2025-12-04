from pyngrok import ngrok
import time

try:
    # Open a HTTP tunnel on the default port 8000
    # <NgrokTunnel: "https://<public_sub>.ngrok.io" -> "http://localhost:8000">
    public_url = ngrok.connect(8000)

    print("\n========================================================")
    print(f"🚀 YOUR GLOBAL URL IS: {public_url}")
    print("========================================================\n")

    # Keep the script running
    while True:
        time.sleep(1)
except Exception as e:
    print(f"Error: {e}")
except KeyboardInterrupt:
    print("Closing Tunnel...")

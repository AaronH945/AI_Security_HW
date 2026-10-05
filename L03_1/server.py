"""
Local Python Development Server for L03_1 (Python + Vercel Architecture)
Runs static frontend and Python Serverless API endpoints on localhost.

Usage:
    python server.py [port]
    Default port: 8000
"""

import sys
import os
import json
import urllib.parse
from http.server import HTTPServer, SimpleHTTPRequestHandler

# Ensure current dir is in sys.path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

# Try loading .env if exists
env_path = os.path.join(BASE_DIR, '.env')
if os.path.exists(env_path):
    try:
        with open(env_path, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    k, v = line.split('=', 1)
                    os.environ[k.strip()] = v.strip()
        print("[Env] Loaded environment variables from .env")
    except Exception as e:
        print(f"[Env Warning] Could not parse .env: {e}")

from api.weather import get_weather_payload
from api.sync import execute_sync


class LocalDevHandler(SimpleHTTPRequestHandler):
    """
    HTTP Request handler serving static files from L03_1 directory
    and routing API requests to Python Serverless function logic.
    """

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def _set_cors_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')

    def do_OPTIONS(self):
        self.send_response(200)
        self._set_cors_headers()
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path.rstrip('/')

        if path in ('/api/weather', '/L03_1/api/weather'):
            try:
                payload = get_weather_payload()
                body = json.dumps(payload, ensure_ascii=False).encode('utf-8')
                self.send_response(200)
                self._set_cors_headers()
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.send_header('Content-Length', str(len(body)))
                self.end_headers()
                self.wfile.write(body)
            except Exception as e:
                err_body = json.dumps({'status': 'error', 'message': str(e)}).encode('utf-8')
                self.send_response(500)
                self._set_cors_headers()
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.send_header('Content-Length', str(len(err_body)))
                self.end_headers()
                self.wfile.write(err_body)
            return

        elif path in ('/api/sync', '/L03_1/api/sync'):
            self._handle_sync()
            return

        # Default: Serve static files (index.html, style.css, app.js, etc.)
        super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path.rstrip('/')

        if path in ('/api/sync', '/L03_1/api/sync'):
            self._handle_sync()
            return

        self.send_response(404)
        self.end_headers()

    def _handle_sync(self):
        try:
            payload = execute_sync()
            status_code = 200 if payload.get('status') != 'error' else 500
            body = json.dumps(payload, ensure_ascii=False).encode('utf-8')
            self.send_response(status_code)
            self._set_cors_headers()
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Content-Length', str(len(body)))
            self.end_headers()
            self.wfile.write(body)
        except Exception as e:
            err_body = json.dumps({'status': 'error', 'message': str(e)}).encode('utf-8')
            self.send_response(500)
            self._set_cors_headers()
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Content-Length', str(len(err_body)))
            self.end_headers()
            self.wfile.write(err_body)


def run_server(port: int = 8000):
    server_address = ('', port)
    httpd = HTTPServer(server_address, LocalDevHandler)
    print("=" * 70)
    print(f"🚀 AI Security - Lab 03_1 Python + Vercel Server Running!")
    print(f"🌐 Local Portal URL:    http://localhost:{port}/")
    print(f"📡 Weather API:         http://localhost:{port}/api/weather")
    print(f"🔄 Sync API:            http://localhost:{port}/api/sync")
    print(f"📦 Environment:         Python {sys.version.split()[0]}")
    print("=" * 70)
    print("Press Ctrl+C to stop the server.\n")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n[Server] Shutting down gracefully...")
        httpd.server_close()


if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 and sys.argv[1].isdigit() else 8000
    run_server(port)

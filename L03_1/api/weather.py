"""
Vercel Serverless Function: /api/weather (Python Edition)
AI Security Lab 03_1
"""

import sys
import os
import json
from http.server import BaseHTTPRequestHandler
from datetime import datetime, timezone

# Add parent directory to sys.path so 'lib' can be imported easily
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PARENT_DIR = os.path.abspath(os.path.join(CURRENT_DIR, '..'))
if PARENT_DIR not in sys.path:
    sys.path.insert(0, PARENT_DIR)

from lib.db import get_latest_weather_from_db, get_connection_string
from lib.cwa import fetch_cwa_data, get_sample_taiwan_stations


def get_weather_payload() -> dict:
    """
    Core business logic to retrieve weather data with multi-tier fallback:
    1. PostgreSQL
    2. CWA Open Data API (Live)
    3. Realistic 22-county Sample Fallback
    """
    # 1. Try PostgreSQL if configured
    if get_connection_string():
        try:
            db_result = get_latest_weather_from_db()
            if db_result and db_result.get('stations') and len(db_result['stations']) > 0:
                return {
                    'status': 'success',
                    'source': 'python_postgresql',
                    'lastSyncedAt': db_result.get('lastSyncedAt') or datetime.now(timezone.utc).isoformat(),
                    'totalStations': db_result.get('totalStations', len(db_result['stations'])),
                    'stations': db_result['stations'],
                }
        except Exception as db_err:
            print(f"[Warning] PostgreSQL query fallback triggered: {db_err}")

    # 2. Try CWA API Direct
    cwa_api_key = os.environ.get('CWA_API_KEY')
    if cwa_api_key:
        try:
            cwa_stations = fetch_cwa_data(cwa_api_key)
            if cwa_stations:
                return {
                    'status': 'success',
                    'source': 'python_cwa_direct',
                    'lastSyncedAt': datetime.now(timezone.utc).isoformat(),
                    'totalStations': len(cwa_stations),
                    'stations': cwa_stations,
                }
        except Exception as cwa_err:
            print(f"[Warning] CWA Direct fetch fallback triggered: {cwa_err}")

    # 3. Built-in Fallback Demo Dataset
    sample = get_sample_taiwan_stations()
    return {
        'status': 'success',
        'source': 'python_demo_fallback',
        'lastSyncedAt': datetime.now(timezone.utc).isoformat(),
        'totalStations': len(sample),
        'stations': sample,
        'message': 'Loaded built-in 22-county Python dataset. Configure CWA_API_KEY and POSTGRES_URL for live syncing.'
    }


class handler(BaseHTTPRequestHandler):
    """
    Vercel Python Serverless HTTP Request Handler
    """

    def _set_cors_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header(
            'Access-Control-Allow-Headers',
            'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
        )
        self.send_header('Content-Type', 'application/json; charset=utf-8')

    def do_OPTIONS(self):
        self.send_response(200)
        self._set_cors_headers()
        self.end_headers()

    def do_GET(self):
        try:
            payload = get_weather_payload()
            response_body = json.dumps(payload, ensure_ascii=False).encode('utf-8')

            self.send_response(200)
            self._set_cors_headers()
            self.send_header('Content-Length', str(len(response_body)))
            self.end_headers()
            self.wfile.write(response_body)
        except Exception as err:
            error_payload = {
                'status': 'error',
                'message': str(err),
            }
            body = json.dumps(error_payload).encode('utf-8')
            self.send_response(500)
            self._set_cors_headers()
            self.send_header('Content-Length', str(len(body)))
            self.end_headers()
            self.wfile.write(body)

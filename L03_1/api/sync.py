"""
Vercel Serverless Function: /api/sync (Python Edition)
AI Security Lab 03_1 - CWA to PostgreSQL Synchronization Handler
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

from lib.db import save_weather_batch, get_connection_string
from lib.cwa import fetch_cwa_data, get_sample_taiwan_stations


def execute_sync() -> dict:
    """
    Executes synchronization from CWA Open Data API to PostgreSQL.
    """
    api_key = os.environ.get('CWA_API_KEY')
    data_source = 'cwa_api'
    stations_to_save = []

    if api_key:
        try:
            stations_to_save = fetch_cwa_data(api_key)
        except Exception as e:
            print(f"[Warning] CWA fetch failed during sync: {e}")
            stations_to_save = get_sample_taiwan_stations()
            data_source = 'sample_fallback'
    else:
        stations_to_save = get_sample_taiwan_stations()
        data_source = 'sample_fallback'

    if not stations_to_save:
        return {
            'status': 'warning',
            'message': 'No stations retrieved to sync.',
        }

    # Save to PostgreSQL if connection is configured
    if get_connection_string():
        try:
            result = save_weather_batch(stations_to_save)
            return {
                'status': 'success',
                'message': f"Python Backend: Successfully synced {result.get('count', len(stations_to_save))} stations to PostgreSQL",
                'syncedCount': result.get('count', len(stations_to_save)),
                'dataSource': data_source,
                'syncedAt': datetime.now(timezone.utc).isoformat(),
            }
        except Exception as db_err:
            return {
                'status': 'error',
                'message': f"Database sync error: {db_err}",
                'syncedCount': 0,
            }
    else:
        return {
            'status': 'success_memory_only',
            'message': 'Python Backend: CWA data parsed successfully in memory. Set POSTGRES_URL to persist into PostgreSQL.',
            'syncedCount': len(stations_to_save),
            'dataSource': data_source,
            'syncedAt': datetime.now(timezone.utc).isoformat(),
        }


class handler(BaseHTTPRequestHandler):
    """
    Vercel Python Serverless HTTP Request Handler for Sync
    """

    def _set_cors_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header(
            'Access-Control-Allow-Headers',
            'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
        )
        self.send_header('Content-Type', 'application/json; charset=utf-8')

    def do_OPTIONS(self):
        self.send_response(200)
        self._set_cors_headers()
        self.end_headers()

    def do_GET(self):
        self._handle_sync()

    def do_POST(self):
        self._handle_sync()

    def _handle_sync(self):
        try:
            payload = execute_sync()
            status_code = 200 if payload.get('status') != 'error' else 500
            response_body = json.dumps(payload, ensure_ascii=False).encode('utf-8')

            self.send_response(status_code)
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

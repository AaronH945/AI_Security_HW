"""
PostgreSQL Database Helper for CWA Weather Stations (Python Edition)
Compatible with Vercel Postgres, Neon, Supabase, Railway, and standard PostgreSQL.
"""

import os
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional

# Attempt to import psycopg2 or pg8000
try:
    import psycopg2
    from psycopg2.extras import RealDictCursor, execute_batch
    PSYCOPG2_AVAILABLE = True
except ImportError:
    psycopg2 = None
    PSYCOPG2_AVAILABLE = False

try:
    import pg8000.native
    PG8000_AVAILABLE = True
except ImportError:
    PG8000_AVAILABLE = False


def get_connection_string() -> Optional[str]:
    """
    Retrieves PostgreSQL connection string from environment variables.
    """
    return (
        os.environ.get('POSTGRES_URL')
        or os.environ.get('DATABASE_URL')
        or os.environ.get('POSTGRES_PRISMA_URL')
        or os.environ.get('POSTGRES_URL_NON_POOLING')
    )


def get_db_connection():
    """
    Creates and returns a new PostgreSQL database connection.
    """
    conn_str = get_connection_string()
    if not conn_str:
        return None

    if PSYCOPG2_AVAILABLE:
        # Standard psycopg2 connection
        # If sslmode is not specified and it is remote, enforce sslmode=require
        sslmode = 'require' if 'localhost' not in conn_str and '127.0.0.1' not in conn_str else 'prefer'
        if 'sslmode=' not in conn_str and sslmode == 'require':
            separator = '&' if '?' in conn_str else '?'
            conn_str = f"{conn_str}{separator}sslmode=require"
        return psycopg2.connect(conn_str)
    elif PG8000_AVAILABLE:
        # Pure-python pg8000 fallback
        # Parse connection string or pass URL
        return pg8000.native.Connection(conn_str)
    else:
        # Neither driver installed
        return None


def init_schema(conn=None) -> bool:
    """
    Automatically creates database tables and indexes if they do not exist.
    """
    schema_query = """
    CREATE TABLE IF NOT EXISTS stations (
        station_id VARCHAR(32) PRIMARY KEY,
        station_name VARCHAR(128) NOT NULL,
        county VARCHAR(64),
        township VARCHAR(64),
        lat DOUBLE PRECISION NOT NULL,
        lon DOUBLE PRECISION NOT NULL,
        elevation DOUBLE PRECISION DEFAULT 0,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS weather_records (
        id BIGSERIAL PRIMARY KEY,
        station_id VARCHAR(32) NOT NULL REFERENCES stations(station_id) ON DELETE CASCADE,
        temperature DOUBLE PRECISION,
        humidity DOUBLE PRECISION,
        rainfall DOUBLE PRECISION,
        wind_speed DOUBLE PRECISION,
        obs_time TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT uq_station_obs_time UNIQUE (station_id, obs_time)
    );

    CREATE INDEX IF NOT EXISTS idx_weather_station_time ON weather_records (station_id, obs_time DESC);
    CREATE INDEX IF NOT EXISTS idx_weather_obs_time ON weather_records (obs_time DESC);

    CREATE TABLE IF NOT EXISTS sync_logs (
        id SERIAL PRIMARY KEY,
        synced_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        station_count INT DEFAULT 0,
        status VARCHAR(32) NOT NULL,
        message TEXT
    );
    """

    close_after = False
    if conn is None:
        conn = get_db_connection()
        if conn is None:
            return False
        close_after = True

    try:
        if PSYCOPG2_AVAILABLE and isinstance(conn, psycopg2.extensions.connection):
            with conn.cursor() as cur:
                cur.execute(schema_query)
            conn.commit()
            return True
        elif PG8000_AVAILABLE:
            conn.run(schema_query)
            return True
        return False
    except Exception as err:
        print(f"[DB Schema Init Error] {err}")
        return False
    finally:
        if close_after and conn:
            conn.close()


def save_weather_batch(stations_data: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Saves and upserts batch of stations and observations into PostgreSQL.
    """
    conn = get_db_connection()
    if conn is None:
        raise RuntimeError("PostgreSQL database connection is not available or driver not installed.")

    try:
        init_schema(conn)

        if PSYCOPG2_AVAILABLE and isinstance(conn, psycopg2.extensions.connection):
            with conn.cursor() as cur:
                # 1. Upsert Stations
                station_tuples = [
                    (
                        st['stationId'],
                        st['stationName'],
                        st.get('county', ''),
                        st.get('township', ''),
                        st['lat'],
                        st['lon'],
                        st.get('elevation', 0.0),
                    )
                    for st in stations_data
                ]
                
                station_upsert_query = """
                INSERT INTO stations (station_id, station_name, county, township, lat, lon, elevation, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, NOW())
                ON CONFLICT (station_id)
                DO UPDATE SET
                    station_name = EXCLUDED.station_name,
                    county = EXCLUDED.county,
                    township = EXCLUDED.township,
                    lat = EXCLUDED.lat,
                    lon = EXCLUDED.lon,
                    elevation = EXCLUDED.elevation,
                    updated_at = NOW();
                """
                execute_batch(cur, station_upsert_query, station_tuples, page_size=200)

                # 2. Upsert Observation Records
                obs_tuples = [
                    (
                        st['stationId'],
                        st.get('temperature'),
                        st.get('humidity'),
                        st.get('rainfall', 0.0),
                        st.get('windSpeed'),
                        st.get('obsTime'),
                    )
                    for st in stations_data
                    if st.get('obsTime')
                ]

                obs_upsert_query = """
                INSERT INTO weather_records (station_id, temperature, humidity, rainfall, wind_speed, obs_time)
                VALUES (%s, %s, %s, %s, %s, %s)
                ON CONFLICT ON CONSTRAINT uq_station_obs_time
                DO UPDATE SET
                    temperature = EXCLUDED.temperature,
                    humidity = EXCLUDED.humidity,
                    rainfall = EXCLUDED.rainfall,
                    wind_speed = EXCLUDED.wind_speed;
                """
                execute_batch(cur, obs_upsert_query, obs_tuples, page_size=200)

                # 3. Insert Sync Log
                cur.execute(
                    """
                    INSERT INTO sync_logs (station_count, status, message)
                    VALUES (%s, 'SUCCESS', 'Python CWA Sync completed');
                    """,
                    (len(stations_data),)
                )

            conn.commit()
            return {'success': True, 'count': len(stations_data)}
        else:
            raise RuntimeError("Supported PostgreSQL driver not found.")
    except Exception as err:
        if conn and hasattr(conn, 'rollback'):
            conn.rollback()
        raise err
    finally:
        if conn:
            conn.close()


def get_latest_weather_from_db() -> Optional[Dict[str, Any]]:
    """
    Queries latest weather observation for every station from PostgreSQL.
    """
    conn = get_db_connection()
    if conn is None:
        return None

    try:
        if PSYCOPG2_AVAILABLE and isinstance(conn, psycopg2.extensions.connection):
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                # Query DISTINCT ON station_id ordered by obs_time DESC
                query = """
                SELECT 
                    s.station_id AS "stationId",
                    s.station_name AS "stationName",
                    s.county,
                    s.township,
                    s.lat,
                    s.lon,
                    s.elevation,
                    w.temperature,
                    w.humidity,
                    w.rainfall,
                    w.wind_speed AS "windSpeed",
                    w.obs_time AS "obsTime"
                FROM stations s
                LEFT JOIN LATERAL (
                    SELECT temperature, humidity, rainfall, wind_speed, obs_time
                    FROM weather_records
                    WHERE station_id = s.station_id
                    ORDER BY obs_time DESC
                    LIMIT 1
                ) w ON true
                WHERE s.lat IS NOT NULL AND s.lon IS NOT NULL
                ORDER BY s.county, s.station_name;
                """
                cur.execute(query)
                rows = cur.fetchall()

                # Fetch last sync log
                cur.execute("SELECT synced_at, status FROM sync_logs ORDER BY id DESC LIMIT 1;")
                log_row = cur.fetchone()
                last_sync = log_row['synced_at'].isoformat() if log_row and log_row.get('synced_at') else None

                # Format rows
                stations_list = []
                for r in rows:
                    item = dict(r)
                    if isinstance(item.get('obsTime'), datetime):
                        item['obsTime'] = item['obsTime'].isoformat()
                    stations_list.append(item)

                return {
                    'source': 'postgresql',
                    'lastSyncedAt': last_sync or datetime.now(timezone.utc).isoformat(),
                    'totalStations': len(stations_list),
                    'stations': stations_list,
                }
        return None
    except Exception as err:
        print(f"[DB Query Error] {err}")
        return None
    finally:
        if conn:
            conn.close()

-- CWA Weather Station & Observation Schema for PostgreSQL

-- 1. Weather Stations Table (氣象測站基本資料表)
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

-- 2. Weather Observations Table (觀測數據記錄表)
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

-- Index for efficient latest weather queries
CREATE INDEX IF NOT EXISTS idx_weather_station_time ON weather_records (station_id, obs_time DESC);
CREATE INDEX IF NOT EXISTS idx_weather_obs_time ON weather_records (obs_time DESC);

-- 3. Synchronization Logs Table (定時同步日誌表)
CREATE TABLE IF NOT EXISTS sync_logs (
  id SERIAL PRIMARY KEY,
  synced_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  station_count INT DEFAULT 0,
  status VARCHAR(32) NOT NULL,
  message TEXT
);

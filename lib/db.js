/**
 * PostgreSQL Database Helper for CWA Weather Stations
 * Compatible with Vercel Postgres, Neon, Supabase, Railway, and standard PostgreSQL.
 */
const { Pool } = require('pg');

let pool = null;

function getPool() {
  if (pool) return pool;

  const connectionString =
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL_NON_POOLING;

  if (!connectionString) {
    return null;
  }

  pool = new Pool({
    connectionString,
    ssl: connectionString.includes('localhost') ? false : { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });

  return pool;
}

/**
 * Automatically create tables if they do not exist
 */
async function initSchema() {
  const p = getPool();
  if (!p) return false;

  const schemaQuery = `
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
  `;

  const client = await p.connect();
  try {
    await client.query(schemaQuery);
    return true;
  } finally {
    client.release();
  }
}

/**
 * Save / Upsert parsed CWA stations & observations
 */
async function saveWeatherBatch(stationsData) {
  const p = getPool();
  if (!p) {
    throw new Error('DATABASE_URL or POSTGRES_URL is not configured.');
  }

  await initSchema();
  const client = await p.connect();

  try {
    await client.query('BEGIN');

    for (const item of stationsData) {
      // 1. Upsert Station Info
      await client.query(
        `INSERT INTO stations (station_id, station_name, county, township, lat, lon, elevation, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
         ON CONFLICT (station_id)
         DO UPDATE SET
           station_name = EXCLUDED.station_name,
           county = EXCLUDED.county,
           township = EXCLUDED.township,
           lat = EXCLUDED.lat,
           lon = EXCLUDED.lon,
           elevation = EXCLUDED.elevation,
           updated_at = NOW();`,
        [
          item.stationId,
          item.stationName,
          item.county,
          item.township,
          item.lat,
          item.lon,
          item.elevation || 0,
        ]
      );

      // 2. Insert or Ignore Observation Record
      if (item.obsTime) {
        await client.query(
          `INSERT INTO weather_records (station_id, temperature, humidity, rainfall, wind_speed, obs_time)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT ON CONSTRAINT uq_station_obs_time
           DO UPDATE SET
             temperature = EXCLUDED.temperature,
             humidity = EXCLUDED.humidity,
             rainfall = EXCLUDED.rainfall,
             wind_speed = EXCLUDED.wind_speed;`,
          [
            item.stationId,
            item.temperature,
            item.humidity,
            item.rainfall,
            item.windSpeed,
            item.obsTime,
          ]
        );
      }
    }

    // 3. Log Sync
    await client.query(
      `INSERT INTO sync_logs (station_count, status, message)
       VALUES ($1, 'SUCCESS', 'CWA Sync complete');`,
      [stationsData.length]
    );

    await client.query('COMMIT');
    return { success: true, count: stationsData.length };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Retrieve latest weather observation for every station from PostgreSQL
 */
async function getLatestWeatherFromDB() {
  const p = getPool();
  if (!p) return null;

  const client = await p.connect();
  try {
    // Query DISTINCT ON station_id ordered by obs_time DESC
    const result = await client.query(`
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
    `);

    const logResult = await client.query(`
      SELECT synced_at, status FROM sync_logs ORDER BY id DESC LIMIT 1;
    `);

    const lastSync = logResult.rows.length > 0 ? logResult.rows[0].synced_at : null;

    return {
      source: 'postgresql',
      lastSyncedAt: lastSync,
      totalStations: result.rows.length,
      stations: result.rows,
    };
  } finally {
    client.release();
  }
}

module.exports = {
  getPool,
  initSchema,
  saveWeatherBatch,
  getLatestWeatherFromDB,
};

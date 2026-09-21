const { saveWeatherBatch } = require('../lib/db');
const { fetchCWAData, getSampleTaiwanStations } = require('../lib/cwa');

module.exports = async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Optional: check CRON_SECRET for protected cron jobs
  const authHeader = req.headers.authorization;
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    // If not matching secret and not explicitly running manual request, can optionally guard
  }

  try {
    const apiKey = process.env.CWA_API_KEY;
    let stationsToSave = [];
    let dataSource = 'cwa_api';

    if (apiKey) {
      stationsToSave = await fetchCWAData(apiKey);
    } else {
      // Fallback sample data if API key not present
      stationsToSave = getSampleTaiwanStations();
      dataSource = 'sample_fallback';
    }

    if (stationsToSave.length === 0) {
      return res.status(400).json({
        status: 'warning',
        message: 'No stations retrieved to sync.',
      });
    }

    // Save to PostgreSQL if DATABASE_URL or POSTGRES_URL is configured
    if (process.env.POSTGRES_URL || process.env.DATABASE_URL) {
      const result = await saveWeatherBatch(stationsToSave);
      return res.status(200).json({
        status: 'success',
        message: `Successfully synced ${result.count} stations to PostgreSQL`,
        syncedCount: result.count,
        dataSource,
        syncedAt: new Date().toISOString(),
      });
    } else {
      return res.status(200).json({
        status: 'success_memory_only',
        message: 'CWA data fetched successfully. Set POSTGRES_URL to persist into PostgreSQL.',
        syncedCount: stationsToSave.length,
        dataSource,
        syncedAt: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error('CWA Sync Error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

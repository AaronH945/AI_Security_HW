const { getLatestWeatherFromDB, getPool } = require('../lib/db');
const { fetchCWAData, getSampleTaiwanStations } = require('../lib/cwa');

module.exports = async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // 1. Try fetching latest observations from PostgreSQL
    if (getPool()) {
      try {
        const dbResult = await getLatestWeatherFromDB();
        if (dbResult && dbResult.stations && dbResult.stations.length > 0) {
          return res.status(200).json({
            status: 'success',
            source: 'postgresql',
            lastSyncedAt: dbResult.lastSyncedAt || new Date().toISOString(),
            totalStations: dbResult.totalStations,
            stations: dbResult.stations,
          });
        }
      } catch (dbErr) {
        console.warn('PostgreSQL query failed, attempting CWA direct fallback:', dbErr.message);
      }
    }

    // 2. If PostgreSQL is empty or not configured, try fetching directly from CWA Open Data
    if (process.env.CWA_API_KEY) {
      try {
        const cwaStations = await fetchCWAData(process.env.CWA_API_KEY);
        return res.status(200).json({
          status: 'success',
          source: 'cwa_direct',
          lastSyncedAt: new Date().toISOString(),
          totalStations: cwaStations.length,
          stations: cwaStations,
        });
      } catch (cwaErr) {
        console.warn('CWA Direct fetch failed, fallback to sample data:', cwaErr.message);
      }
    }

    // 3. Built-in Fallback for out-of-the-box demo
    const sample = getSampleTaiwanStations();
    return res.status(200).json({
      status: 'success',
      source: 'demo_fallback',
      lastSyncedAt: new Date().toISOString(),
      totalStations: sample.length,
      stations: sample,
      message: 'Demo dataset loaded. Configure POSTGRES_URL and CWA_API_KEY in Vercel for live synchronization.',
    });
  } catch (error) {
    console.error('Unhandled Weather API Error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

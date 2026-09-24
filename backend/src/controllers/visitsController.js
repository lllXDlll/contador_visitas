const visitsService = require('../services/visitsService');

async function handleRegisterVisit(req, res) {
  try {
    await visitsService.registerVisit();
    res.json({ success: true });
  } catch (error) {
    console.error('Error in handleRegisterVisit:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function handleGetTotalVisits(req, res) {
  try {
    const total = await visitsService.getTotalVisits();
    res.json({ total });
  } catch (error) {
    console.error('Error in handleGetTotalVisits:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

module.exports = {
  handleRegisterVisit,
  handleGetTotalVisits
};

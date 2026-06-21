const express = require('express');
const router  = express.Router();

const ML_URL = process.env.ML_SERVICE_URL || 'http://localhost:5001';

router.post('/api/recommend', async (req, res) => {
  try {
    const response = await fetch(`${ML_URL}/recommend`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(req.body),
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch {
    return res.status(503).json({ error: 'ML service unavailable' });
  }
});

module.exports = router;

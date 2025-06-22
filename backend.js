const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());

const MOLLIE_API_KEY = 'live_HHADsn5K6MrWkBBfH7r2mwcJdW4ncf';

app.get('/donations', async (req, res) => {
  try {
    const response = await axios.get('https://api.mollie.com/v2/payments?limit=50', {
      headers: {
        Authorization: `Bearer ${MOLLIE_API_KEY}`,
      },
    });

    const payments = response.data._embedded.payments;
    const successful = payments.filter(p => p.status === 'paid');

    const donations = successful.map(p => ({
      amount: parseFloat(p.amount.value),
      date: p.createdAt,
    }));

    const total = donations.reduce((sum, d) => sum + d.amount, 0);

    res.json({ total, donations });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch Mollie data' });
  }
});

app.listen(3000, () => {
  console.log('✅ Mollie backend running at http://localhost:3000');
});

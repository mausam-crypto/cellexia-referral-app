const rateLimit = require('express-rate-limit');
require('dotenv').config();
require('./src/database/initDatabase');


const express = require('express');
const cors = require('cors');
const referralRoutes = require('./src/routes/referral');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {

  res.json({
    success: true,
    app: 'Cellexia Referral Engine'
  });

});

const PORT = process.env.PORT || 3000;
const referralLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message:
      'Too many referral submissions. Please try again later.'
  }
});

app.use(
  '/api/referral',
  referralLimiter
);
app.use('/api/referral', referralRoutes);

const webhookRoutes =
require('./src/routes/webhook');
app.use(
  '/webhooks',
  webhookRoutes
);
app.listen(PORT, () => {

  console.log(
    `Referral Engine running on port ${PORT}`
  );

});
const axios = require('axios');

let cachedToken = null;
let tokenExpiry = null;

async function getAccessToken() {

  const now = Date.now();

  if (
    cachedToken &&
    tokenExpiry &&
    now < tokenExpiry
  ) {
    return cachedToken;
  }

  const response = await axios.post(
    `https://${process.env.SHOPIFY_STORE}/admin/oauth/access_token`,
    new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: process.env.SHOPIFY_CLIENT_ID,
      client_secret: process.env.SHOPIFY_CLIENT_SECRET
    }),
    {
      headers: {
        'Content-Type':
          'application/x-www-form-urlencoded'
      }
    }
  );

  cachedToken = response.data.access_token;

  tokenExpiry =
    now +
    ((response.data.expires_in - 300) * 1000);

  console.log('Shopify token refreshed');

  return cachedToken;
}

module.exports = {
  getAccessToken
};
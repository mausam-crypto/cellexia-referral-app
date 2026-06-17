const axios = require('axios');

async function sendReferralToKlaviyo(
  friendEmail,
  discountCode,
  referrerName
) {

  try {

    const response = await axios.post(
      'https://a.klaviyo.com/api/events/',
      {
        data: {
          type: 'event',
          attributes: {
            properties: {
              discount_code: discountCode,
              referrer_name: referrerName
            },
            metric: {
              data: {
                type: 'metric',
                attributes: {
                  name: 'Referral Invitation Sent'
                }
              }
            },
            profile: {
              data: {
                type: 'profile',
                attributes: {
                  email: friendEmail
                }
              }
            }
          }
        }
      },
      {
        headers: {
          Authorization: `Klaviyo-API-Key ${process.env.KLAVIYO_PRIVATE_KEY}`,
          accept: 'application/json',
          revision: '2024-10-15',
          'content-type': 'application/json'
        }
      }
    );

    console.log(
      'KLAVIYO RESPONSE:',
      JSON.stringify(response.data, null, 2)
    );

    return response.data;

  } catch (error) {

    console.error(
      'KLAVIYO ERROR:',
      error.response?.data || error.message
    );

    throw error;

  }

}

module.exports = {
  sendReferralToKlaviyo
};
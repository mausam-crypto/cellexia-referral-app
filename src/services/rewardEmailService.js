const axios = require('axios');

async function sendRewardEmail(
  email,
  rewardCode,
  friendEmail
) {

  const response = await axios.post(
    'https://a.klaviyo.com/api/events/',
    {
      data: {
        type: 'event',
        attributes: {
          properties: {
            reward_code: rewardCode,
            friend_email: friendEmail
          },
          metric: {
            data: {
              type: 'metric',
              attributes: {
                name: 'Referral Reward Earned'
              }
            }
          },
          profile: {
            data: {
              type: 'profile',
              attributes: {
                email: email
              }
            }
          }
        }
      }
    },
    {
      headers: {
        Authorization:
          `Klaviyo-API-Key ${process.env.KLAVIYO_PRIVATE_KEY}`,
        accept: 'application/json',
        revision: '2024-10-15',
        'content-type': 'application/json'
      }
    }
  );

  console.log(
    'REWARD KLAVIYO RESPONSE:',
    JSON.stringify(response.data, null, 2)
  );

  return response.data;
}

module.exports = {
  sendRewardEmail
};
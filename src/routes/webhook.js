router.post('/', async (req, res) => {

  console.log('REFERRAL ENDPOINT HIT');
  console.log(req.body);
});

const express = require('express');
const router = express.Router();

const {
  sendRewardEmail
} = require(
  '../services/rewardEmailService'
);

const {
  createRewardDiscount
} = require('../services/rewardService');
const db = require('../database/db');

router.post(
  '/order-created',
  async (req, res) => {

    try {

      const {
        order_id,
        email,
        discount_code
      } = req.body;

      console.log(
        'ORDER WEBHOOK RECEIVED'
      );

      const referral =
        await new Promise(
          (resolve, reject) => {

            db.get(
              `
              SELECT *
FROM referrals
WHERE friend_email = ?
ORDER BY id DESC
LIMIT 1
              `,
              [email],
              (err, row) => {

                if (err) reject(err);
                else resolve(row);

              }
            );

          }
        );

      if (!referral) {

        console.log(
          'No referral found'
        );

        return res
          .status(200)
          .send('No referral');

      }

      console.log(
        'Referral Found'
      );

      console.log(referral);

if (
  referral.status === 'completed'
) {

  console.log(
    'Reward already issued'
  );

  return res
    .status(200)
    .send('Already processed');

}


      const reward =
  await createRewardDiscount(
    referral.referrer_email
  );

console.log(
  'Reward Code:',
  reward.code
);

await new Promise(
  (resolve, reject) => {

    db.run(
      `
      UPDATE referrals
      SET
        reward_discount_code = ?,
        status = 'completed',
        order_id = ?
      WHERE id = ?
      `,
      [
        reward.code,
        order_id,
        referral.id
      ],
      function(err) {

        if (err) reject(err);
        else resolve();

      }
    );

  }
);

console.log('CALLING KLAVIYO REWARD EVENT');

await sendRewardEmail(
  referral.referrer_email,
  reward.code,
  referral.friend_email
);

console.log('KLAVIYO REWARD EVENT FINISHED');

      return res
        .status(200)
        .send('Referral Found');

    } catch (error) {

      console.error(error);

      return res
        .status(500)
        .send('error');

    }

  }
);

module.exports = router;

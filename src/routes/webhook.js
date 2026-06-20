const express = require('express');
const router = express.Router();

const {
  sendRewardEmail
} = require('../services/rewardEmailService');

const {
  createRewardDiscount
} = require('../services/rewardService');

const db = require('../database/db');

router.post('/order-created', async (req, res) => {

  try {

    console.log('ORDER WEBHOOK RECEIVED');
    console.log(req.body);

    const {
      order_id,
      email,
      discount_code
    } = req.body;

    if (!order_id || !email) {

      console.log('Missing webhook fields');

      return res
        .status(400)
        .send('Missing fields');

    }

    const existingOrder =
      await new Promise((resolve, reject) => {

        db.get(
          `
          SELECT *
          FROM referrals
          WHERE order_id = ?
          `,
          [order_id],
          (err, row) => {

            if (err) reject(err);
            else resolve(row);

          }
        );

      });

    if (existingOrder) {

      console.log('Order already processed');

      return res
        .status(200)
        .send('Already processed');

    }

    const referral =
      await new Promise((resolve, reject) => {

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

      });

    if (!referral) {

      console.log('No referral found');

      return res
        .status(200)
        .send('No referral');

    }

    console.log('Referral Found');
    console.log(referral);

    if (
      !discount_code ||
      discount_code !== referral.friend_discount_code
    ) {

      console.log('Referral discount not used');

      return res
        .status(200)
        .send('Discount not used');

    }

    if (
      referral.status === 'completed'
    ) {

      console.log('Reward already issued');

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

    await new Promise((resolve, reject) => {

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

    });

    console.log(
      'CALLING KLAVIYO REWARD EVENT'
    );

    await sendRewardEmail(
      referral.referrer_email,
      reward.code,
      referral.friend_email
    );

    console.log(
      'KLAVIYO REWARD EVENT FINISHED'
    );

    return res
      .status(200)
      .send('Referral processed');

  } catch (error) {

    console.error(error);

    return res
      .status(500)
      .send('error');

  }

});

module.exports = router;

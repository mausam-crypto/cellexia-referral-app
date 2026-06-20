const {
  sendReferralToKlaviyo
} = require('../services/klaviyoService');

const {
  createFriendDiscount
} = require('../services/discountService');

const express = require('express');
const router = express.Router();

const db = require('../database/db');

router.post('/', async (req, res) => {

  console.log('========================');
  console.log('REFERRAL ENDPOINT HIT');
  console.log('BODY RECEIVED:', req.body);
  console.log('========================');

  try {

    const {
      referrer_name,
      referrer_email,
      friends
    } = req.body;

    if (
      !referrer_name ||
      !referrer_email ||
      !friends ||
      !friends.length
    ) {

      console.log('VALIDATION FAILED');

      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });

    }

    console.log(
      `Referral received from ${referrer_email}`
    );

    const uniqueFriends = [
      ...new Set(
        friends.map(
          email =>
            email.toLowerCase().trim()
        )
      )
    ];

    let savedCount = 0;

    for (const friend of uniqueFriends) {

      console.log('PROCESSING FRIEND:', friend);

      if (
        friend ===
        referrer_email.toLowerCase().trim()
      ) {

        return res.status(400).json({
          success: false,
          message: 'You cannot refer yourself'
        });

      }

      const existingReferral =
        await new Promise(
          (resolve, reject) => {

            db.get(
              `
              SELECT id
              FROM referrals
              WHERE friend_email = ?
              `,
              [friend],
              (err, row) => {

                if (err) reject(err);
                else resolve(row);

              }
            );

          }
        );

      if (existingReferral) {

        console.log(
          'Duplicate referral skipped:',
          friend
        );

        continue;

      }

      console.log('CREATING DISCOUNT');

      // TEMP TEST MODE
      const discount = {
        code: 'TEST123'
      };

      console.log(
        'DISCOUNT CREATED:',
        discount.code
      );

      /*
      const discount =
        await createFriendDiscount(friend);

      await sendReferralToKlaviyo(
        friend,
        discount.code,
        referrer_name
      );
      */

      db.run(
        `
        INSERT INTO referrals (
          referrer_name,
          referrer_email,
          friend_email,
          friend_discount_code
        )
        VALUES (?, ?, ?, ?)
        `,
        [
          referrer_name,
          referrer_email,
          friend,
          discount.code
        ]
      );

      savedCount++;

    }

    return res.json({
      success: true,
      message: `${savedCount} referrals saved`
    });

  } catch (error) {

    console.error('ERROR:', error);

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }

});

router.get('/all', (req, res) => {

  db.all(
    `
    SELECT *
    FROM referrals
    ORDER BY id DESC
    `,
    [],
    (err, rows) => {

      if (err) {

        return res.status(500).json({
          success: false,
          error: err.message
        });

      }

      return res.json(rows);

    }
  );

});

module.exports = router;

const db = require('./db');

db.serialize(() => {

  db.run(`
    CREATE TABLE IF NOT EXISTS referrals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,

      referrer_name TEXT,
      referrer_email TEXT,

      friend_email TEXT,

      friend_discount_code TEXT,
      reward_discount_code TEXT,

      status TEXT DEFAULT 'pending',

      order_id TEXT,

      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

});

console.log('Referral table ready');
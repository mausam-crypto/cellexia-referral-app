const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database(
  '/var/data/referrals.db',
  (err) => {

    if (err) {

      console.error(
        'Database connection failed:',
        err.message
      );

    } else {

      console.log(
        'SQLite connected'
      );

    }

  }
);

module.exports = db;

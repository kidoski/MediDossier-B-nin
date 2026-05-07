require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const db = require('./db');
const fs = require('fs');
const path = require('path');

const sql = fs.readFileSync(path.join(__dirname, 'database.sql'), 'utf8');
const queries = sql.split(';').filter(q => q.trim() !== '');

async function initDB() {
  try {
    for (const query of queries) {
      await db.query(query);
    }
    console.log('✅ Tables créées avec succès !');
    process.exit(0);
  } catch (err) {
    console.error('❌ Erreur :', err);
    process.exit(1);
  }
}

initDB();
require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const db = require('./config/db');
const bcrypt = require('bcryptjs');

async function reset() {
  const hash = await bcrypt.hash('admin123', 10);
  await db.query(
    'UPDATE utilisateurs SET mot_de_passe = ? WHERE email = ?',
    [hash, 'admin@hopital.bj']
  );
  console.log('✅ Mot de passe réinitialisé !');
  process.exit(0);
}

reset();
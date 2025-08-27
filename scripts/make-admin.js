// scripts/make-admin.js
const admin = require('firebase-admin');
const serviceAccount = require('../service-account.json');

// Initialize the Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const email = process.argv[2];

if (!email) {
  console.error('Please provide an email address as an argument.');
  process.exit(1);
}

async function makeAdmin() {
  try {
    const user = await admin.auth().getUserByEmail(email);
    await admin.auth().setCustomUserClaims(user.uid, { admin: true });
    console.log(`Successfully made ${email} an admin.`);
  } catch (error) {
    console.error('Error making user an admin:', error);
  } finally {
    process.exit(0);
  }
}

makeAdmin();

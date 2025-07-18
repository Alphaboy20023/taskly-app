// prepare-private-key.js
const fs = require('fs');
const path = require('path');

// Assuming 'taskly_key.json' is directly in the same directory as this script,
// and you are running the script from that directory (your 'taskly-app' root).
const serviceAccountPath = path.resolve(__dirname, 'taskly_key.json'); // Adjusted path

try {
  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
  const privateKey = serviceAccount.private_key;

  // JSON.stringify will correctly escape newlines and other special characters
  // We then remove the outer quotes added by JSON.stringify
  const escapedPrivateKey = JSON.stringify(privateKey).slice(1, -1);

  console.log('Copy this EXACT string for Vercel FIREBASE_PRIVATE_KEY:');
  console.log(escapedPrivateKey);
} catch (error) {
  console.error('Error reading or processing service account key:', error);
  console.error('Please ensure the path to your serviceAccountKey.json is correct and that the file exists.');
}
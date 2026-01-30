const webpush = require('web-push');
const keys = webpush.generateVAPIDKeys();
console.log('\nAjoute ces lignes dans .env.local ou dans Vercel (Environment Variables) :\n');
console.log('VAPID_PUBLIC_KEY=' + keys.publicKey);
console.log('VAPID_PRIVATE_KEY=' + keys.privateKey);
console.log('\n');

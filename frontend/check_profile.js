// Quick script to check your profile in Firestore
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, getDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkProfile(wallet) {
  const userRef = doc(db, 'users', wallet.toLowerCase());
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    const data = userSnap.data();
    console.log('\nYour Profile:');
    console.log('- Gender:', data.gender);
    console.log('- Looking For:', data.lookingFor);
    console.log('\nTo see test profiles, you need:');
    console.log('- lookingFor: "female"');
  } else {
    console.log('Profile not found for wallet:', wallet);
  }
}

const wallet = process.argv[2];
if (!wallet) {
  console.log('Usage: node check_profile.js YOUR_WALLET_ADDRESS');
  process.exit(1);
}

checkProfile(wallet).catch(console.error);

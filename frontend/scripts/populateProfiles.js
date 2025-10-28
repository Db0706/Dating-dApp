require('dotenv').config({ path: '.env.local' });
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc } = require('firebase/firestore');

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

const testProfiles = [
  // SECTION 1: Female Looking for Male (5 profiles)
  {
    wallet: '0x1111111111111111111111111111111111111111',
    displayName: 'Emma Wilson',
    age: 24,
    gender: 'female',
    lookingFor: 'male',
    bio: 'Coffee addict ☕ | Yoga enthusiast 🧘‍♀️ | Dog mom to Luna 🐕 | Looking for someone to explore the city with!',
    interests: ['yoga', 'coffee', 'dogs', 'travel', 'photography'],
    location: 'San Francisco',
    photos: [],
    boostedUntil: 0,
    createdAt: Date.now(),
    lastSeen: Date.now(),
  },
  {
    wallet: '0x2222222222222222222222222222222222222222',
    displayName: 'Sarah Chen',
    age: 26,
    gender: 'female',
    lookingFor: 'male',
    bio: 'Tech enthusiast 💻 | Foodie & home chef 🍜 | Marathon runner 🏃‍♀️ | Love deep conversations over wine',
    interests: ['tech', 'cooking', 'running', 'wine', 'reading'],
    location: 'San Francisco',
    photos: [],
    boostedUntil: 0,
    createdAt: Date.now(),
    lastSeen: Date.now(),
  },
  {
    wallet: '0x3333333333333333333333333333333333333333',
    displayName: 'Maya Rodriguez',
    age: 23,
    gender: 'female',
    lookingFor: 'male',
    bio: 'Artist 🎨 | Plant parent 🌿 | Vintage fashion lover 👗 | Live music junkie 🎵 | Let\'s grab tacos and talk about life!',
    interests: ['art', 'music', 'fashion', 'plants', 'food'],
    location: 'San Francisco',
    photos: [],
    boostedUntil: 0,
    createdAt: Date.now(),
    lastSeen: Date.now(),
  },
  {
    wallet: '0x4444444444444444444444444444444444444444',
    displayName: 'Jessica Park',
    age: 27,
    gender: 'female',
    lookingFor: 'male',
    bio: 'Marketing pro by day 📱 | Dance class enthusiast by night 💃 | Beach lover 🏖️ | Always planning the next adventure!',
    interests: ['dancing', 'marketing', 'beach', 'travel', 'fitness'],
    location: 'San Francisco',
    photos: [],
    boostedUntil: 0,
    createdAt: Date.now(),
    lastSeen: Date.now(),
  },
  {
    wallet: '0x5555555555555555555555555555555555555555',
    displayName: 'Rachel Kim',
    age: 25,
    gender: 'female',
    lookingFor: 'male',
    bio: 'Graphic designer ✨ | Cat mom to 2 furballs 🐱 | Sushi connoisseur 🍣 | Binge-watching Netflix shows | Let\'s exchange memes!',
    interests: ['design', 'cats', 'sushi', 'netflix', 'memes'],
    location: 'San Francisco',
    photos: [],
    boostedUntil: 0,
    createdAt: Date.now(),
    lastSeen: Date.now(),
  },

  // SECTION 2: Male Looking for Female (5 profiles)
  {
    wallet: '0x6666666666666666666666666666666666666666',
    displayName: 'James Cooper',
    age: 27,
    gender: 'male',
    lookingFor: 'female',
    bio: 'Software engineer 👨‍💻 | Coffee snob ☕ | Gym enthusiast 💪 | Love hiking on weekends 🏔️ | Let\'s grab a coffee!',
    interests: ['tech', 'coffee', 'fitness', 'hiking', 'travel'],
    location: 'San Francisco',
    photos: [],
    boostedUntil: 0,
    createdAt: Date.now(),
    lastSeen: Date.now(),
  },
  {
    wallet: '0x7777777777777777777777777777777777777777',
    displayName: 'Marcus Chen',
    age: 29,
    gender: 'male',
    lookingFor: 'female',
    bio: 'Product manager 📱 | Basketball player 🏀 | Foodie 🍜 | Crypto enthusiast ₿ | Looking for adventure partner!',
    interests: ['basketball', 'food', 'crypto', 'travel', 'tech'],
    location: 'San Francisco',
    photos: [],
    boostedUntil: 0,
    createdAt: Date.now(),
    lastSeen: Date.now(),
  },
  {
    wallet: '0x8888888888888888888888888888888888888888',
    displayName: 'Ryan Martinez',
    age: 25,
    gender: 'male',
    lookingFor: 'female',
    bio: 'Graphic designer ✨ | Dog lover 🐕 | Beach volleyball 🏐 | Sunset photographer 📷 | Swipe right for good vibes!',
    interests: ['design', 'dogs', 'volleyball', 'photography', 'beach'],
    location: 'San Francisco',
    photos: [],
    boostedUntil: 0,
    createdAt: Date.now(),
    lastSeen: Date.now(),
  },
  {
    wallet: '0x9999999999999999999999999999999999999999',
    displayName: 'David Kim',
    age: 31,
    gender: 'male',
    lookingFor: 'female',
    bio: 'Startup founder 🚀 | Rock climbing 🧗‍♂️ | Wine connoisseur 🍷 | Jazz lover 🎷 | Building the future, one line at a time!',
    interests: ['startups', 'climbing', 'wine', 'jazz', 'travel'],
    location: 'San Francisco',
    photos: [],
    boostedUntil: 0,
    createdAt: Date.now(),
    lastSeen: Date.now(),
  },
  {
    wallet: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    displayName: 'Michael Torres',
    age: 28,
    gender: 'male',
    lookingFor: 'female',
    bio: 'Architect 🏗️ | Marathon runner 🏃‍♂️ | Craft beer enthusiast 🍺 | Vinyl collector 🎵 | Let\'s explore the city together!',
    interests: ['architecture', 'running', 'beer', 'music', 'exploring'],
    location: 'San Francisco',
    photos: [],
    boostedUntil: 0,
    createdAt: Date.now(),
    lastSeen: Date.now(),
  },

  // SECTION 3: Female Looking for Female (5 profiles)
  {
    wallet: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    displayName: 'Alex Rivera',
    age: 26,
    gender: 'female',
    lookingFor: 'female',
    bio: 'Photographer 📷 | Adventure seeker 🌍 | Vegan chef 🌱 | Weekend warrior 🏕️ | Looking for my travel buddy and life partner!',
    interests: ['photography', 'travel', 'vegan', 'camping', 'adventure'],
    location: 'San Francisco',
    photos: [],
    boostedUntil: 0,
    createdAt: Date.now(),
    lastSeen: Date.now(),
  },
  {
    wallet: '0xcccccccccccccccccccccccccccccccccccccccc',
    displayName: 'Jordan Lee',
    age: 24,
    gender: 'female',
    lookingFor: 'female',
    bio: 'Software developer 💻 | Gamer girl 🎮 | Anime lover 🎌 | Cat enthusiast 🐱 | Let\'s build something amazing together!',
    interests: ['tech', 'gaming', 'anime', 'cats', 'coding'],
    location: 'San Francisco',
    photos: [],
    boostedUntil: 0,
    createdAt: Date.now(),
    lastSeen: Date.now(),
  },
  {
    wallet: '0xdddddddddddddddddddddddddddddddddddddddd',
    displayName: 'Sam Taylor',
    age: 28,
    gender: 'female',
    lookingFor: 'female',
    bio: 'Fitness coach 💪 | Yoga instructor 🧘‍♀️ | Health nut 🥗 | Outdoor enthusiast 🏃‍♀️ | Looking for someone to share this journey with!',
    interests: ['fitness', 'yoga', 'health', 'outdoors', 'wellness'],
    location: 'San Francisco',
    photos: [],
    boostedUntil: 0,
    createdAt: Date.now(),
    lastSeen: Date.now(),
  },
  {
    wallet: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
    displayName: 'Riley Morgan',
    age: 25,
    gender: 'female',
    lookingFor: 'female',
    bio: 'Music producer 🎵 | DJ on weekends 🎧 | Concert goer 🎤 | Vinyl collector 💿 | Let\'s vibe to the same frequency!',
    interests: ['music', 'djing', 'concerts', 'vinyl', 'festivals'],
    location: 'San Francisco',
    photos: [],
    boostedUntil: 0,
    createdAt: Date.now(),
    lastSeen: Date.now(),
  },
  {
    wallet: '0xffffffffffffffffffffffffffffffffffffffff',
    displayName: 'Casey Brooks',
    age: 30,
    gender: 'female',
    lookingFor: 'female',
    bio: 'Creative director 🎨 | Art gallery regular 🖼️ | Coffee addict ☕ | Bookworm 📚 | Looking for intellectual conversations and cozy dates!',
    interests: ['art', 'design', 'coffee', 'reading', 'museums'],
    location: 'San Francisco',
    photos: [],
    boostedUntil: 0,
    createdAt: Date.now(),
    lastSeen: Date.now(),
  },

  // SECTION 4: Male Looking for Male (5 profiles)
  {
    wallet: '0x0000000000000000000000000000000000000001',
    displayName: 'Chris Anderson',
    age: 27,
    gender: 'male',
    lookingFor: 'male',
    bio: 'Financial analyst 📊 | Gym rat 💪 | Brunch enthusiast 🥞 | Dog dad 🐕 | Looking for someone to build a future with!',
    interests: ['finance', 'fitness', 'brunch', 'dogs', 'travel'],
    location: 'San Francisco',
    photos: [],
    boostedUntil: 0,
    createdAt: Date.now(),
    lastSeen: Date.now(),
  },
  {
    wallet: '0x0000000000000000000000000000000000000002',
    displayName: 'Tyler Bennett',
    age: 29,
    gender: 'male',
    lookingFor: 'male',
    bio: 'Interior designer 🏠 | Plant daddy 🌿 | Pottery enthusiast 🏺 | Vintage shopping lover 🛍️ | Let\'s create a beautiful life together!',
    interests: ['design', 'plants', 'pottery', 'vintage', 'art'],
    location: 'San Francisco',
    photos: [],
    boostedUntil: 0,
    createdAt: Date.now(),
    lastSeen: Date.now(),
  },
  {
    wallet: '0x0000000000000000000000000000000000000003',
    displayName: 'Kevin Patel',
    age: 26,
    gender: 'male',
    lookingFor: 'male',
    bio: 'Doctor 👨‍⚕️ | Runner 🏃‍♂️ | Book club member 📚 | Wine taster 🍷 | Looking for someone kind, smart, and adventurous!',
    interests: ['medicine', 'running', 'reading', 'wine', 'travel'],
    location: 'San Francisco',
    photos: [],
    boostedUntil: 0,
    createdAt: Date.now(),
    lastSeen: Date.now(),
  },
  {
    wallet: '0x0000000000000000000000000000000000000004',
    displayName: 'Ethan Wright',
    age: 24,
    gender: 'male',
    lookingFor: 'male',
    bio: 'Chef 👨‍🍳 | Foodie to the core 🍝 | Cycling enthusiast 🚴‍♂️ | Movie buff 🎬 | Let\'s cook something delicious and watch movies all weekend!',
    interests: ['cooking', 'food', 'cycling', 'movies', 'baking'],
    location: 'San Francisco',
    photos: [],
    boostedUntil: 0,
    createdAt: Date.now(),
    lastSeen: Date.now(),
  },
  {
    wallet: '0x0000000000000000000000000000000000000005',
    displayName: 'Noah Garcia',
    age: 31,
    gender: 'male',
    lookingFor: 'male',
    bio: 'Teacher 📚 | Volunteer 🤝 | Hiking lover 🥾 | Board game nerd 🎲 | Looking for someone with a big heart and great sense of humor!',
    interests: ['teaching', 'volunteering', 'hiking', 'games', 'community'],
    location: 'San Francisco',
    photos: [],
    boostedUntil: 0,
    createdAt: Date.now(),
    lastSeen: Date.now(),
  },
];

async function populateProfiles() {
  console.log('🚀 Starting to populate Firestore with test profiles...\n');

  let successCount = 0;
  let errorCount = 0;

  for (const profile of testProfiles) {
    try {
      const docRef = doc(db, 'users', profile.wallet.toLowerCase());
      await setDoc(docRef, profile);
      console.log(`✅ Added: ${profile.displayName} (${profile.gender} → ${profile.lookingFor})`);
      successCount++;
    } catch (error) {
      console.error(`❌ Failed to add ${profile.displayName}:`, error.message);
      errorCount++;
    }
  }

  console.log('\n✨ Done!');
  console.log(`📊 Results: ${successCount} successful, ${errorCount} failed`);
  console.log('\n🎉 You can now refresh your app and see all the test profiles!');

  process.exit(0);
}

populateProfiles().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});

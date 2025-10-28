# Test Profiles for Firestore

Follow these steps to add 10 test profiles to your Firestore database.

## Steps to Add Profiles

1. Go to https://console.firebase.google.com
2. Select your "dating-dapp" project
3. Click "Firestore Database" in the left menu
4. Navigate to the `users` collection (or create it if it doesn't exist)
5. For each profile below, click "Add document" and enter the data

## Important Notes

- The **Document ID** must match the **wallet** field exactly
- All **age** and **boostedUntil** fields must be set as **number** type (not string)
- The **interests** and **photos** fields must be set as **array** type
- Copy the wallet addresses exactly as shown
- Using placeholder images from UI-Avatars.com (text-based avatars)

---

## Profile 1 - Emma Wilson

**Document ID:** `0x1111111111111111111111111111111111111111`

**Fields:**
- `wallet` (string): `0x1111111111111111111111111111111111111111`
- `displayName` (string): `Emma Wilson`
- `age` (number): `24`
- `gender` (string): `female`
- `lookingFor` (string): `male`
- `bio` (string): `Coffee addict ☕ | Yoga enthusiast 🧘‍♀️ | Dog mom to Luna 🐕 | Looking for someone to explore the city with!`
- `interests` (array): `["yoga", "coffee", "dogs", "travel", "photography"]`
- `location` (string): `San Francisco`
- `photos` (array): `["https://ui-avatars.com/api/?name=Emma+Wilson&size=512&background=FF6B9D&color=fff&bold=true"]`
- `boostedUntil` (number): `0`
- `createdAt` (timestamp): (use current timestamp)

---

## Profile 2 - Sarah Chen

**Document ID:** `0x2222222222222222222222222222222222222222`

**Fields:**
- `wallet` (string): `0x2222222222222222222222222222222222222222`
- `displayName` (string): `Sarah Chen`
- `age` (number): `26`
- `gender` (string): `female`
- `lookingFor` (string): `male`
- `bio` (string): `Tech enthusiast 💻 | Foodie & home chef 🍜 | Marathon runner 🏃‍♀️ | Love deep conversations over wine`
- `interests` (array): `["tech", "cooking", "running", "wine", "reading"]`
- `location` (string): `San Francisco`
- `photos` (array): `["https://ui-avatars.com/api/?name=Sarah+Chen&size=512&background=4ECDC4&color=fff&bold=true"]`
- `boostedUntil` (number): `0`
- `createdAt` (timestamp): (use current timestamp)

---

## Profile 3 - Maya Rodriguez

**Document ID:** `0x3333333333333333333333333333333333333333`

**Fields:**
- `wallet` (string): `0x3333333333333333333333333333333333333333`
- `displayName` (string): `Maya Rodriguez`
- `age` (number): `23`
- `gender` (string): `female`
- `lookingFor` (string): `male`
- `bio` (string): `Artist 🎨 | Plant parent 🌿 | Vintage fashion lover 👗 | Live music junkie 🎵 | Let's grab tacos and talk about life!`
- `interests` (array): `["art", "music", "fashion", "plants", "food"]`
- `location` (string): `San Francisco`
- `photos` (array): `["https://ui-avatars.com/api/?name=Maya+Rodriguez&size=512&background=FFD93D&color=333&bold=true"]`
- `boostedUntil` (number): `0`
- `createdAt` (timestamp): (use current timestamp)

---

## Profile 4 - Jessica Park

**Document ID:** `0x4444444444444444444444444444444444444444`

**Fields:**
- `wallet` (string): `0x4444444444444444444444444444444444444444`
- `displayName` (string): `Jessica Park`
- `age` (number): `27`
- `gender` (string): `female`
- `lookingFor` (string): `male`
- `bio` (string): `Marketing pro by day 📱 | Dance class enthusiast by night 💃 | Beach lover 🏖️ | Always planning the next adventure!`
- `interests` (array): `["dancing", "marketing", "beach", "travel", "fitness"]`
- `location` (string): `San Francisco`
- `photos` (array): `["https://ui-avatars.com/api/?name=Jessica+Park&size=512&background=A78BFA&color=fff&bold=true"]`
- `boostedUntil` (number): `0`
- `createdAt` (timestamp): (use current timestamp)

---

## Profile 5 - Alex Thompson

**Document ID:** `0x5555555555555555555555555555555555555555`

**Fields:**
- `wallet` (string): `0x5555555555555555555555555555555555555555`
- `displayName` (string): `Alex Thompson`
- `age` (number): `28`
- `gender` (string): `male`
- `lookingFor` (string): `female`
- `bio` (string): `Software engineer 👨‍💻 | Rock climbing addict 🧗‍♂️ | Craft beer enthusiast 🍺 | Board game nerd 🎲 | Let's build something cool!`
- `interests` (array): `["tech", "climbing", "beer", "gaming", "hiking"]`
- `location` (string): `San Francisco`
- `photos` (array): `["https://ui-avatars.com/api/?name=Alex+Thompson&size=512&background=3B82F6&color=fff&bold=true"]`
- `boostedUntil` (number): `0`
- `createdAt` (timestamp): (use current timestamp)

---

## Profile 6 - Rachel Kim

**Document ID:** `0x6666666666666666666666666666666666666666`

**Fields:**
- `wallet` (string): `0x6666666666666666666666666666666666666666`
- `displayName` (string): `Rachel Kim`
- `age` (number): `25`
- `gender` (string): `female`
- `lookingFor` (string): `male`
- `bio` (string): `Graphic designer ✨ | Cat mom to 2 furballs 🐱 | Sushi connoisseur 🍣 | Binge-watching Netflix shows | Let's exchange memes!`
- `interests` (array): `["design", "cats", "sushi", "netflix", "memes"]`
- `location` (string): `San Francisco`
- `photos` (array): `["https://ui-avatars.com/api/?name=Rachel+Kim&size=512&background=F43F5E&color=fff&bold=true"]`
- `boostedUntil` (number): `0`
- `createdAt` (timestamp): (use current timestamp)

---

## Profile 7 - Olivia Martinez

**Document ID:** `0x7777777777777777777777777777777777777777`

**Fields:**
- `wallet` (string): `0x7777777777777777777777777777777777777777`
- `displayName` (string): `Olivia Martinez`
- `age` (number): `29`
- `gender` (string): `female`
- `lookingFor` (string): `male`
- `bio` (string): `Lawyer by profession ⚖️ | Bookworm 📚 | Wine & paint nights 🍷 | Pilates instructor on weekends | Looking for my adventure partner!`
- `interests` (array): `["law", "reading", "wine", "pilates", "travel"]`
- `location` (string): `San Francisco`
- `photos` (array): `["https://ui-avatars.com/api/?name=Olivia+Martinez&size=512&background=10B981&color=fff&bold=true"]`
- `boostedUntil` (number): `0`
- `createdAt` (timestamp): (use current timestamp)

---

## Profile 8 - Sophia Anderson

**Document ID:** `0x8888888888888888888888888888888888888888`

**Fields:**
- `wallet` (string): `0x8888888888888888888888888888888888888888`
- `displayName` (string): `Sophia Anderson`
- `age` (number): `22`
- `gender` (string): `female`
- `lookingFor` (string): `male`
- `bio` (string): `Psychology student 🎓 | Podcast addict 🎧 | Brunch enthusiast 🥞 | Spontaneous traveler ✈️ | Swipe right for good vibes!`
- `interests` (array): `["psychology", "podcasts", "brunch", "travel", "music"]`
- `location` (string): `San Francisco`
- `photos` (array): `["https://ui-avatars.com/api/?name=Sophia+Anderson&size=512&background=EC4899&color=fff&bold=true"]`
- `boostedUntil` (number): `0`
- `createdAt` (timestamp): (use current timestamp)

---

## Profile 9 - Amanda Lewis

**Document ID:** `0x9999999999999999999999999999999999999999`

**Fields:**
- `wallet` (string): `0x9999999999999999999999999999999999999999`
- `displayName` (string): `Amanda Lewis`
- `age` (number): `30`
- `gender` (string): `female`
- `lookingFor` (string): `male`
- `bio` (string): `Startup founder 🚀 | Crypto enthusiast ₿ | Gym rat 💪 | Meditation practitioner 🧘 | Looking for someone ambitious and kind!`
- `interests` (array): `["startups", "crypto", "fitness", "meditation", "networking"]`
- `location` (string): `San Francisco`
- `photos` (array): `["https://ui-avatars.com/api/?name=Amanda+Lewis&size=512&background=8B5CF6&color=fff&bold=true"]`
- `boostedUntil` (number): `0`
- `createdAt` (timestamp): (use current timestamp)

---

## Profile 10 - Isabella White

**Document ID:** `0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa`

**Fields:**
- `wallet` (string): `0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa`
- `displayName` (string): `Isabella White`
- `age` (number): `26`
- `gender` (string): `female`
- `lookingFor` (string): `male`
- `bio` (string): `Photographer 📷 | Nature lover 🌲 | Vegan foodie 🥗 | Sunset chaser 🌅 | Adventure awaits! Let's create memories together!`
- `interests` (array): `["photography", "nature", "vegan", "hiking", "sunsets"]`
- `location` (string): `San Francisco`
- `photos` (array): `["https://ui-avatars.com/api/?name=Isabella+White&size=512&background=F59E0B&color=fff&bold=true"]`
- `boostedUntil` (number): `0`
- `createdAt` (timestamp): (use current timestamp)

---

## Verification

After adding all profiles:

1. Go back to your DatingDApp and click "Refresh"
2. You should now see 10 profiles to swipe through
3. Test the swipe functionality (drag cards or use buttons)
4. Try liking profiles to test HEART token rewards

## Tips

- All profiles are female looking for male, which should work if your profile is male looking for female
- If your profile has different preferences, adjust the `gender` and `lookingFor` fields accordingly
- The wallet addresses are dummy addresses for testing only
- Images are generated text-based avatars with colorful backgrounds
- You can replace images with better placeholders from https://randomuser.me/api/portraits/ if desired

## Alternative Image URLs (Optional)

If you want more realistic placeholder images, replace the photos array with one of these:

- `["https://i.pravatar.cc/512?img=1"]` (random avatar #1)
- `["https://i.pravatar.cc/512?img=5"]` (random avatar #5)
- `["https://randomuser.me/api/portraits/women/1.jpg"]` (realistic portrait)

Remember to use different numbers for each profile!

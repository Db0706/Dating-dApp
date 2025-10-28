import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  addDoc,
  CollectionReference,
  DocumentData,
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase (singleton pattern)
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

export const db = getFirestore(app);
export const storage = getStorage(app);

// Type definitions for database collections
export interface UserProfile {
  wallet: string;
  displayName: string;
  age: number;
  bio: string;
  gender: string;
  lookingFor: string;
  photos: string[];
  lastSeen: number;
  boostedUntil: number;
  createdAt: number;
  interests?: string[];
  location?: string;
}

export interface Like {
  fromWallet: string;
  toWallet: string;
  type: 'like' | 'superlike';
  timestamp: number;
}

export interface Match {
  matchId: string;
  userA: string;
  userB: string;
  createdAt: number;
  nftTokenIdA?: number;
  nftTokenIdB?: number;
}

export interface Message {
  matchId: string;
  fromWallet: string;
  message: string;
  sentAt: number;
  read: boolean;
}

// Collection references
export const usersCollection = collection(db, 'users') as CollectionReference<UserProfile>;
export const likesCollection = collection(db, 'likes') as CollectionReference<Like>;
export const matchesCollection = collection(db, 'matches') as CollectionReference<Match>;
export const messagesCollection = collection(db, 'messages') as CollectionReference<Message>;

/**
 * Get or create user profile
 */
export async function getUserProfile(wallet: string): Promise<UserProfile | null> {
  const userRef = doc(usersCollection, wallet.toLowerCase());
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    return userSnap.data();
  }
  return null;
}

/**
 * Create a new user profile
 */
export async function createUserProfile(profile: UserProfile): Promise<void> {
  const userRef = doc(usersCollection, profile.wallet.toLowerCase());
  await setDoc(userRef, {
    ...profile,
    createdAt: Date.now(),
    lastSeen: Date.now(),
    boostedUntil: 0,
  });
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  wallet: string,
  updates: Partial<UserProfile>
): Promise<void> {
  const userRef = doc(usersCollection, wallet.toLowerCase());
  await updateDoc(userRef, {
    ...updates,
    lastSeen: Date.now(),
  });
}

/**
 * Get profiles for swiping (excluding already liked/matched users)
 */
export async function getSwipeProfiles(
  currentWallet: string,
  excludeWallets: string[] = [],
  limitCount: number = 20
): Promise<UserProfile[]> {
  const currentUser = await getUserProfile(currentWallet);
  if (!currentUser) return [];

  const q = query(
    usersCollection,
    where('gender', '==', currentUser.lookingFor),
    orderBy('lastSeen', 'desc'),
    limit(limitCount)
  );

  const snapshot = await getDocs(q);
  const profiles: UserProfile[] = [];

  snapshot.forEach((doc) => {
    const profile = doc.data();
    // Exclude current user and already processed users
    if (
      profile.wallet.toLowerCase() !== currentWallet.toLowerCase() &&
      !excludeWallets.includes(profile.wallet.toLowerCase())
    ) {
      profiles.push(profile);
    }
  });

  return profiles;
}

/**
 * Record a like/superlike
 */
export async function recordLike(
  fromWallet: string,
  toWallet: string,
  type: 'like' | 'superlike'
): Promise<void> {
  await addDoc(likesCollection, {
    fromWallet: fromWallet.toLowerCase(),
    toWallet: toWallet.toLowerCase(),
    type,
    timestamp: Date.now(),
  });
}

/**
 * Check if two users have mutually liked each other
 */
export async function checkMutualLike(
  userA: string,
  userB: string
): Promise<boolean> {
  const q1 = query(
    likesCollection,
    where('fromWallet', '==', userA.toLowerCase()),
    where('toWallet', '==', userB.toLowerCase())
  );

  const q2 = query(
    likesCollection,
    where('fromWallet', '==', userB.toLowerCase()),
    where('toWallet', '==', userA.toLowerCase())
  );

  const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);

  return !snap1.empty && !snap2.empty;
}

/**
 * Create a match record
 */
export async function createMatch(
  userA: string,
  userB: string,
  nftTokenIdA?: number,
  nftTokenIdB?: number
): Promise<string> {
  const matchId = `${userA.toLowerCase()}_${userB.toLowerCase()}_${Date.now()}`;

  await setDoc(doc(matchesCollection, matchId), {
    matchId,
    userA: userA.toLowerCase(),
    userB: userB.toLowerCase(),
    createdAt: Date.now(),
    nftTokenIdA,
    nftTokenIdB,
  });

  return matchId;
}

/**
 * Get all matches for a user
 */
export async function getUserMatches(wallet: string): Promise<Match[]> {
  const walletLower = wallet.toLowerCase();

  const q1 = query(matchesCollection, where('userA', '==', walletLower));
  const q2 = query(matchesCollection, where('userB', '==', walletLower));

  const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);

  const matches: Match[] = [];
  snap1.forEach((doc) => matches.push(doc.data()));
  snap2.forEach((doc) => matches.push(doc.data()));

  // Sort by creation date
  matches.sort((a, b) => b.createdAt - a.createdAt);

  return matches;
}

/**
 * Upload image to Firebase Storage
 */
export async function uploadImage(
  file: File,
  folder: string = 'profiles'
): Promise<string> {
  const timestamp = Date.now();
  const filename = `${folder}/${timestamp}_${file.name}`;
  const storageRef = ref(storage, filename);

  await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(storageRef);

  return downloadURL;
}

/**
 * Send a message
 */
export async function sendMessage(
  matchId: string,
  fromWallet: string,
  message: string
): Promise<void> {
  await addDoc(messagesCollection, {
    matchId,
    fromWallet: fromWallet.toLowerCase(),
    message,
    sentAt: Date.now(),
    read: false,
  });
}

/**
 * Get messages for a match
 */
export async function getMessages(matchId: string): Promise<Message[]> {
  const q = query(
    messagesCollection,
    where('matchId', '==', matchId),
    orderBy('sentAt', 'asc')
  );

  const snapshot = await getDocs(q);
  const messages: Message[] = [];

  snapshot.forEach((doc) => messages.push(doc.data()));

  return messages;
}

/**
 * Update boost status in user profile (mirror from chain)
 */
export async function updateBoostStatus(
  wallet: string,
  boostedUntil: number
): Promise<void> {
  const userRef = doc(usersCollection, wallet.toLowerCase());
  await updateDoc(userRef, { boostedUntil });
}

/**
 * Get leaderboard (top users by HEART balance)
 * Note: This would need to be calculated off-chain by periodically
 * fetching balances from the blockchain
 */
export async function getLeaderboard(limitCount: number = 10): Promise<UserProfile[]> {
  // In production, you'd have a separate collection or field tracking HEART balances
  // For now, just return recent active users
  const q = query(usersCollection, orderBy('lastSeen', 'desc'), limit(limitCount));

  const snapshot = await getDocs(q);
  const users: UserProfile[] = [];

  snapshot.forEach((doc) => users.push(doc.data()));

  return users;
}

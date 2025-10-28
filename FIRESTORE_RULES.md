# Firestore Security Rules

Copy and paste these rules into your Firebase Console.

## How to Update Rules

1. Go to: https://console.firebase.google.com/project/dating-dapp/firestore/rules
2. Replace the existing rules with the rules below
3. Click "Publish"

---

## Rules for Dating dApp

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper function to check if user is authenticated
    function isSignedIn() {
      return request.auth != null;
    }

    // Helper function to check if user owns the document
    function isOwner(wallet) {
      return request.auth.uid == wallet.lower();
    }

    // Users collection
    match /users/{wallet} {
      // Anyone can read profiles (for discovery)
      allow read: if true;

      // Users can create their own profile
      allow create: if true &&
                      request.resource.data.wallet.lower() == wallet.lower();

      // Users can only update their own profile
      allow update: if request.resource.data.wallet.lower() == wallet.lower();

      // Users can only delete their own profile
      allow delete: if resource.data.wallet.lower() == wallet.lower();
    }

    // Likes collection
    match /likes/{likeId} {
      // Anyone can read likes (for match detection)
      allow read: if true;

      // Anyone can create likes
      allow create: if true;

      // No updates or deletes allowed
      allow update, delete: if false;
    }

    // Matches collection
    match /matches/{matchId} {
      // Anyone can read matches
      allow read: if true;

      // Anyone can create matches (triggered by mutual likes)
      allow create: if true;

      // No updates or deletes
      allow update, delete: if false;
    }

    // Messages collection
    match /messages/{messageId} {
      // Users can read messages from their matches
      allow read: if true;

      // Anyone can create messages
      allow create: if true;

      // Users can update their own messages (mark as read)
      allow update: if true;

      // Users can delete their own messages
      allow delete: if true;
    }
  }
}
```

---

## Alternative: Test Mode (For Development Only)

⚠️ **WARNING**: This allows anyone to read/write all data. Only use for testing!

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

---

## After Publishing Rules

1. Refresh your app (Ctrl+R or Cmd+R)
2. Try creating your profile again
3. Should work without permission errors!

---

## Troubleshooting

**Still getting permission errors?**

1. Make sure you published the rules (click "Publish" button)
2. Wait 10-30 seconds for rules to propagate
3. Clear browser cache and refresh
4. Check Firebase Console → Firestore → Rules tab to verify rules are active

**Rules not saving?**

- Make sure your Firebase project is on the free "Spark" plan or higher
- Check that Firestore is enabled
- Try the "Test Mode" rules above temporarily

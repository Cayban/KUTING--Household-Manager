# HomeSync

A shared chore board for three siblings — live-synced with Firestore, deployed free on Vercel.

Features: profiles, chore assignment, a two-stage complete → verify flow, task comments, a shared notes/bulletin board, recurring chores, daily/weekly/monthly views, filters & search, a points leaderboard, chore history, overdue detection, and optional proof photos.

## 1. Create your Firebase project (free)

1. Go to [console.firebase.google.com](https://console.firebase.google.com) and click **Add project**. Name it anything (e.g. `homesync`). You can skip Google Analytics.
2. In the left sidebar, click **Build > Firestore Database > Create database**. Choose **production mode** and pick a region close to you.
3. Click **Build > Storage > Get started**. Also production mode.
4. Click **Build > Authentication > Get started**. Under **Sign-in method**, enable **Email/Password**. (Each sibling picks their name in the app and sets their own password the first time — you don't need to manually create accounts in the console; the app does it via sign-up.)
5. Click the gear icon top-left > **Project settings**. Under **Your apps**, click the `</>` (web) icon, register an app (any nickname), and skip Firebase Hosting setup. Copy the `firebaseConfig` values shown — you'll need them in step 3.

## 2. Lock down the security rules

Still in the Firebase console:

1. **Firestore Database > Rules** — replace the contents with what's in [`firestore.rules`](./firestore.rules) in this repo, then click **Publish**.
2. **Storage > Rules** — replace the contents with what's in [`storage.rules`](./storage.rules) in this repo, then click **Publish**.

This restricts read/write to people who've opened the app (anonymous auth token required) — not the whole internet.

## 3. Run it locally (optional but recommended first)

```bash
npm install
cp .env.example .env
```

Open `.env` and paste in the values from step 1.5:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

Then:

```bash
npm run dev
```

Open the printed `localhost` URL. The first person to open the app becomes the household **admin**; the next two just add their name too.

## 4. Push to GitHub

```bash
git init
git add .
git commit -m "HomeSync"
gh repo create homesync --private --source=. --push
```

(No `gh` CLI? Create an empty repo on github.com, then `git remote add origin <your-repo-url>` and `git push -u origin main`.)

Your `.env` file is git-ignored on purpose — it never gets pushed.

## 5. Deploy to Vercel (free)

1. Go to [vercel.com](https://vercel.com), sign in with GitHub, click **Add New > Project**, and import your `homesync` repo. Vercel auto-detects Vite — no config changes needed.
2. Before deploying, open **Environment Variables** and add the same six `VITE_FIREBASE_*` keys from your `.env` file.
3. Click **Deploy**. You'll get a live `https://homesync-xxxx.vercel.app` URL — share that with your siblings.

Every future `git push` to `main` auto-redeploys.

## Notes

- **Auth model:** each sibling has their own real password (Firebase Auth email/password under the hood, with an invisible auto-generated address — nobody needs a real email). The first person to open the app sets up the household and becomes **admin**; everyone after that clicks "+ Add a sibling" to create their own login. Browsers will offer to remember the password like any other site. Sessions persist automatically, so nobody has to log in every visit — "Log out" in the top bar switches users.
- **Costs:** Firestore, Storage, Auth, and Vercel all have generous free tiers that comfortably cover a 3-person household app. You won't hit a paywall at this scale.
- **Chore rotation:** the data model supports a `rotationGroup` field per chore (see `src/lib/logic.js` → `rotationAssignee`) for auto-rotating hard chores week to week. The UI currently exposes recurrence (daily/weekly/monthly); wire up a rotation picker in `ChoreForm.jsx` if you want the auto-rotation active — happy to add that next.
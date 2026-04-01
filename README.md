# PingTask

**Chat. Mention. Get it done.**

A modern BBM-style messenger with built-in smart task management. Add contacts by PIN, chat in real-time with end-to-end encryption, and create tasks by @mentioning someone in a conversation.

Built with React Native + Expo + Firebase + TypeScript.

---

## Features

### Messaging
- Real-time 1-on-1 and group chat via Firestore
- Message bubbles with left/right alignment (sender/receiver)
- Delivery status indicators: Sending (clock) → Sent (check) → Delivered (double check) → Read (blue double check)
- Typing indicators with debounced writes
- Conversation list with last message preview, timestamps, unread count badges
- Search across chats and contacts

### End-to-End Encryption
- NaCl box encryption (Curve25519 key exchange + XSalsa20-Poly1305)
- Keypair auto-generated on account creation
- Public keys exchanged via Firestore, private keys stored locally
- Direct messages encrypted before leaving the device
- Auto-decryption on receive
- Green lock banner: "Messages are end-to-end encrypted"
- Server only sees ciphertext — cannot read messages

### BBM-Style Identity
- Unique 8-character alphanumeric PIN per user (e.g., `H77WA29D`)
- Real QR code generation (`pingtask://add/{PIN}` deep link)
- QR scan screen with manual PIN fallback
- Add contacts by PIN — no phone number sharing required
- PIN displayed prominently with copy-to-clipboard

### Task Management
- Type `@name task description` in any chat to auto-create a task
- Cloud Function extracts @mentions and creates task documents
- Task list with filter tabs: All / To Do / Active / Done
- Task detail: status badge, assignee info, dates, change status
- Tasks linked to source conversation and message

### Contacts
- Add by PIN or QR code scan
- A-Z grouped contact list with search
- Contact profile: avatar, status, email, online indicator
- "Send Message" from profile opens/creates direct conversation
- Two-way contact adding (both users see each other)
- Remove contact with confirmation

### Settings (10 screens)
| Section | Screens | Features |
|---------|---------|----------|
| **Account** | Edit Profile | Name, email, phone, avatar upload, status |
| | My PIN & QR | Large PIN display, real QR code, copy button |
| | Login & Security | Change password with re-auth, 2FA toggle, active sessions |
| | Data Management | Storage stats, export data, deactivate/delete account |
| **App** | Appearance | Light/dark theme cards with chat preview |
| | Notifications | Push, email, sound & vibration toggles |
| **Privacy** | Privacy | Visibility controls (last seen, photo, status), read receipts, blocked users |
| **Support** | Help & Support | Contact support, report bug, feature request, FAQ |
| | About | App version, legal links, credits, "Made in Dubai" |

### Media
- Avatar upload via expo-image-picker + Firebase Storage
- Image picker with square crop and compression
- Profile photo updates reflect across the app

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | React Native + Expo (managed workflow) |
| **Language** | TypeScript |
| **Backend** | Firebase (Firestore, Auth, Cloud Functions, Storage, FCM) |
| **State** | Zustand |
| **Navigation** | React Navigation v7 (native stack + bottom tabs) |
| **Encryption** | tweetnacl (NaCl box: Curve25519 + XSalsa20-Poly1305) |
| **UI Icons** | @expo/vector-icons (Ionicons) |
| **QR Codes** | react-native-qrcode-svg + react-native-svg |
| **Dev Environment** | GitHub Codespaces |
| **iOS Testing** | Expo Go (scan QR from Codespace tunnel) |
| **iOS/Android Builds** | EAS Build (cloud, no Mac required) |

---

## Project Structure

```
pingtask/
├── App.tsx                          # Root component
├── index.ts                         # Entry point
├── app.json                         # Expo config
├── eas.json                         # EAS Build config
├── firestore.rules                  # Security rules
├── firestore.indexes.json           # Composite indexes
├── .env.example                     # Environment variables template
├── .devcontainer/                   # GitHub Codespaces config
│
├── functions/                       # Firebase Cloud Functions
│   └── src/
│       ├── index.ts                 # Function exports
│       ├── auth/onUserCreate.ts     # PIN generation on signup
│       ├── messaging/onMessageCreate.ts  # Last message, push, task extraction
│       └── utils/pinGenerator.ts    # Collision-safe PIN generator
│
└── src/
    ├── config/firebase.ts           # Firebase initialization
    ├── constants/                   # Colors, typography, spacing, layout, config
    ├── types/                       # TypeScript interfaces (User, Chat, Task, Contact, Navigation)
    ├── utils/alert.ts               # Cross-platform alert (web + mobile)
    │
    ├── services/                    # Business logic layer
    │   ├── authService.ts           # Sign up/in/out, auth state, user docs
    │   ├── chatService.ts           # Conversations, messages, typing, E2EE send/decrypt
    │   ├── contactService.ts        # Add/remove/search contacts by PIN
    │   ├── taskService.ts           # Subscribe to tasks, update status
    │   ├── cryptoService.ts         # E2EE: keypair, encrypt, decrypt, key exchange
    │   └── mediaService.ts          # Image picker + Firebase Storage upload
    │
    ├── stores/                      # Zustand state management
    │   ├── authStore.ts             # User, auth state, needsProfile
    │   ├── chatStore.ts             # Conversations, messages, unread count
    │   ├── contactStore.ts          # Contact list, search, filtering
    │   ├── taskStore.ts             # Tasks, filters (all/todo/active/done)
    │   └── themeStore.ts            # Dark/light mode
    │
    ├── components/common/           # Reusable UI components
    │   ├── Avatar.tsx               # Image + initials fallback + online dot
    │   ├── Button.tsx               # Primary/outline/ghost variants + loading
    │   ├── Input.tsx                # Text input + label + error + password toggle
    │   ├── Header.tsx               # Navigation header with back/action buttons
    │   └── LoadingScreen.tsx        # Full-screen spinner with message
    │
    ├── navigation/                  # React Navigation stacks
    │   ├── RootNavigator.tsx        # Auth vs Main routing
    │   ├── AuthStack.tsx            # Welcome → SignUp → SignIn → SetProfile
    │   ├── MainTabs.tsx             # Bottom tabs (Chats, Contacts, Tasks, Settings)
    │   ├── ChatStack.tsx            # ChatList → ChatRoom → ChatInfo → NewChat → NewGroup
    │   ├── ContactStack.tsx         # ContactList → AddContact → ContactProfile → QRScan
    │   ├── TaskStack.tsx            # TaskList → TaskDetail
    │   └── SettingsStack.tsx        # Settings → 9 sub-screens
    │
    └── screens/                     # 22 screens total
        ├── auth/                    # Welcome, SignUp, SignIn, SetProfile
        ├── chat/                    # ChatList, ChatRoom, ChatInfo, NewChat, NewGroup
        ├── contacts/                # ContactList, AddContact, ContactProfile, QRScan
        ├── tasks/                   # TaskList, TaskDetail
        └── settings/                # Settings, EditProfile, MyPin, Security,
                                     # DataManagement, Appearance, Notifications,
                                     # Privacy, HelpSupport, About
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- GitHub account (for Codespaces)
- Firebase project
- Expo Go app on your phone (for mobile testing)

### 1. Clone & Open in Codespaces

```bash
# Fork/clone the repo
git clone https://github.com/Meejum/pingtask.git

# Open in GitHub Codespaces (recommended)
# Or locally:
cd pingtask
npm install
```

### 2. Firebase Setup

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Create a new project called "PingTask"
3. Enable **Authentication** > Sign-in method > **Email/Password**
4. Enable **Firestore Database** > Create database > **Test mode**
5. Enable **Storage** (for avatar uploads)
6. Add a **Web app** and copy the config

### 3. Environment Variables

Create a `.env` file in the project root:

```
EXPO_PUBLIC_FIREBASE_API_KEY=your-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
EXPO_PUBLIC_FIREBASE_APP_ID=your-app-id
```

### 4. Run the App

```bash
# Web (best for Codespaces)
npx expo start --web

# Mobile via tunnel (Codespaces → Expo Go on phone)
npx expo start --tunnel

# Local network (same Wi-Fi as phone)
npx expo start --lan
```

### 5. Deploy Cloud Functions (Optional)

```bash
cd functions
npm install
npx firebase login --no-localhost
npx firebase deploy --only functions --project your-project-id
cd ..
```

Without Cloud Functions, the app uses a client-side fallback for PIN generation.

---

## Firestore Schema

### `users/{uid}`
| Field | Type | Description |
|-------|------|-------------|
| `uid` | string | Firebase Auth UID |
| `pin` | string | Unique 8-char alphanumeric PIN |
| `displayName` | string | User's display name |
| `email` | string | Email address |
| `avatarUrl` | string | Firebase Storage URL |
| `status` | enum | `available` / `busy` / `away` / `offline` |
| `statusMessage` | string | Custom status text |
| `publicKey` | string | Base64-encoded Curve25519 public key (for E2EE) |
| `isOnline` | boolean | Online presence |

### `pins/{pin}` — PIN uniqueness enforcement
### `contacts/{uid}/list/{contactUid}` — cached contact info
### `conversations/{id}` — chat metadata, participants, last message, unread counts, typing
### `conversations/{id}/messages/{msgId}` — message content (encrypted), delivery status, mentions
### `tasks/{id}` — task from @mention, assignee, status, source message link

---

## E2EE Architecture

```
┌──────────────┐                          ┌──────────────┐
│   Alice       │                          │     Bob      │
│               │                          │              │
│ Generate      │    Public Key Exchange   │ Generate     │
│ KeyPair ──────┼──── via Firestore ───────┼── KeyPair    │
│               │    (only public keys)    │              │
│ Private Key   │                          │ Private Key  │
│ (local only)  │                          │ (local only) │
│               │                          │              │
│ Encrypt ──────┼──── Ciphertext ──────────┼── Decrypt    │
│ nacl.box(     │    (Firestore stores     │ nacl.box.    │
│  msg,         │     only ciphertext)     │  open(       │
│  nonce,       │                          │   cipher,    │
│  bobPub,      │                          │   nonce,     │
│  alicePriv)   │                          │   alicePub,  │
│               │                          │   bobPriv)   │
└──────────────┘                          └──────────────┘
```

- **Algorithm**: NaCl box = Curve25519 (key exchange) + XSalsa20-Poly1305 (authenticated encryption)
- **Key generation**: On account creation, via `tweetnacl.box.keyPair()`
- **What the server sees**: Base64-encoded `nonce + ciphertext` — no plaintext
- **What the server cannot do**: Read, modify, or forge messages

---

## Cloud Functions

| Function | Trigger | What it does |
|----------|---------|-------------|
| `onUserCreate` | Auth: user created | Generates unique PIN via Firestore transaction, creates user doc |
| `onMessageCreate` | Firestore: new message | Updates lastMessage, increments unread, sends push notification, extracts @mentions into tasks |
| `onMessageUpdate` | Firestore: message updated | Recalculates aggregate delivery status from individual read receipts |

---

## Roadmap

### Phase 2: BBM Features
- [ ] Voice notes (hold-to-record + waveform)
- [ ] Message actions (long-press: reply, copy, delete, forward)
- [ ] Disappearing messages (per-chat timer + TTL)
- [ ] Typing animation (bouncing dots)
- [ ] Online presence (Firestore onDisconnect)
- [ ] BBM "Ping!" urgent alert

### Phase 3: Security Hardening
- [ ] Biometric app lock (expo-local-authentication)
- [ ] Screenshot detection + notification
- [ ] Upgrade to Signal Protocol (double ratchet, forward secrecy)
- [ ] Tighten Firestore rules (auth + ownership checks)
- [ ] Message TTL (delete from server after delivery)

### Phase 4: Push Notifications
- [ ] expo-notifications + FCM high-priority
- [ ] Inline reply from notification
- [ ] Badge count management
- [ ] Custom "Ping!" notification sound

### Phase 5: App Store Launch
- [ ] Privacy Policy + Terms of Service
- [ ] EAS Build for iOS + Android
- [ ] App Store screenshots + metadata
- [ ] Deep linking (open chat from notification)
- [ ] Offline support (Firestore persistence)
- [ ] Error boundaries + crash reporting

---

## Development

### Codespaces (Recommended)

The `.devcontainer/devcontainer.json` is pre-configured with Node.js 20, Java 17, and the necessary VS Code extensions. Just open in Codespaces and run `npm install`.

### Testing on iPhone

1. Install **Expo Go** from the App Store
2. Run `npx expo start --tunnel` in the Codespace
3. Scan the QR code with your iPhone camera
4. The app opens in Expo Go

### Building for App Store

```bash
# Install EAS CLI
npm install -g eas-cli

# Build iOS (runs in Expo's cloud — no Mac needed)
eas build --platform ios

# Build Android
eas build --platform android
```

Requires an Apple Developer account ($99/year) for iOS.

---

## License

MIT

---

Built in Dubai, UAE.

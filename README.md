# � SendIt - Mobile Chat Experience

**SendIt** is a modern, mobile-first chat application designed for speed and simplicity. Built as a Progressive Web App (PWA), it offers a native-like experience on your smartphone directly through the browser.

## ✨ Features

- **Real-Time Communication**: Send and receive messages instantly.
- **Media Sharing**: Take photos directly with your camera or attach files to your messages.
- **Location Sharing**: Share your current location with one click.
- **Offline Support**: Queue messages while offline; they'll be sent automatically once you're back online.
- **PWA Ready**: Install it on your home screen for a full-screen, app-like experience.
- **Toast Notifications**: Instant visual feedback for actions like login errors or successful chat creation.

## 🚀 Getting Started for Users

### 1. Account Setup
- **Register**: Go to the landing page and click "Sign up". Enter your details and create a strong password.
- **Login**: Use your username and password to enter the app. If you enter the wrong credentials, a notification will let you know.

### 2. Start Chatting
- **Create a Chat**: Tap the "Create Chat" button on the home screen and give it a name.
- **Invite Friends**: Inside a chat, use the menu to "Invite Users". Search for your friends and send them an invite.
- **Accept Invites**: Any pending invitations will appear at the top of your home screen.

### 3. Mobile Installation (Recommended)
To get the best experience:
- **iOS (Safari)**: Tap the **Share** button → **"Add to Home Screen"**.
- **Android (Chrome)**: Tap the **Menu (⋮)** → **"Install app"** or **"Add to Home Screen"**.

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Data Fetching**: SWR & Axios
- **PWA**: Custom Service Workers for caching and offline capabilities.

## 💻 For Developers

### Installation

1. **Clone & Install**:
   ```bash
   git clone https://github.com/florinsirbu99as/ChatApp.git
   cd ChatApp
   npm install
   ```

2. **Environment Setup**:
   Ensure you have a `.env.local` file with:
   ```bash
   API_BASE_URL=https://www2.hs-esslingen.de/~melcher/map/chat/api/
   ```

3. **Run Development Mode**:
   ```bash
   npm run dev
   ```

### Scripts
- `npm run dev`: Starts the Next.js development server.
- `npm run build`: Creates a production-ready build.
- `npm run lint`: Checks for code quality issues.

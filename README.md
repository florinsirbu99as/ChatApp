# 📱 ChatApp - Mobile-First Chat Application

A modern, responsive chat application built with **Next.js 15**, **TypeScript**, and **Tailwind CSS**. Features real-time messaging through REST API calls and is optimized for mobile devices with **Progressive Web App (PWA)** capabilities.

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Data Fetching**: SWR + Axios
- **HTTP Client**: Axios
- **Mobile**: PWA (Progressive Web App)
- **Deployment**: Vercel-ready

## 📦 Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/florinsirbu99as/ChatApp.git
   cd ChatApp
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment (optional):**
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` with your API endpoints.

4. **Start development server:**
   ```bash
   npm run dev
   ```

5. **Open in browser:**
   ```
   http://localhost:3000
   ```

## 📱 Mobile Features

### PWA Installation

1. **iOS Safari:**
   - Open the app in Safari
   - Tap the Share button
   - Select "Add to Home Screen"

2. **Android Chrome:**
   - Open the app in Chrome
   - Tap the menu (three dots)
   - Select "Add to Home screen"

## 🏗️ Project Structure

```
ChatApp/
├── src/
│   └── app/
│       ├── layout.tsx      # Root layout with PWA config
│       ├── page.tsx        # Main chat interface
│       └── globals.css     # Global styles
├── public/
│   └── manifest.json       # PWA manifest
├── .env.example           # Environment template
├── package.json           # Dependencies
└── README.md             # Documentation
```

## 📊 Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production  
npm run start    # Start production server
npm run lint     # Run ESLint
```
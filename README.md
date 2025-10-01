# ChatApp - Mobile Chat Application

A real-time chat application optimized for mobile devices, built with Next.js, TypeScript, and Socket.io. Features PWA capabilities for iOS and Android installation.

## Features

- 📱 **Mobile-First Design**: Optimized for iOS and Android devices
- 🔄 **Real-time Messaging**: Instant messaging with Socket.io
- 📲 **PWA Support**: Install as native app on mobile devices
- 🎨 **Modern UI**: Beautiful interface with Tailwind CSS
- ⚡ **Fast Performance**: Built with Next.js 15 and Turbopack
- 🔒 **Type Safety**: Full TypeScript support

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Real-time**: Socket.io
- **PWA**: next-pwa
- **Development**: Turbopack, ESLint

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone and setup:**
   ```bash
   git clone <your-repo-url>
   cd ChatApp
   npm install
   ```

2. **Run development servers:**
   
   Terminal 1 - Next.js app:
   ```bash
   npm run dev
   ```
   
   Terminal 2 - Socket.io server:
   ```bash
   node server.js
   ```

3. **Open your browser:**
   - Navigate to `http://localhost:3000`
   - Enter your name and start chatting!

### Mobile Testing

1. **Find your local IP:**
   ```bash
   ipconfig getifaddr en0  # macOS
   ```

2. **Access from mobile:**
   - Open `http://YOUR_IP:3000` on your phone
   - Install as PWA for native app experience

## Development

### Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build production application
- `npm start` - Start production server
- `npm run lint` - Run ESLint

### Project Structure

```
src/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
public/
├── manifest.json
└── icons/
server.js
```

## Deployment

### Vercel (Recommended)

1. **Deploy frontend:**
   ```bash
   npm run build
   ```
   Deploy to Vercel

2. **Deploy Socket.io server:**
   - Use Railway, Heroku, or similar
   - Update `NEXT_PUBLIC_SOCKET_URL` environment variable

### Environment Variables

Create `.env.local`:
```
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

## Mobile Installation

### iOS Safari
1. Open the app in Safari
2. Tap the Share button
3. Select "Add to Home Screen"

### Android Chrome
1. Open the app in Chrome
2. Tap the menu (three dots)
3. Select "Add to Home screen"

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@chatapp.com or join our Slack channel.

---

**Happy Chatting! 💬**
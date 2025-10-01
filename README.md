# 📱 ChatApp - Mobile-First Chat Application

A modern, responsive chat application built with **Next.js 15**, **TypeScript**, and **Tailwind CSS**. Features real-time messaging through REST API calls and is optimized for mobile devices with **Progressive Web App (PWA)** capabilities.

## 🚀 Features

- **📱 Mobile-First Design** - Optimized for iOS and Android devices
- **⚡ Real-time Messaging** - HTTP polling for live message updates
- **🔄 PWA Support** - Install as native app on mobile devices
- **🎨 Modern UI** - Clean, responsive design with Tailwind CSS
- **📡 API-Driven** - No backend server needed, works with any REST API
- **⚛️ React 19** - Latest React features with Next.js 15
- **📊 SWR Data Fetching** - Optimized caching and revalidation

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

## 🔧 Configuration

### API Integration

The app is configured to work with any REST API. Currently uses JSONPlaceholder for demo purposes.

**Environment Variables:**
```env
# Your API base URL
NEXT_PUBLIC_API_URL=https://your-api-server.com/api

# Optional authentication
NEXT_PUBLIC_AUTH_API_KEY=your_api_key
```

### API Endpoints Expected

Replace the mock functions in `src/app/page.tsx` with your actual API calls:

```typescript
// Messages API
GET  /api/messages    # Fetch messages
POST /api/messages    # Send new message

// Users API  
GET  /api/users       # Fetch online users
POST /api/users       # Create/join user
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

### Mobile Optimizations

- **Touch-friendly interface** with large tap targets
- **Responsive design** for all screen sizes
- **Optimized scrolling** with momentum
- **Native app feel** when installed as PWA
- **Offline support** (coming soon)

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

## 🚀 Deployment

### Vercel (Recommended)

1. **Push to GitHub** (already done)
2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Deploy automatically

3. **Configure environment variables** in Vercel dashboard

### Other Platforms

- **Netlify**: Drag and drop `npm run build` output
- **Railway**: Connect GitHub repo
- **Heroku**: Use Node.js buildpack

## 🔄 Real-time Updates

The app uses **SWR** for data fetching with:
- **2-second polling** for messages
- **5-second polling** for user status
- **Optimistic updates** for sent messages
- **Automatic retry** on network errors
- **Cache invalidation** on focus

## 🎨 Customization

### Styling
Edit `tailwind.config.js` for custom themes:
```javascript
theme: {
  extend: {
    colors: {
      primary: {
        500: '#your-color',
      }
    }
  }
}
```

### API Integration
Replace mock functions in `src/app/page.tsx`:
```typescript
const fetchMessages = async (): Promise<Message[]> => {
  const response = await axios.get('/your-api/messages')
  return response.data
}
```

## 📊 Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production  
npm run start    # Start production server
npm run lint     # Run ESLint
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/florinsirbu99as/ChatApp/issues)
- **Discussions**: [GitHub Discussions](https://github.com/florinsirbu99as/ChatApp/discussions)

---

**🎉 Happy chatting!** Built with ❤️ for mobile-first experiences.
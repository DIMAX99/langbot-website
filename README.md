# 🌍 LangBot - AI Language Tutor

[![Next.js](https://img.shields.io/badge/Next.js-15.5.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Three.js](https://img.shields.io/badge/Three.js-Enabled-green?style=for-the-badge&logo=three.js)](https://threejs.org/)

> **Master any language with AI-powered personalized tutoring. Interactive lessons, real-time feedback, and adaptive learning.**

## ✨ Features

### 🎯 **Core Learning Features**
- **🤖 AI-Powered Conversations**: Natural conversations with multiple AI providers (Gemini, OpenAI, Claude)
- **🗣️ Voice Interaction**: Speech recognition and text-to-speech with adjustable speed controls
- **📚 Multi-Language Support**: Practice English, Spanish, French, German, Japanese, Italian, and more
- **💬 Real-Time Feedback**: Instant grammar corrections and pronunciation guidance
- **🎨 3D Avatar Companion**: Interactive 3D character that follows your cursor

### 🔧 **Technical Features**
- **⚡ Modern Stack**: Next.js 15, React 18, TypeScript, Three.js
- **🔐 Secure Authentication**: JWT-based user authentication with bcrypt password hashing
- **💾 Conversation History**: SQLite database for persistent chat storage
- **📱 Responsive Design**: Works seamlessly on desktop and mobile devices
- **🎛️ Speed Controls**: Adjustable AI voice speed (0.5x to 2.0x)
- **🔄 AI Provider Fallback**: Automatic switching between AI providers for maximum uptime

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ and npm/yarn/pnpm
- **AI API Key** (Gemini recommended for free tier)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd langbot-website
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```

4. **Configure your AI provider**
   
   **Option A: Gemini (Free & Recommended)**
   ```env
   AI_PROVIDER=gemini
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
   
   **Option B: OpenAI (Best Quality)**
   ```env
   AI_PROVIDER=openai
   OPENAI_API_KEY=your_openai_api_key_here
   ```
   
   **Option C: Claude (Great Conversations)**
   ```env
   AI_PROVIDER=anthropic
   ANTHROPIC_API_KEY=your_anthropic_api_key_here
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   ```
   http://localhost:3000
   ```

## 🗝️ API Keys Setup

### 🆓 Google Gemini (Recommended for Beginners)
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add to `.env.local`: `GEMINI_API_KEY=your_key_here`
4. **Free tier**: 15 requests per minute, 1,500 requests per day

### 💰 OpenAI (Best Quality)
1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create a new secret key
3. Add to `.env.local`: `OPENAI_API_KEY=your_key_here`
4. **Pricing**: ~$0.002 per conversation (very affordable)

### 🔧 Anthropic Claude
1. Visit [Anthropic Console](https://console.anthropic.com/)
2. Create a new API key
3. Add to `.env.local`: `ANTHROPIC_API_KEY=your_key_here`

## 🏗️ Project Structure

```
langbot-website/
├── 📁 components/           # Reusable React components
│   ├── Layout.tsx          # App layout wrapper
│   ├── Person3D.tsx        # 3D avatar component
│   └── ...
├── 📁 pages/               # Next.js pages
│   ├── index.tsx           # Landing page with language selection
│   ├── chat.tsx            # Main chat interface
│   ├── login.tsx           # User authentication
│   ├── signup.tsx          # User registration
│   └── api/                # API routes
│       ├── auth/           # Authentication endpoints
│       ├── chat.ts         # AI chat processing
│       └── conversations/  # Conversation management
├── 📁 public/              # Static assets
│   ├── person.glb          # 3D avatar model
│   └── images/             # UI images
├── 📁 styles/              # CSS modules
├── 📁 utils/               # Utility functions
├── 📁 lib/                 # Database and AI configurations
└── 📄 .env.example         # Environment variables template
```

## 🎮 Usage Guide

### 1. **Choose Your Language**
   - Visit the homepage
   - Select from 6 supported languages
   - Each language has tailored conversation prompts

### 2. **Start Conversing**
   - Type messages or use voice input (click 🎤)
   - AI provides natural responses with corrections
   - Voice output with speed controls (+ / - buttons)

### 3. **Track Progress**
   - All conversations are saved automatically
   - Review previous sessions in conversation history
   - AI adapts to your learning level over time

### 4. **Interactive Features**
   - 3D avatar follows your mouse cursor
   - Responsive design works on all devices
   - Real-time typing indicators and smooth animations

## 🔧 Development

### Available Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Type checking
npm run type-check

# Linting
npm run lint
```

### Key Technologies

- **🎯 Frontend**: Next.js 15, React 18, TypeScript
- **🎨 Styling**: CSS Modules, responsive design
- **🗣️ Voice**: Web Speech API (recognition & synthesis)
- **🤖 AI**: Google Gemini, OpenAI GPT, Anthropic Claude
- **💾 Database**: SQLite with better-sqlite3
- **🔐 Auth**: JWT tokens, bcrypt hashing
- **🎮 3D**: Three.js, React Three Fiber, React Three Drei

## 🌟 AI Provider Comparison

| Provider | Cost | Quality | Speed | Best For |
|----------|------|---------|-------|----------|
| **Gemini** | 🆓 Free | ⭐⭐⭐ | ⚡⚡⚡ | Testing, Development |
| **OpenAI** | 💰 ~$0.002/chat | ⭐⭐⭐⭐⭐ | ⚡⚡ | Production, Best Quality |
| **Claude** | 💰 Paid | ⭐⭐⭐⭐ | ⚡⚡ | Conversational Practice |

## 🔒 Security Features

- **🔐 Password Hashing**: bcrypt with salt rounds
- **🎫 JWT Authentication**: Secure token-based auth
- **🛡️ Input Validation**: Sanitized user inputs
- **🔒 Environment Variables**: Secure API key storage
- **🚫 SQL Injection Protection**: Parameterized queries

## 📱 Browser Compatibility

- ✅ **Chrome** 90+ (Recommended)
- ✅ **Firefox** 88+
- ✅ **Safari** 14+
- ✅ **Edge** 90+
- ⚠️ **Mobile**: Voice features may vary by device

## 🐛 Troubleshooting

### Common Issues

**Q: Voice recognition not working?**
- Ensure microphone permissions are granted
- Use Chrome/Edge for best compatibility
- Check if running on HTTPS (required for voice features)

**Q: 3D avatar not loading?**
- Check browser WebGL support
- Ensure `person.glb` file exists in `/public/`
- Falls back to simple avatar automatically

**Q: AI responses are slow?**
- Check your internet connection
- Verify API key is valid and has quota
- Try switching AI provider in `.env.local`

**Q: Database errors?**
- Ensure SQLite file permissions are correct
- Check if `conversations.db` exists and is writable

## 🤝 Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Gemini** for providing free AI access
- **Vercel** for seamless deployment platform
- **Three.js** community for 3D graphics support
- **Next.js** team for the amazing React framework

---
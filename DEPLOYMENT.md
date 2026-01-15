# 🚀 Kurdistan AI Web Application - Deployment Guide

This guide covers how to deploy and run the Kurdistan AI web application.

## 📋 Prerequisites

- **Node.js**: Version 20 or higher (required for native DOMException support)
- **Package Manager**: npm, pnpm, or yarn
- **API Key**: Google Gemini API key for AI functionality

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/hedihashm58-web/Kurdistan-AI.git
cd Kurdistan-AI
```

### 2. Install Dependencies

Choose your preferred package manager:

```bash
# Using npm (recommended)
npm install

# Using pnpm (fastest)
pnpm install

# Using yarn
yarn install
```

## 🔑 Environment Setup

Create a `.env` file in the root directory:

```env
API_KEY=your_google_gemini_api_key_here
NODE_ENV=production
```

**Important**: Never commit your `.env` file to version control. It's already in `.gitignore`.

## 💻 Development

### Run Development Server

```bash
npm run dev
```

The application will start at `http://localhost:3000`

### Development Features
- Hot Module Replacement (HMR)
- Fast Refresh with React 19
- TypeScript type checking
- Tailwind CSS with JIT compilation

## 🏗️ Production Build

### Build the Application

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory with:
- Minified JavaScript (~576KB total)
- Optimized CSS (~45KB)
- Code splitting for better performance
- Tree-shaking for smaller bundle size

### Preview Production Build

```bash
npm run preview
```

## 🌐 Deployment Options

### Vercel (Recommended)

The project includes `vercel.json` configuration:

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. Add environment variable in Vercel dashboard:
   - `API_KEY`: Your Google Gemini API key

### Other Platforms

#### Netlify
1. Build command: `npm run build`
2. Publish directory: `dist`
3. Add environment variable: `API_KEY`

#### GitHub Pages
1. Build the project: `npm run build`
2. Deploy the `dist/` folder to GitHub Pages

#### Docker
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

## 📁 Project Structure

```
Kurdistan-AI/
├── components/          # React components (13 components)
│   ├── Layout.tsx      # Main layout with navigation
│   ├── ChatInterface.tsx
│   ├── ArtStudio.tsx
│   ├── VideoStudio.tsx
│   └── ...
├── services/           # API services
│   └── geminiService.ts
├── app.css            # Global styles with Tailwind
├── index.tsx          # Application entry point
├── App.tsx            # Root component
├── types.ts           # TypeScript types
├── constants.tsx      # App constants
├── vite.config.ts     # Vite configuration
├── tailwind.config.js # Tailwind CSS configuration
└── postcss.config.js  # PostCSS configuration
```

## 🎨 Features

The web application includes:

1. **Chat Interface** - AI-powered chat with Kurdish cultural context
2. **History Section** - Kurdish history and notable figures
3. **Landmark Explorer** - Interactive map of Kurdistan landmarks
4. **Math Analyzer** - Scientific analysis and data visualization
5. **Translator** - Multi-dialect Kurdish translation
6. **Health Assistant** - Medical advice and analysis
7. **Art Studio** - AI-generated Kurdish-themed artwork
8. **Video Studio** - Cinematic video generation
9. **Voice Assistant** - Real-time voice interaction

## 🔧 Configuration

### Tailwind CSS

Custom theme in `tailwind.config.js`:
- Royal Gold colors (#FFD700, #B8860B, #FFEC8B)
- RTL support
- Custom fonts (Outfit, Noto Sans Arabic)

### Vite

Build optimizations in `vite.config.ts`:
- Code splitting by vendor
- Terser minification
- Console removal in production
- Fast refresh for React 19

## 🐛 Troubleshooting

### Build Errors

If you encounter build errors:

1. Clear cache and reinstall:
   ```bash
   npm run clean
   npm install
   ```

2. Check Node.js version:
   ```bash
   node --version  # Should be v20 or higher
   ```

### Runtime Errors

If the app fails to load:

1. Check API_KEY is set correctly
2. Check browser console for errors
3. Ensure you're using a modern browser (Chrome, Firefox, Safari, Edge)

### Performance Issues

1. Enable production build optimizations
2. Use CDN for static assets
3. Enable gzip/brotli compression on your server

## 📊 Bundle Analysis

Current production build sizes:
- **vendor-ai**: 248KB (Google Gemini SDK)
- **vendor-react**: 187KB (React 19)
- **app code**: 92KB (Application code)
- **styles**: 45KB (Tailwind CSS)
- **other**: 3.5KB (Utilities)

Total: ~576KB (gzipped: ~138KB)

## 🔒 Security

- API keys are never exposed to client (handled via env variables)
- All user inputs are sanitized
- CSP headers recommended in production
- HTTPS required for production deployment

## 📝 License

See repository for license information.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📧 Support

For issues or questions:
- Create an issue on GitHub
- Contact: Hedi Hashim Fattah - Kurdistan AI Research Lab

---

**Built with ❤️ for Kurdistan**

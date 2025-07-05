# CaptionChain - AI Video Generation Platform

A modern, AI-powered video generation and captioning platform built with Next.js, featuring automatic transcription, caption generation, and video editing capabilities.

## 🚀 Features

- **AI-Powered Captioning**: Automatic speech-to-text using Whisper API
- **Video Processing**: Upload, trim, and overlay captions on videos
- **Project Management**: Organize videos into projects with easy collaboration
- **Modern UI**: Beautiful interface built with ShadCN UI and Tailwind CSS
- **Authentication**: Secure login with Google OAuth and email/password
- **Real-time Processing**: Background job processing with Redis
- **Cloud Storage**: Scalable video storage with AWS S3/Cloudflare R2

## 🛠 Tech Stack

### Frontend
- **React 18** with **Next.js 14** (App Router)
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **ShadCN UI** for component library
- **Zustand** for state management
- **FFmpeg.wasm** for client-side video processing

### Backend
- **Node.js** with **Express** or **FastAPI** (Python)
- **PostgreSQL** for main database
- **Redis** for job queues and caching
- **AWS S3/Cloudflare R2** for video storage

### AI & Processing
- **OpenAI Whisper API** for speech-to-text
- **GPT (OpenAI/Claude)** for video titles and scripts
- **Remotion/FFmpeg** for server-side video rendering
- **LangChain** for advanced prompt engineering

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Redis server
- AWS S3 or Cloudflare R2 account
- OpenAI API key

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone <repository-url>
cd CaptionChain
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/captionchain"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# OpenAI
OPENAI_API_KEY="your-openai-api-key"

# AWS S3
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="your-s3-bucket-name"

# Redis
REDIS_URL="redis://localhost:6379"
```

### 4. Set up the database
```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# (Optional) Seed the database
npx prisma db seed
```

### 5. Start the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   └── auth/          # Authentication endpoints
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # ShadCN UI components
│   ├── auth-page.tsx     # Authentication page
│   ├── dashboard.tsx     # Main dashboard
│   └── providers/        # Context providers
├── lib/                  # Utility libraries
│   ├── auth.ts           # NextAuth configuration
│   ├── prisma.ts         # Prisma client
│   ├── store.ts          # Zustand store
│   └── utils.ts          # Utility functions
└── types/                # TypeScript type definitions
```

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

### Database Management

- `npx prisma studio` - Open Prisma Studio for database management
- `npx prisma migrate dev` - Create and apply new migrations
- `npx prisma generate` - Generate Prisma client

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Docker

```bash
# Build the Docker image
docker build -t captionchain .

# Run the container
docker run -p 3000:3000 captionchain
```

## 📝 API Documentation

### Authentication Endpoints

- `POST /api/auth/signin` - Sign in with credentials
- `GET /api/auth/session` - Get current session
- `POST /api/auth/signout` - Sign out

### Video Endpoints

- `POST /api/videos/upload` - Upload a new video
- `GET /api/videos` - Get user's videos
- `GET /api/videos/[id]` - Get specific video
- `PUT /api/videos/[id]` - Update video
- `DELETE /api/videos/[id]` - Delete video

### Project Endpoints

- `POST /api/projects` - Create new project
- `GET /api/projects` - Get user's projects
- `GET /api/projects/[id]` - Get specific project
- `PUT /api/projects/[id]` - Update project
- `DELETE /api/projects/[id]` - Delete project

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed information
3. Join our [Discord](https://discord.gg/captionchain) community

## 🗺 Roadmap

### Phase 1-2: Setup & Auth ✅
- [x] Project setup with Next.js
- [x] User authentication (Google OAuth + Email)
- [x] Dashboard UI

### Phase 3: Video Upload & Project Dashboard
- [ ] Upload to cloud storage
- [ ] Project creation and management
- [ ] File handling and validation

### Phase 4-5: Auto Captioning (Whisper API)
- [ ] Transcribe uploaded videos
- [ ] Store captions in database
- [ ] Multi-language support

### Phase 5-6: Video Editor
- [ ] Simple timeline UI
- [ ] Caption styling and positioning
- [ ] Video preview functionality

### Phase 6-7: Export Video
- [ ] FFmpeg/Remotion integration
- [ ] Burned-in captions
- [ ] Multiple export formats

### Phase 7-8: Polish & Launch
- [ ] UX improvements
- [ ] Performance optimization
- [ ] Production deployment

---

Built with ❤️ by the CaptionChain team

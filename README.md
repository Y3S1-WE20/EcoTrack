# EcoTrack

A React Native mobile app with Express.js backend featuring Clerk authentication.

## Features

- 🔐 **Clerk Authentication** - Secure user registration and login
- 📱 **React Native Frontend** - Cross-platform mobile app built with Expo
- 🚀 **Express.js Backend** - RESTful API with JWT authentication
- 🛡️ **Protected Routes** - Backend endpoints secured with Clerk middleware
- 🔄 **Real-time Data** - User-specific data management

## Project Structure

```
EcoTrack/
├── backend/                 # Express.js API server
│   ├── index.js            # Main server file with Clerk middleware
│   ├── package.json        # Backend dependencies
│   ├── .env.example        # Environment variables template
│   └── .gitignore          # Backend-specific ignores
├── frontend/               # React Native Expo app
│   ├── app/                # Expo Router file-based routing
│   │   ├── _layout.tsx     # Root layout with Clerk provider
│   │   ├── sign-in.tsx     # Sign in screen
│   │   ├── sign-up.tsx     # Sign up screen
│   │   └── (tabs)/         # Tab navigation
│   │       ├── index.tsx   # Home screen with auth state
│   │       └── profile.tsx # User profile and settings
│   ├── package.json        # Frontend dependencies
│   ├── .env.example        # Environment variables template
│   └── app.json            # Expo configuration
└── README.md               # This file
```

## Quick Start

### Prerequisites

- Node.js 16+ and npm
- Expo CLI: `npm install -g expo-cli`
- [Clerk account](https://clerk.com) for authentication setup

### 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd EcoTrack

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Environment Setup

#### Backend Setup
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
PORT=4000
CLERK_PUBLISHABLE_KEY=pk_test_your-publishable-key-here
CLERK_SECRET_KEY=sk_test_your-secret-key-here
```

#### Frontend Setup
```bash
cd frontend
cp .env.example .env
```

Edit `frontend/.env`:
```env
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your-publishable-key-here
```

### 3. Get Clerk Keys

1. Sign up at [Clerk.com](https://clerk.com)
2. Create a new application
3. Copy the **Publishable Key** and **Secret Key** from the API Keys section
4. Add them to your `.env` files as shown above

### 4. Run the Applications

#### Start Backend (Terminal 1)
```bash
cd backend
npm run dev
```
Server runs at `http://localhost:4000`

#### Start Frontend (Terminal 2)
```bash
cd frontend
npm start
```

Scan the QR code with Expo Go app or press `i`/`a` for iOS/Android simulator.

## API Endpoints

### Public Routes
- `GET /` - Health check
- `GET /api/ping` - API status check
- `POST /api/echo` - Echo request body

### Protected Routes (require authentication)
- `GET /api/protected/profile` - Get user profile
- `GET /api/protected/user-items` - Get user's items
- `POST /api/protected/user-items` - Create new item for user

## Development

### Backend Development
```bash
cd backend
npm run dev          # Start with nodemon (auto-restart)
npm start           # Start production mode
```

### Frontend Development
```bash
cd frontend
npm start           # Start Expo dev server
npm run android     # Run on Android
npm run ios         # Run on iOS
npm run web         # Run on web
```

### Testing API
```powershell
# Test public endpoint
Invoke-RestMethod http://localhost:4000/api/ping

# Test with authentication (get token from app)
$headers = @{ "Authorization" = "Bearer YOUR_JWT_TOKEN" }
Invoke-RestMethod -Uri "http://localhost:4000/api/protected/profile" -Headers $headers
```

## Troubleshooting

### Common Issues

1. **"Cannot connect to backend"**
   - Ensure backend is running on `http://localhost:4000`
   - For physical device: use your machine's IP address
   - For Android emulator: use `http://10.0.2.2:4000`

2. **"Clerk authentication not working"**
   - Verify environment variables are set correctly
   - Check that Clerk keys match between frontend and backend
   - Restart Expo dev server after changing `.env`

3. **"Module '@clerk/clerk-expo' not found"**
   - Run `npm install` in the frontend directory
   - Clear Expo cache: `expo start -c`

## Tech Stack

- **Frontend**: React Native, Expo, TypeScript, Expo Router
- **Backend**: Node.js, Express.js, CORS, Morgan (logging)
- **Authentication**: Clerk (JWT-based)
- **Development**: Nodemon, ESLint, TypeScript

## Next Steps

- [ ] Add database integration (PostgreSQL, MongoDB)
- [ ] Implement CRUD operations for EcoTrack items
- [ ] Add image upload functionality
- [ ] Create user onboarding flow
- [ ] Add push notifications
- [ ] Implement offline support
- [ ] Add unit and integration tests
- [ ] Set up CI/CD pipeline
- [ ] Deploy to production

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes and test thoroughly
4. Submit a pull request

## License

This project is licensed under the MIT License.
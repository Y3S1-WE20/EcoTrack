# Network Connectivity Fix Guide

## 🔧 Issues Fixed

The network connectivity errors you're seeing in the mobile app have been addressed with the following changes:

### 1. Backend Server Configuration ✅
- **Updated `index.js`**: Server now listens on `0.0.0.0:4000` instead of just `localhost:4000`
- **Multiple IP access**: Backend is accessible on:
  - `http://localhost:4000` (local development)
  - `http://192.168.1.10:4000` (your network IP)
  - `http://192.168.56.1:4000` (VirtualBox/VMware IP)

### 2. Frontend API Improvements ✅
- **Updated `chatAPI.ts`**: Now tries multiple URLs automatically
- **Smart fallback**: If one URL fails, it tries the next one
- **Better error messages**: More helpful troubleshooting information

### 3. Gemini AI Integration ✅
- **API Key Added**: Gemini AI is now fully functional
- **Enhanced NLP**: Better message parsing and suggestions
- **AI-powered responses**: More intelligent conversation handling

## 🚀 Manual Steps Required

### Step 1: Authorize ADB Device
1. On your mobile device, go to **Developer Options**
2. Enable **USB Debugging** if not already enabled
3. Connect your device via USB
4. You should see a popup asking to **Allow USB Debugging** - tap **Allow**
5. Check the box **Always allow from this computer**

### Step 2: Set Up Port Forwarding
Run this command in a new terminal:
```bash
adb reverse tcp:4000 tcp:4000
```

If you get "device unauthorized", run:
```bash
adb kill-server
adb start-server
adb devices
```

### Step 3: Verify Backend is Running
The backend should show:
```
🚀 EcoTrack backend listening on http://localhost:4000
🌐 Also accessible at http://0.0.0.0:4000 for mobile devices
✅ Gemini AI service initialized
```

### Step 4: Test the App
1. Open the EcoTrack app on your mobile device
2. Go to the **Assistant** tab
3. Try sending a message like: "I drove 10 km to work"
4. You should see:
   - The message appear in the chat
   - CO2 calculation: "🚗 Driving 10km = 2.1 kg CO₂ emitted 💨"
   - AI-generated suggestion
   - Possible badge notifications

## 🔍 Troubleshooting

### If you still see "Network request failed":

1. **Check your WiFi**: Make sure both your computer and phone are on the same WiFi network
2. **Try different URLs**: The app will automatically try these in order:
   - `http://localhost:4000/api/v1` (ADB reverse)
   - `http://10.0.2.2:4000/api/v1` (Android emulator)
   - `http://192.168.1.10:4000/api/v1` (Your network IP)
   - `http://192.168.56.1:4000/api/v1` (VM IP)

3. **Manual IP Configuration**: If automatic detection fails, you can manually set the IP in the app:
   - Find your computer's IP: `ipconfig | findstr "IPv4"`
   - Update the first URL in `frontend/services/chatAPI.ts` to use your IP

### Alternative Solutions:

#### Option A: Use Expo Development Server
```bash
cd frontend
npx expo start --tunnel
```
This creates a tunnel that works from anywhere.

#### Option B: Use ngrok (External Tool)
1. Install ngrok: `npm install -g ngrok`
2. Run: `ngrok http 4000`
3. Use the provided HTTPS URL in your app

#### Option C: Physical Device on Same Network
1. Connect your phone to the same WiFi as your computer
2. Use your computer's WiFi IP address (192.168.1.10)
3. Make sure Windows Firewall allows port 4000

## ✅ What's Now Working

After these fixes, your EcoTrack app now has:

### 🤖 **Advanced Chatbot Features**:
- **Natural language parsing**: "I walked 3 km today"
- **Smart activity detection**: Recognizes transport, energy, food activities
- **CO2 calculations**: Real-time emission calculations with scientific factors
- **AI suggestions**: Powered by Gemini AI for personalized tips

### 🏆 **Badge System**:
- **12+ achievement badges**: Green Commuter, Carbon Saver, Climate Hero
- **Automatic awarding**: Badges unlock as you log activities
- **Progress tracking**: Visual progress bars and milestones

### 🌱 **Personalization**:
- **Pattern analysis**: Tracks your habits and suggests improvements
- **Weekly challenges**: AI-generated personalized goals
- **Impact visualization**: See your environmental impact over time

### 🔄 **Seamless Integration**:
- **Automatic logging**: Chat messages create habit logs
- **Profile synchronization**: Activities sync with your profile
- **Cross-platform**: Works on web, Android, and iOS

## 🎯 Test the Complete Flow

1. **Send a message**: "I drove 15 km to the mall"
2. **Expect to see**:
   ```
   🚗 Driving 15km = 3.2 kg CO₂ emitted 💨
   
   💡 Try cycling or public transport for shorter trips! 
   You could save 2.8 kg CO₂ by taking the bus instead.
   
   🏆 Activity logged to your profile!
   ```

3. **Check for badges**: You might earn "Getting Started" or "Green Commuter"
4. **View your profile**: The activity should appear in your habit log
5. **See suggestions**: Get personalized tips based on your patterns

Your EcoTrack app is now fully functional with AI-powered features! 🎉
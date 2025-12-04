# GigGuard Frontend - Complete Overview

## 🎯 Project Summary
**GigGuard** is an AI-powered algorithmic auditor for gig workers that detects shadow bans, wage theft, and unfair penalties on platforms like Uber, Swiggy, and Zomato.

---

## 📁 Project Structure

```
d:\gig_wokers/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Main application (697 lines)
│   ├── layout.tsx                # Root layout with hydration fix
│   └── globals.css               # Global styles + animations
├── components/
│   └── VoiceRecorder.tsx         # Audio recording component
├── .vscode/
│   └── settings.json             # IDE config (suppresses Tailwind warnings)
├── node_modules/                 # Dependencies (400 packages)
├── public/                       # Static assets
├── .gitignore                    # Git ignore rules
├── package.json                  # Dependencies & scripts
├── next.config.js               # Next.js configuration
├── tsconfig.json                # TypeScript configuration
├── tailwind.config.ts           # Tailwind CSS configuration
├── postcss.config.js            # PostCSS configuration
├── DEPLOYMENT.md                # Deployment guide
└── README.md                    # Project documentation
```

---

## ✨ Implemented Features

### 1. **Core Application (`app/page.tsx`)**

#### 🌍 Multi-Language Support
- **Languages**: English, Hindi (हिंदी), Kannada (ಕನ್ನಡ)
- **Implementation**: Translation object with complete UI text
- **Components Translated**:
  - Navigation menu
  - Hero section
  - Scanner instructions
  - Dashboard alerts & labels
  - Activity ticker messages
  - Violation flags

#### 🎨 UI Components

**a) Navbar**
- Logo with gradient
- Language switcher dropdown
- Responsive mobile menu
- Fixed position with blur backdrop

**b) Hero Section**
- Animated gradient title
- Call-to-action button
- Badge with AI-powered label
- Background grid with glowing orbs

**c) Live Ticker**
- Infinite scrolling animation
- Real-time activity feed (mock data)
- Shows recent detections from other users

**d) Scanner Component**
- **Image Upload**: Drag-and-drop or click to upload screenshots
- **Voice Recorder Integration**: Live recording or file upload
- **File Management**: Remove uploaded files
- **Progress States**: Idle → Scanning → Analyzing → Complete
- **Privacy Notice**: On-device analysis badge

**e) Dashboard**
- **Alert Banner**: Critical anomaly detection
- **3D Holographic Card**: 
  - Mouse-tracking 3D rotation
  - Rights score display (0-100)
  - Shimmer effect on hover
  - Hash and verification status
- **Earnings Chart**: Bar chart comparing user vs peer earnings
- **Violation Flags**: List of detected issues
- **Action Card**: Claim Rights / Mint Evidence NFT

#### 🎤 Audio Evidence System (`components/VoiceRecorder.tsx`)
- **Live Recording**: Browser MediaRecorder API
- **File Upload**: Support for pre-recorded audio
- **States**: Ready → Recording → Saved
- **UI**: Pulsing recording indicator
- **Permissions**: Automatic microphone permission handling

#### 🔧 Functionality

**Form Submission (`handleGenerateReport`)**
```tsx
- Validates screenshot upload
- Packages screenshot + optional audio into FormData
- Sends POST to backend API
- Downloads generated PDF report
- Error handling with alerts
```

**File Management**
- Remove uploaded images
- Remove recorded/uploaded audio
- Clear form and reset states

---

## 📊 Static Data & Mock Content

### Current Mock Datasets:

#### 1. **MOCK_DATA** (Audit Results)
```tsx
{
  rightsScore: 42,          // Out of 100
  banStatus: "danger",      // safe | warning | danger
  userEarnings: 620,        // INR
  peerAverage: 940,         // INR
  discrepancy: 34,          // Percentage
  flags: []                 // Violations array
}
```

#### 2. **CHART_DATA** (Weekly Earnings)
```tsx
[
  { name: "Mon", user: 400, peer: 450 },
  { name: "Tue", user: 300, peer: 480 },
  { name: "Wed", user: 200, peer: 500 },  // Drop day
  { name: "Thu", user: 620, peer: 940 },  // Current
  { name: "Fri", user: 0, peer: 0 }
]
```

#### 3. **Activity Ticker** (Per Language)
```tsx
English:
- "Rohan (Bangalore) detected ₹120 underpayment"
- "Sarah (Mumbai) generated Dispute Pack #8821"
- "Shadow Ban Algorithm detected in Indiranagar Zone"
- etc.
```

#### 4. **Violation Flags** (Per Language)
```tsx
- "Unexplained Penalty (-₹70)"
- "Shadow Ban Detected (Low Assignment Rate)"
- "Missing Surge Bonus"
```

---

## 🎬 Animations & Visual Effects

### CSS Animations (`globals.css`)
```css
1. animate-gradient     → Moving gradient (6s loop)
2. animate-shimmer      → Holographic shimmer effect
3. animate-pulse        → Recording indicator
4. animate-spin         → Loading spinner
```

### Framer Motion Animations
- Page transitions (fade in/out)
- 3D card rotation (mouse tracking)
- Ticker scroll (infinite loop)
- Button hover effects
- Modal animations

---

## 🔌 API Integration Points

### Ready for Backend Connection:

**Endpoint**: `handleGenerateReport` function
```tsx
POST https://YOUR-NGROK-URL.ngrok-free.app/generate-report
```

**Request Format**: `multipart/form-data`
```
FormData:
  - file: [screenshot image]
  - audio: [voice recording] (optional)
```

**Response Expected**: PDF blob
```tsx
Content-Type: application/pdf
→ Auto-downloads as: Evidence_Pack_[timestamp].pdf
```

---

## 📦 Dependencies

### Production:
- `next` (15.x) - React framework
- `react` & `react-dom` (18.x)
- `framer-motion` (11.x) - Animations
- `lucide-react` (0.446) - Icon library
- `recharts` (2.12) - Charts
- `tailwindcss` (3.4) - CSS framework
- `autoprefixer` (10.4) - CSS processing

### Development:
- `typescript` (5.x)
- `eslint` & `eslint-config-next`
- `@types/*` (TypeScript definitions)

---

## ❌ What's NOT Implemented (Backend Needed)

1. **Real Analysis**: Currently shows mock data
2. **OCR Processing**: Screenshot text extraction
3. **AI Detection**: Shadow ban & wage theft detection
4. **PDF Generation**: Evidence report creation
5. **Database**: User data persistence
6. **Authentication**: User accounts
7. **Real-time Stats**: Live peer comparison data

---

## 🚀 Deployment Status

- ✅ **Production Build**: Successful (255 kB)
- ✅ **Development Server**: Running on http://localhost:3001
- 🔄 **Live Deployment**: Ready for Vercel (see DEPLOYMENT.md)

---

## 🎯 Next Steps

### To Make Functional:
1. **Update API URL** in `app/page.tsx` line 405
2. **Connect Backend** for real analysis
3. **Replace Mock Data** with API responses
4. **Add Real Datasets** for training/comparison
5. **Implement Authentication** (optional)

### Current Capabilities:
✅ Upload screenshots
✅ Record/upload audio
✅ Display results (mock)
✅ Multi-language interface
✅ Download "reports" (needs backend)
❌ Actual analysis (needs ML backend)

---

## 💡 Key Technical Decisions

1. **Next.js 15** with App Router for SSR & optimal performance
2. **TypeScript** for type safety
3. **Tailwind CSS** for rapid UI development
4. **Framer Motion** for smooth animations
5. **Client-side rendering** for interactive components
6. **Mock data** for UI development (backend-ready)
7. **Vercel deployment** recommended (optimized for Next.js)

---

**Build Size**: 255 kB (First Load JS)
**Pages**: 4 static pages
**Components**: 9 major UI components
**Lines of Code**: ~850 lines (main app)
**Supported Languages**: 3 (en, hi, kn)

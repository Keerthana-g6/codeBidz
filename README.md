# CodeBidz 🔨 — Live Auction Platform

> A full-stack real-time auction platform built for the CodeBidz Hackathon.

---

## 🚀 Live Demo

**Frontend:** [https://your-deployment-url.com](https://your-deployment-url.com)  
**Backend API:** [https://your-api-url.com](https://your-api-url.com)

### Demo Credentials
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@codebidz.com | admin123 |
| Bidder | bidder@codebidz.com | bidder123 |

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18 + Vite, Tailwind CSS, React Router v6 |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB + Mongoose |
| **Real-time** | Socket.io (WebSockets) |
| **Auth** | JWT + bcryptjs |
| **AI Features** | Anthropic Claude API |

---

## ✨ Features

### Admin Panel
- ✅ Secure admin login
- ✅ Create, edit, and cancel auction listings (title, description, image, start/end time, min bid)
- ✅ **AI-powered description generator** using Claude API
- ✅ Assign credits to individual bidders or all bidders at once
- ✅ Monitor live bids in real-time via Socket.io
- ✅ Declare auction winners (auto credit deduction + return of outbid credits)
- ✅ View full bidding reports with filters
- ✅ Dashboard analytics (top bidders, stats, recent activity)
- ✅ Activate/deactivate bidder accounts

### Bidder Panel
- ✅ Secure registration and login
- ✅ Browse active auctions with live countdown timers
- ✅ Place bids using assigned credits
- ✅ **AI-powered smart bid suggestions** with reasoning
- ✅ **Algorithmic bid strategy suggestions** (conservative / balanced / aggressive)
- ✅ Real-time outbid notifications via Socket.io
- ✅ Live bid feed on auction detail pages
- ✅ Track credit balance (live updates)
- ✅ Personal bidding history with status tracking

### Credits System
- Admin assigns fixed credits to each bidder
- Credits are **frozen** (not deducted) when a bid is placed
- Credits are **returned** to outbid users instantly
- Credits are **deducted** only when admin declares a winner
- Full audit trail of credit movements

### Real-Time Features (Socket.io)
- Live bid feed updates on auction pages
- Outbid push notifications
- Credit balance updates
- Winner announcement broadcast
- Auction status change notifications

### Bonus Features
- 🤖 **AI Description Generator** (Claude API) — admin gets one-click compelling descriptions
- 🧠 **Smart Bid Suggestions** (Claude API + algorithmic) — bidders get strategy advice
- 🌙 **Dark mode** (default dark theme)
- 📱 **Mobile responsive** design
- 🔄 **Auto auction status updates** (upcoming → active → ended)

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js 18+
- MongoDB running locally or a MongoDB Atlas URI
- Anthropic API key (for AI features)

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/codebidz.git
cd codebidz
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your values:
# MONGO_URI=mongodb://localhost:27017/codebidz
# JWT_SECRET=your_secret_key
# ANTHROPIC_API_KEY=your_anthropic_api_key
# CLIENT_URL=http://localhost:5173
```

### 3. Seed the Database (optional)
```bash
cd backend
node seed.js
```

### 4. Start the Backend
```bash
npm run dev  # development with nodemon
# or
npm start    # production
```
Backend runs on: http://localhost:5000

### 5. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on: http://localhost:5173

---

## 📁 Project Structure

```
codebidz/
├── backend/
│   ├── models/         # Mongoose schemas (User, Auction, Bid)
│   ├── routes/         # Express routes (auth, auctions, bids, admin, ai)
│   ├── middleware/      # JWT auth middleware
│   ├── socket/         # Socket.io event handlers
│   ├── seed.js         # Database seeder
│   └── server.js       # Entry point
└── frontend/
    └── src/
        ├── components/ # Reusable components (Layout, AuctionCard)
        ├── context/    # React context (Auth, Socket)
        ├── hooks/      # Custom hooks (useCountdown)
        └── pages/      # Route pages
            ├── admin/  # Admin dashboard, auctions, bidders, reports
            └── bidder/ # Bidder dashboard, auctions, detail, history
```

---

## 🔌 API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auctions` | List all auctions |
| POST | `/api/auctions` | Create auction (admin) |
| PUT | `/api/auctions/:id` | Update auction (admin) |
| DELETE | `/api/auctions/:id` | Cancel auction (admin) |
| POST | `/api/auctions/:id/declare-winner` | Declare winner (admin) |
| POST | `/api/bids` | Place a bid |
| GET | `/api/bids/my` | My bid history |
| GET | `/api/bids/smart-suggest/:id` | Smart bid suggestion |
| GET | `/api/admin/bidders` | List all bidders |
| POST | `/api/admin/assign-credits` | Assign credits |
| GET | `/api/admin/stats` | Dashboard stats |
| POST | `/api/ai/generate-description` | AI description generator |
| POST | `/api/ai/bid-suggestion` | AI bid suggestion |

---

## ⚠️ Known Limitations

- Image upload is URL-based (no file upload / cloud storage)
- No email notification system (in-app notifications only)
- AI features require an Anthropic API key — fallback shows algorithmic suggestions only
- No proxy/auto-increment bidding (coming soon)
- WebSocket connections may drop on free-tier hosting (auto-reconnect is implemented)

---

## 👥 Team

| Name | Unstop Profile |
|------|---------------|
| [Keerthana G] | [https://unstop.com/u/keerthan71583] |

---

## 🏆 Built for CodeBidz Hackathon 2025

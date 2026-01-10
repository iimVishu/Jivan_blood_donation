# Jeevan - Blood Donation Management System

## 📋 Project Overview

**Jeevan** is a comprehensive blood donation management platform built with modern web technologies. It connects donors, hospitals, recipients, and administrators in a unified ecosystem to facilitate efficient blood donation processes, emergency responses, and inventory management.

---

## 🚀 Technology Stack

### **Core Framework**
- **Next.js 16.0.10** - React framework with App Router and Turbopack
- **React 19.2.3** - UI library
- **TypeScript 5** - Type-safe development

### **Authentication & Security**
- **NextAuth.js 4.24.5** - Authentication with credentials provider
- **bcryptjs 3.0.3** - Password hashing

### **Database**
- **MongoDB** - NoSQL database
- **Mongoose 8.0.0** - ODM for MongoDB

### **UI & Styling**
- **Tailwind CSS 3.4.19** - Utility-first CSS framework
- **Framer Motion 12.23.24** - Animation library
- **Lucide React 0.554.0** - Icon library
- **clsx 2.1.1** - Conditional className utility

### **AI & Analytics**
- **Google Generative AI 0.24.1** - Gemini AI for health insights

### **Document Generation**
- **jsPDF 3.0.4** - PDF generation
- **html2canvas 1.4.1** - Screenshot/canvas conversion
- **QRCode 1.5.4** - QR code generation

### **Notifications**
- **Nodemailer 6.9.9** - Email service

### **UI Effects**
- **canvas-confetti 1.9.4** - Celebration animations

---

## 📁 Project Structure

```
blood-donation/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # Authentication pages
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── api/                      # API Routes
│   │   │   ├── admin/               # Admin endpoints
│   │   │   │   ├── stats/          # Statistics
│   │   │   │   ├── users/          # User management
│   │   │   │   └── volunteers/     # Volunteer management
│   │   │   ├── ai/
│   │   │   │   └── health-insight/ # AI health analysis
│   │   │   ├── appointments/       # Appointment CRUD
│   │   │   ├── auth/
│   │   │   │   └── [...nextauth]/  # NextAuth configuration
│   │   │   ├── badges/             # Achievement badges
│   │   │   ├── bloodbanks/         # Blood bank management
│   │   │   ├── camps/              # Blood donation camps
│   │   │   ├── chat/               # AI chatbot
│   │   │   ├── contact/            # Contact form
│   │   │   ├── disaster/           # Disaster mode
│   │   │   ├── join/               # Volunteer registration
│   │   │   ├── leaderboard/        # Donor rankings
│   │   │   ├── profile/            # User profile
│   │   │   ├── register/           # User registration
│   │   │   │   └── verify/         # Email verification
│   │   │   ├── reminders/          # Donation reminders
│   │   │   ├── requests/           # Blood requests
│   │   │   ├── sos/                # Emergency alerts
│   │   │   └── seed/               # Database seeding
│   │   ├── dashboard/              # Role-based dashboards
│   │   │   ├── admin/             # Admin dashboard
│   │   │   ├── donor/             # Donor dashboard
│   │   │   ├── hospital/          # Hospital dashboard
│   │   │   └── recipient/         # Recipient dashboard
│   │   ├── about/                  # About page
│   │   ├── blog/                   # Blog section
│   │   ├── camps/                  # Blood camps list
│   │   ├── contact/                # Contact page
│   │   ├── donate/                 # Donation scheduling
│   │   ├── donate-money/           # Monetary donations
│   │   ├── education/              # Blood education
│   │   ├── eligibility/            # Eligibility checker
│   │   ├── faq/                    # FAQ page
│   │   ├── join/                   # Join as volunteer
│   │   ├── leaderboard/            # Leaderboard page
│   │   ├── request/                # Request blood
│   │   ├── globals.css            # Global styles
│   │   ├── layout.tsx             # Root layout
│   │   └── page.tsx               # Home page
│   ├── components/                  # Reusable components
│   │   ├── BadgesDisplay.tsx      # Achievement badges
│   │   ├── BloodGravity.tsx       # Animated blood drop
│   │   ├── BloodJourneyTracker.tsx # Donation tracking
│   │   ├── Certificate.tsx        # Donation certificate
│   │   ├── ChatBot.tsx            # AI chatbot
│   │   ├── DigitalDonorCard.tsx   # Digital ID card
│   │   ├── DonationReminders.tsx  # Reminder notifications
│   │   ├── EligibilityChecker.tsx # Check eligibility
│   │   ├── EmergencyAlertsList.tsx # SOS alerts
│   │   ├── EmergencySOS.tsx       # Emergency button
│   │   ├── Footer.tsx             # Footer
│   │   ├── InventoryChart.tsx     # Blood inventory chart
│   │   ├── LiveActivity.tsx       # Real-time activity
│   │   ├── Navbar.tsx             # Navigation bar
│   │   ├── Providers.tsx          # Session provider
│   │   └── ShareButtons.tsx       # Social sharing
│   ├── lib/                        # Utilities
│   │   ├── db.ts                  # MongoDB connection
│   │   └── email.ts               # Email service
│   ├── models/                     # Mongoose schemas
│   │   ├── Appointment.ts
│   │   ├── Badge.ts
│   │   ├── BloodBank.ts
│   │   ├── Camp.ts
│   │   ├── DisasterAlert.ts
│   │   ├── EmergencyAlert.ts
│   │   ├── Reminder.ts
│   │   ├── Request.ts
│   │   ├── User.ts
│   │   └── Volunteer.ts
│   └── types/
│       └── next-auth.d.ts         # NextAuth type extensions
├── public/                          # Static assets
│   ├── manifest.json              # PWA manifest
│   └── sw.js                      # Service worker
├── .env.local                      # Environment variables (not in git)
├── .gitignore
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
└── tsconfig.json
```

---

## ✨ Key Features

### **For Donors**
- 🩸 Schedule blood donation appointments
- 🏆 Earn achievement badges
- 📊 Track donation history with journey visualization
- 💳 Digital donor card with QR code
- 📜 Download donation certificates
- 🔔 Smart donation reminders
- 🤖 AI-powered health insights
- 📈 View leaderboard rankings

### **For Hospitals/Blood Banks**
- 📦 Real-time inventory management (A+, A-, B+, B-, AB+, AB-, O+, O-)
- ✅ Manage donation appointments (confirm/cancel)
- 📋 Record health statistics (BP, hemoglobin, weight, pulse, temperature)
- 🔴 Activate emergency SOS alerts
- 📊 Track donation metrics
- 🏥 Multi-blood bank support for hospital chains

### **For Recipients**
- 🆘 Create blood requests with urgency levels
- 🔍 Search nearby blood banks
- 📍 View real-time inventory
- 🚨 Respond to emergency alerts
- 📧 Automated matching notifications

### **For Admins**
- 👥 User management (donors, recipients, hospitals)
- 🏥 Blood bank CRUD operations
- 📊 Platform-wide statistics
- 🚨 Disaster mode activation (broadcast alerts to nearby donors)
- 👨‍💼 Volunteer management
- 📅 Appointment oversight
- 🔗 Link hospital users to blood banks

### **General Features**
- 🔐 Secure authentication with role-based access
- 🎨 Modern, responsive UI with animations
- 🌐 Progressive Web App (PWA) support
- 📱 Mobile-friendly design
- 🤖 AI chatbot for instant support
- 📧 Email verification
- 📍 Geolocation-based features
- 📚 Educational content about blood donation
- 🎉 Gamification with badges and leaderboards
- 📱 Social sharing for emergencies

---

## 🗄️ Database Models

### **User**
```typescript
{
  name: string
  email: string (unique)
  password: string (hashed)
  role: 'donor' | 'recipient' | 'hospital' | 'admin'
  bloodGroup: string
  phone: string
  address: { street, city, state, zip }
  location: { type: 'Point', coordinates: [lng, lat] }
  isVerified: boolean
  verificationToken: string
  donationCount: number
  lastDonation: Date
  hospitalId: ObjectId (for hospital users)
  hospitalIds: ObjectId[] (for multi-bank support)
}
```

### **BloodBank**
```typescript
{
  name: string
  email: string
  phone: string
  address: { street, city, state, zip }
  location: { type: 'Point', coordinates: [lng, lat] }
  inventory: {
    A_positive, A_negative,
    B_positive, B_negative,
    AB_positive, AB_negative,
    O_positive, O_negative: number
  }
  status: 'Active' | 'Inactive'
}
```

### **Appointment**
```typescript
{
  donor: ObjectId
  bloodBank: ObjectId
  date: Date
  timeSlot: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  trackingStatus: 'collected' | 'testing' | 'processing' | 'ready' | 'transfused'
  healthStats: {
    bloodPressure, hemoglobin, weight, pulse, temperature
  }
  notes: string
}
```

### **Request**
```typescript
{
  patient: ObjectId
  bloodGroup: string
  units: number
  urgency: 'low' | 'medium' | 'high' | 'critical'
  hospital: string
  location: { type: 'Point', coordinates }
  contactPhone: string
  status: 'pending' | 'fulfilled' | 'cancelled'
  expiresAt: Date
}
```

### **EmergencyAlert**
```typescript
{
  bloodBank: ObjectId
  bloodGroup: string
  units: number
  urgency: 'critical'
  radius: number (km)
  expiresAt: Date
  resolvedAt: Date
  status: 'active' | 'resolved'
}
```

### **DisasterAlert**
```typescript
{
  title: string
  description: string
  location: string
  radius: number
  requiredBloodGroups: string[]
  createdBy: ObjectId
  notifiedCount: number
  isActive: boolean
}
```

### **Badge**
```typescript
{
  name: string
  description: string
  icon: string
  criteria: { type: 'donation_count', value: number }
  tier: 'bronze' | 'silver' | 'gold' | 'platinum'
  color: string
}
```

### **Reminder**
```typescript
{
  user: ObjectId
  type: 'donation_eligible' | 'appointment_upcoming' | 'custom'
  message: string
  scheduledFor: Date
  sent: boolean
  sentAt: Date
}
```

### **Camp**
```typescript
{
  name: string
  organizer: string
  date: Date
  location: { type: 'Point', coordinates, address }
  bloodBank: ObjectId
  capacity: number
  registered: number
  status: 'upcoming' | 'ongoing' | 'completed'
}
```

### **Volunteer**
```typescript
{
  name: string
  email: string
  phone: string
  skills: string[]
  availability: string
  location: { type: 'Point', coordinates }
  status: 'pending' | 'approved' | 'rejected'
}
```

---

## 🔌 API Routes

### **Authentication**
- `POST /api/register` - Register new user
- `POST /api/register/verify` - Verify email with token
- `POST /api/auth/[...nextauth]` - NextAuth endpoints

### **User Management**
- `GET /api/profile` - Get current user profile
- `PATCH /api/profile` - Update profile
- `GET /api/admin/users` - List all users (admin)
- `PATCH /api/admin/users/[id]` - Update user (admin)
- `DELETE /api/admin/users/[id]` - Delete user (admin)

### **Appointments**
- `GET /api/appointments` - List appointments
- `POST /api/appointments` - Create appointment
- `PATCH /api/appointments/[id]` - Update appointment status
- `DELETE /api/appointments/[id]` - Cancel appointment

### **Blood Banks**
- `GET /api/bloodbanks` - List blood banks
- `POST /api/bloodbanks` - Create blood bank (admin)
- `GET /api/bloodbanks/[id]` - Get blood bank details
- `PATCH /api/bloodbanks/[id]` - Update blood bank
- `DELETE /api/bloodbanks/[id]` - Delete blood bank (admin)

### **Blood Requests**
- `GET /api/requests` - List blood requests
- `POST /api/requests` - Create blood request
- `PATCH /api/requests/[id]` - Update request status
- `DELETE /api/requests/[id]` - Delete request

### **Emergency Alerts**
- `GET /api/sos` - List active SOS alerts
- `POST /api/sos` - Create emergency alert (hospital)
- `PATCH /api/sos/[id]` - Resolve alert
- `DELETE /api/sos/[id]` - Delete alert

### **Disaster Mode**
- `GET /api/disaster` - Get active disaster alert
- `POST /api/disaster` - Activate disaster mode (admin)
- `PATCH /api/disaster` - Deactivate disaster mode

### **Badges & Achievements**
- `GET /api/badges` - Get user badges
- `POST /api/badges` - Award badge (system)

### **Reminders**
- `GET /api/reminders` - Get user reminders
- `POST /api/reminders` - Create reminder
- `PATCH /api/reminders/[id]` - Mark as sent

### **Camps**
- `GET /api/camps` - List blood donation camps
- `POST /api/camps` - Create camp (admin)

### **Volunteers**
- `GET /api/admin/volunteers` - List volunteers (admin)
- `POST /api/join` - Apply as volunteer
- `PATCH /api/admin/volunteers/[id]` - Approve/reject (admin)

### **AI Features**
- `POST /api/ai/health-insight` - Get AI health analysis
- `POST /api/chat` - AI chatbot

### **Analytics**
- `GET /api/admin/stats` - Platform statistics (admin)
- `GET /api/leaderboard` - Top donors

### **Utilities**
- `POST /api/contact` - Contact form
- `POST /api/seed` - Seed database (dev)
- `GET /api/test-config` - Test configuration

---

## 🎨 Components

### **Dashboard Components**
- **BadgesDisplay** - Show earned achievement badges
- **BloodJourneyTracker** - Visual donation journey timeline
- **Certificate** - Printable donation certificate
- **DigitalDonorCard** - QR code-enabled donor ID
- **DonationReminders** - Notification management
- **InventoryChart** - Blood stock visualization

### **Interactive Components**
- **ChatBot** - AI-powered support chat
- **EligibilityChecker** - Interactive eligibility form
- **EmergencyAlertsList** - Real-time SOS alerts
- **EmergencySOS** - Emergency alert creator

### **Layout Components**
- **Navbar** - Role-based navigation
- **Footer** - Site footer
- **Providers** - Session and context providers

### **Utility Components**
- **BloodGravity** - Animated blood drop effects
- **LiveActivity** - Real-time activity feed
- **ShareButtons** - Social media sharing

---

## ⚙️ Environment Variables

Create a `.env.local` file in the root directory:

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/blood-donation

# NextAuth
NEXTAUTH_SECRET=your-random-secret-key
NEXTAUTH_URL=http://localhost:3000

# Email (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password

# AI
GEMINI_API_KEY=your-google-gemini-api-key

# Optional: Stripe (for donations)
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

---

## 🚀 Getting Started

### **Prerequisites**
- Node.js 20+
- MongoDB (local or Atlas)
- npm or yarn

### **Installation**

```bash
# Clone repository
git clone <repository-url>
cd blood-donation

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your values

# Run development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### **Build for Production**

```bash
npm run build
npm start
```

---

## 📦 Database Setup

### **1. MongoDB Atlas (Recommended)**
1. Create free cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create database user
3. Whitelist IP addresses
4. Copy connection string to `MONGODB_URI`

### **2. Seed Initial Data**
Visit `/api/seed` to populate:
- Blood banks
- Badge definitions
- Sample data (dev only)

### **3. Create Admin User**
Run the `create-admin.mjs` script:
```bash
node create-admin.mjs
```

---

## 🔐 Authentication Flow

1. User registers via `/register`
2. Email verification token sent
3. User clicks verification link
4. Email verified, account activated
5. User logs in with credentials
6. NextAuth creates session
7. Role-based dashboard redirect

### **Roles**
- **donor** → `/dashboard/donor`
- **recipient** → `/dashboard/recipient`
- **hospital** → `/dashboard/hospital`
- **admin** → `/dashboard/admin`

---

## 🎯 Key Workflows

### **Blood Donation Workflow**
1. Donor schedules appointment
2. Hospital confirms appointment
3. Donor arrives, health check performed
4. Blood collected, status updated
5. Blood tested and processed
6. Inventory updated
7. Donor earns badge (if milestone reached)
8. Certificate generated

### **Emergency Request Workflow**
1. Hospital creates SOS alert
2. System finds donors within radius
3. Email/notifications sent to matching donors
4. Donors respond via platform
5. Hospital confirms appointments
6. Alert resolved when fulfilled

### **Disaster Mode Workflow**
1. Admin activates disaster mode
2. Broadcast message to all donors in radius
3. All blood groups requested
4. Real-time dashboard for admin
5. Coordination of donation camps
6. Deactivate when emergency resolved

---

## 🎨 Styling & Theming

### **Tailwind Configuration**
- Custom color palette (red primary for blood theme)
- Responsive breakpoints
- Custom animations
- Dark mode ready (not yet implemented)

### **Framer Motion Animations**
- Page transitions
- Card hover effects
- Tab switching
- Button interactions
- Confetti celebrations

---

## 📱 PWA Features

### **manifest.json**
- App name and icons
- Theme colors
- Display mode: standalone
- Orientation: portrait

### **Service Worker**
- Offline caching
- Background sync (future)
- Push notifications (future)

---

## 🤖 AI Integration

### **Google Gemini AI**
- **Health Insights**: Analyze donation history for personalized advice
- **Chatbot**: Answer blood donation queries
- Natural language processing
- Context-aware responses

---

## 🔒 Security Features

- Password hashing with bcryptjs
- Email verification
- JWT session tokens
- Role-based access control (RBAC)
- MongoDB injection prevention
- CSRF protection
- Rate limiting (recommended for production)

---

## 📊 Performance Optimizations

- Next.js App Router with Turbopack
- Server-side rendering (SSR)
- Automatic code splitting
- Image optimization
- MongoDB indexing on geolocation
- Lazy loading components

---

## 🚢 Deployment

### **Recommended: Vercel**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### **Environment Variables on Vercel**
Add all `.env.local` variables in project settings

### **Custom Domain**
Configure in Vercel dashboard → Domains

---

## 🧪 Testing

### **Manual Testing Checklist**
- [ ] User registration and verification
- [ ] Login with all roles
- [ ] Appointment booking
- [ ] Emergency alert creation
- [ ] Inventory updates
- [ ] Badge awarding
- [ ] AI chatbot responses
- [ ] Email delivery
- [ ] Mobile responsiveness

---

## 🐛 Known Issues & Limitations

- PWA service worker needs refresh implementation
- No real-time WebSocket updates (uses polling)
- Email service limited to Gmail
- No payment gateway integration yet
- No multi-language support

---

## 🔮 Future Enhancements

- [ ] Real-time notifications with Socket.io
- [ ] Mobile app (React Native)
- [ ] Blood bank API integration
- [ ] Advanced analytics dashboard
- [ ] Machine learning for donation predictions
- [ ] Blockchain for donation tracking
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Payment gateway integration
- [ ] SMS notifications
- [ ] Calendar integration
- [ ] Wearable device integration

---

## 📄 License

This project is open source and available under the MIT License.

---

## 👨‍💻 Development Scripts

```bash
# Development
npm run dev          # Start dev server with hot reload

# Production
npm run build        # Build for production
npm start           # Start production server

# Utilities
node create-admin.mjs    # Create admin user
node test-gemini.mjs     # Test AI integration
node check-user.mjs      # Check user details
node get-latest-otp.mjs  # Get verification token
```

---

## 📞 Support

For issues, feature requests, or contributions, please refer to the project repository or contact the development team.

---

**Built with ❤️ for saving lives**

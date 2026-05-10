# ✈️ Traveloop

**The Modern, Intuitive Trip Planner for Global Explorers.**

Traveloop is a premium web application designed to help travelers plan, manage, and share their itineraries with style. Built with a focus on aesthetics, responsiveness, and user experience, Traveloop turns the chaos of trip planning into a beautiful journey.

---

## ✨ Features

### 📅 Itinerary Builder
- **Drag-and-Drop Interface**: Effortlessly reorder activities across days using `dnd-kit`.
- **Offline Drafts**: Your changes are saved locally as you plan, so you never lose progress.
- **Activity Categories**: Categorize activities (Flights, Hotels, Food, etc.) with custom icons and colors.

### 💰 Budget & Analytics
- **Visual Analytics**: Interactive pie charts and bar graphs powered by `Recharts` for a clear breakdown of your spending.
- **Expense Tracking**: Log every transaction and see how it impacts your total budget in real-time.
- **Category Breakdown**: Understand exactly where your money is going.

### 🌍 Seamless Sharing
- **Public Itineraries**: Toggle any trip to "Public" and share a read-only link with friends and family.
- **Premium Shared View**: A stunning, read-only view of your itinerary designed for mobile and desktop viewers.

### 🎨 Premium Design
- **Glassmorphism UI**: A modern, sleek interface with blur effects and subtle gradients.
- **Framer Motion Animations**: Smooth transitions and staggered entrance effects for a professional feel.
- **Dark Mode First**: Optimized for a high-end, cinematic look.
- **100% Responsive**: Works flawlessly on phones, tablets, and desktops.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React](https://reactjs.org/) (Vite)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Charts**: [Recharts](https://recharts.org/)
- **Drag & Drop**: [dnd-kit](https://dnd-kit.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

### Backend
- **Server**: [Express.js](https://expressjs.com/) (Node.js)
- **Database**: [PostgreSQL](https://www.postgresql.org/) (via [Supabase](https://supabase.com/))
- **ORM**: [Prisma](https://www.prisma.io/)
- **Authentication**: JWT (JSON Web Tokens) with `bcrypt` password hashing.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL Database (or a Supabase project)

### Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/RUSHILPATEL33/Odoo-Hackathon.git
   cd Odoo-Hackathon
   ```

2. **Backend Setup**:
   - Navigate to the `backend` folder.
   - Create a `.env` file based on `.env.example`.
   - Install dependencies and run migrations:
     ```bash
     npm install
     npx prisma migrate dev
     npm run dev
     ```

3. **Frontend Setup**:
   - Navigate to the `frontend` folder.
   - Install dependencies and start the dev server:
     ```bash
     npm install
     npm run dev
     ```

4. **Access the App**:
   - Open your browser and navigate to `http://localhost:5173`.

---

## 📸 Preview

*Stay tuned for live demo links and video walkthroughs!*

---

## 📜 License
This project was built for the Odoo Hackathon. All rights reserved.

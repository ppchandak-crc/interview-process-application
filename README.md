# Participant Registration & Interview Selection System

A robust, enterprise-grade full-stack web application designed for dynamic participant registration, physical inventory verification scheduling, and seamless interview process management.

## 🚀 Key Features

### Dynamic Form Engine
- **Fully Customizable Forms:** Super Admins can build complex, multi-section registration forms directly from the UI.
- **Smart Fields:** Supports text, dropdowns, checkboxes, file uploads, and dates. Includes auto-calculation features (e.g., auto-calculating exact Age based on Date of Birth inputs).
- **Responsive Grid Layouts:** Allows configuring field widths (Full, Half, 1/3) to create compact, highly readable forms.

### Security First Architecture
- **Environment Driven Secrets:** Uses `.env` and `pydantic-settings` to ensure API keys and database URLs are never hardcoded.
- **Strict HTTP Headers:** Secured against XSS, MIME-sniffing, and Clickjacking via custom Security Headers middleware.
- **RBAC (Role Based Access Control):** Differentiates between standard Admins and Super Admins for form creation and system management.

### Premium UI/UX
- **Professional Aesthetics:** Built with a sophisticated Indigo and Slate theme, optimized using TailwindCSS.
- **Intuitive Dashboards:** Features a responsive Admin Dashboard with quick-action click-to-edit row navigation and a secure login flow with password visibility toggles.
- **Enterprise Iconography:** Leverages `lucide-react` for clean, scalable vector icons.

---

## 🛠️ Technology Stack

**Frontend:**
- React 18 + Vite
- TypeScript
- TailwindCSS
- React Hook Form
- React Router DOM
- Lucide React (Icons)

**Backend:**
- Python 3.10+
- FastAPI
- SQLAlchemy (ORM)
- SQLite (Development Database)
- Pydantic v2 (Validation & Settings)

---

## ⚙️ Local Setup & Installation

### Prerequisites
- Node.js (v18 or higher)
- Python (v3.10 or higher)

### 1. Clone the repository
```bash
git clone <your-repository-url>
cd interview-process-application
```

### 2. Backend Setup
Navigate to the backend directory and set up a virtual environment:
```bash
cd backend
python -m venv venv

# Activate the virtual environment
# On Windows:
.\venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

Create a `.env` file in the `backend` directory based on the following template:
```env
# backend/.env
SECRET_KEY=your_super_secret_jwt_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
DATABASE_URL=sqlite:///./sql_app.db
```

Seed the initial Super Admin user and run the server:
```bash
python seed_user.py
uvicorn app.main:app --reload
```
*The backend API will be available at `http://localhost:8000`*

### 3. Frontend Setup
Open a new terminal, navigate to the frontend directory, and install the dependencies:
```bash
cd frontend
npm install

# Start the development server
npm run dev
```
*The frontend application will be available at `http://localhost:5173`*

---

## 🔐 Default Credentials

After running `seed_user.py`, you can access the Admin Dashboard using:
- **User ID:** `superadmin`
- **Password:** `superadmin123`

*(Note: Ensure you change these credentials or disable the seeder script in production environments).*

---

## 📝 License
This project is proprietary and confidential.
# AI-Powered Financial Empowerment Platform — Backend

A production-grade Python FastAPI backend designed specifically for individuals with **irregular/seasonal income** (farmers, daily-wage laborers, micro-business owners) and low financial literacy.

Features personalized AI assistance, multilingual support (**English, Hindi, Telugu**), natural language voice/text transaction parsing, interactive scam & fraud education, gamified financial learning, what-if simulations, and offline-first IndexedDB synchronization.

---

## 🚀 Key Differentiating Capabilities

1. **AI Understands, Logic Calculates**:
   - Free-form speech or text updates (e.g. *"This month I got 12,000 from farming and 4,000 from tailoring, but spent 8,000 on household things"*) are parsed into structured items.
   - All mathematical calculations (totals, net balance, savings rate) are performed strictly by verified application logic.
2. **Irregular Income & Volatility Engine**:
   - Calculates **Coefficient of Variation (CV)** and volatility levels across fluctuating months.
   - Computes conservative **Safe Baseline Income** to avoid lifestyle inflation during peak harvest seasons.
   - Recommends proactive deposits into a **Lean-Month Cushion** to prevent high-interest moneylender debt.
3. **Multilingual AI Financial Assistant**:
   - Powered by local **Ollama (`qwen3:4b`)** for privacy and zero cloud cost, with transparent fallback to **Google Gemini** or rule engines.
   - Context-aware answers in simple, jargon-free **English**, **Hindi (हिंदी)**, and **Telugu (తెలుగు)**.
4. **Interactive Scam & Fraud Education**:
   - Realistic multi-choice scenarios (Bank OTP scams, Electricity cutoff panic SMS, QR code receive trick, Fake PM-Kisan subsidy fees).
   - Instant scoring, psychological red flag breakdown, and official safety reporting channels (1930 / cybercrime.gov.in).
5. **Gamified Financial Learning**:
   - 4 Interactive activities: *Budget Challenge*, *Scam Detective*, *Savings Challenge*, and *Smart Spending (Needs vs Wants)*.
   - Awards XP points, badges (*Scam Shield*, *Budget Guardian*, *Smart Spender*), and daily streaks.
6. **"What-If" Financial Simulator**:
   - Stress-tests budgets against hypothetical income drops (-20%), medical expense surges, or new loan EMIs.
7. **Offline-Ready IndexedDB Synchronization**:
   - `/api/sync/bootstrap`: Downloads educational scenarios and tips for offline caching.
   - `/api/sync`: Batch uploads locally saved transactions and game progress with idempotent client UUIDs when connection is restored.

---

## 🛠️ Quickstart Guide

### 1. Environment Setup
The backend uses a local Python virtual environment:
```powershell
cd Backend
.\venv\Scripts\Activate.ps1
```

### 2. Configure Environment (`.env`)
Check `.env` (pre-configured with local defaults):
```env
PORT=8000
MONGODB_URI=mongodb://localhost:27017
DATABASE_NAME=financial_empowerment
SECRET_KEY=financial-empowerment-secure-jwt-secret-key-32-chars-long!
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen3:4b
```

### 3. Seed Database
Pre-populates realistic scam scenarios, gamified activities, and a demo user with irregular income history:
```powershell
.\venv\Scripts\python.exe seed_data.py
```
**Demo Account Credentials:**
- Email: `demo@mitra.org`
- Password: `demo123`
- Pre-set Language: `te` (Telugu) / `en` / `hi`

### 4. Run the Server
```powershell
.\venv\Scripts\python.exe run.py
```
- **Base URL**: `http://localhost:8000`
- **Interactive Swagger Docs**: `http://localhost:8000/docs`
- **Alternative ReDoc**: `http://localhost:8000/redoc`

### 5. Run Automated Tests
```powershell
.\venv\Scripts\pytest -v
```

---

## 📡 Core API Endpoints

| Category | Method | Endpoint | Description |
|---|---|---|---|
| **Health** | `GET` | `/` | System overview & core capabilities |
| **Health** | `GET` | `/api/health` | Service healthcheck & Ollama status |
| **Auth** | `POST` | `/api/auth/register` | User signup with language preference |
| **Auth** | `POST` | `/api/auth/login` | JWT login token |
| **Auth** | `GET` | `/api/auth/me` | Current authenticated user profile |
| **Profile** | `GET` | `/api/profile` | Get Personal Financial Profile |
| **Profile** | `PUT` | `/api/profile` | Update income pattern, sources, goals, language |
| **Transactions** | `GET` | `/api/transactions` | List user income and expenses |
| **Transactions** | `POST` | `/api/transactions` | Record a new transaction |
| **Transactions** | `POST` | `/api/transactions/parse-natural` | AI understanding layer (extract & calculate) |
| **Irregular** | `GET` | `/api/irregular-income/analysis` | Volatility index, safe baseline & lean buffer |
| **Budget** | `GET` | `/api/budget/current` | Current month adaptive budget |
| **Budget** | `POST` | `/api/budget/generate` | Generate adaptive budget with custom parameters |
| **Goals** | `GET` | `/api/goals` | List savings goals & progress percentages |
| **Goals** | `POST` | `/api/goals` | Create a new financial savings goal |
| **Goals** | `POST` | `/api/goals/{id}/simulate` | Simulate timeline change if monthly savings alter |
| **Assistant** | `POST` | `/api/assistant/chat` | AI conversational advisor (En/Hi/Te) |
| **Voice** | `POST` | `/api/voice/transcribe` | Audio recording transcription endpoint |
| **Scam** | `GET` | `/api/scam/scenarios` | Interactive scam questions in En, Hi, Te |
| **Scam** | `POST` | `/api/scam/evaluate` | Submit choice, get explanation & red flags |
| **Games** | `GET` | `/api/learning/activities` | 4 financial gamification activities |
| **Games** | `POST` | `/api/learning/submit` | Submit game choices, earn XP and badges |
| **Dashboard** | `GET` | `/api/dashboard/summary` | Simple, low-literacy friendly metrics & tips |
| **Simulator** | `POST` | `/api/simulator/simulate` | What-if financial stress test |
| **Sync** | `GET` | `/api/sync/bootstrap` | Download offline scenarios, games, and tips |
| **Sync** | `POST` | `/api/sync` | Batch upload offline changes from IndexedDB |

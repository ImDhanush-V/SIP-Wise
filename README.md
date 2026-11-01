# SIP-Wise 🇮🇳

> **An Intelligent Investment-Planning & Markowitz Portfolio Optimizer for Indian Mutual Fund SIPs**

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI_0.115-009688.svg?logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React_18_+_Vite-61DAFB.svg?logo=react)](https://vitejs.dev)
[![SciPy](https://img.shields.io/badge/Math-NumPy_%2B_SciPy_SLSQP-8CAAE6.svg)](https://scipy.org)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB_%2B_Motor-47A248.svg?logo=mongodb)](https://mongodb.com)

---

### ⚠️ Statutory Disclaimer
> **Educational tool. Not financial advice. Past returns do not guarantee future results.**  
> Mutual fund investments are subject to market risks. Read all scheme-related documents carefully.

---

## 🏗️ Architecture Diagram

```
+---------------------------------------------------------------------------------+
|                                 USER BROWSER                                    |
|                      React 18 + Vite + Recharts + Lucide                        |
|   [ 1. Risk Questionnaire ]  ->  [ 2. Goal / SIP Inputs ]  ->  [ 3. Dashboard ] |
+---------------------------------------------------------------------------------+
                                      |
                               REST / JSON (CORS)
                                      v
+---------------------------------------------------------------------------------+
|                              FASTAPI BACKEND                                    |
|                            (Python 3.11 / Uvicorn)                              |
|                                                                                 |
|  Endpoints:                                                                     |
|  • POST /risk-profile         -> 7-question psychometric scoring engine         |
|  • GET  /funds/categories     -> Scheme metadata & category mapping             |
|  • POST /optimize             -> Markowitz mean-variance optimization (SLSQP)   |
|  • POST /simulate             -> Monte Carlo multivariate normal SIP paths      |
|  • POST /plans & GET /plans   -> Plan persistence with BSON ObjectId            |
|  • GET  /health               -> Liveness healthcheck probe                     |
+---------------------------------------------------------------------------------+
            |                                           |
    Async Motor Driver                               HTTPX / File I/O
            v                                           v
+------------------------+             +------------------------------------------+
|     MONGODB DATABASE   |             |            DATA INGESTION                |
|  • nav_cache           |             |  1. MFAPI.in (Live historical NAV API)   |
|  • plans               |             |  2. MongoDB Cache Layer                  |
|                        |             |  3. Fallback CSV (6-year Indian MF data) |
+------------------------+             +------------------------------------------+
```

---

## 🚀 Features

1. **Risk Profiling**: 7-question questionnaire evaluating age, horizon, income stability, reaction to a 20% drawdown, savings rate, investment goals, and experience. Categorized into **Conservative**, **Moderate**, or **Aggressive**.
2. **Indian Mutual Fund Data**: Representative schemes across 6 key Indian categories:
   - **Large Cap**: UTI Nifty 50 Index Fund (`120503`)
   - **Mid Cap**: HDFC Mid-Cap Opportunities Fund (`101539`)
   - **Small Cap**: SBI Small Cap Fund (`125307`)
   - **Debt**: HDFC Short Term Debt Fund (`119551`)
   - **Gold**: SBI Gold Fund (`100060`)
   - **Hybrid**: ICICI Prudential Balanced Advantage (`106235`)
   - Three-tier resilient fetching: **Live MFAPI.in -> MongoDB cache -> Seeded CSV fallback**.
3. **Markowitz Modern Portfolio Theory (MPT)**:
   - Uses `scipy.optimize.minimize` with Sequential Least Squares Programming (**SLSQP**).
   - Solves for minimum variance subject to constraints: $\sum w_i = 1$, $0 \le w_i \le \text{cap}$ (no short selling).
   - Generates the **Efficient Frontier**, computes the **Minimum Variance Portfolio**, the **Maximum Sharpe Portfolio** (default risk-free rate = 6.5%), and maps the user's risk tolerance onto the frontier.
4. **Monte Carlo SIP Simulation**:
   - Generates 1,000+ stochastic monthly return paths using NumPy's `multivariate_normal` parameterized by the historical mean vector $\mathbf{\mu}$ and covariance matrix $\mathbf{\Sigma}$.
   - Simulates month-by-month compounding with the user's regular SIP investment.
   - Computes empirical **Goal Probability** (chance of hitting target corpus) and **10th, 25th, 50th (median), 75th, and 90th percentile** outcomes.
   - Displays a dynamic fan chart alongside traditional single-point linear estimates to highlight volatility drag and sequence-of-returns risk.
5. **Persistence**: Save finalized plans to MongoDB and reload anytime via unique plan IDs.

---

## 🛠️ Local Development Setup

### Prerequisites
- Python 3.11+
- Node.js 18+ & npm
- MongoDB (optional for dev; fallback CSV works automatically if MongoDB is not running)

### 1. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env from template
cp .env.example .env

# Run pytest unit tests (16 tests for optimizer & simulator)
pytest tests/ -v

# Start FastAPI development server
uvicorn app.main:app --reload --port 8000
```
API Documentation will be live at: `http://localhost:8000/docs`

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env from template
cp .env.example .env

# Start Vite dev server
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🐳 Docker Setup

Run the entire full-stack app (MongoDB, FastAPI backend, Vite frontend) with a single command:

```bash
docker-compose up --build
```

- **Frontend**: `http://localhost:3000`
- **Backend API**: `http://localhost:8000`
- **Swagger Docs**: `http://localhost:8000/docs`
- **MongoDB**: `localhost:27017`

---

## 🧪 Testing

16 thorough unit tests covering mathematical constraints and simulation properties:
```bash
cd backend
pytest tests/ -v
```
Test suite verifies:
- $\sum w_i = 1$ strictly across all portfolios and efficient frontier points
- Non-negativity constraints ($w_i \ge 0$, no short selling)
- Maximum weight caps are rigorously respected
- Monotonicity of returns across the efficient frontier curve
- Minimum variance portfolio volatility $\le$ Maximum Sharpe portfolio volatility
- Risk profile ordering ($E(R)_{\text{Aggressive}} \ge E(R)_{\text{Conservative}}$)
- Monte Carlo reproducibility under fixed seeds
- Goal probability bounded within $[0, 1]$
- Correct percentile ordering ($P_{10} \le P_{25} \le P_{50} \le P_{75} \le P_{90}$)
- Boundary edge cases (zero target goal $\rightarrow$ 1.0 probability, astronomical goal $\rightarrow$ 0.0)

---

## How the Optimizer & Simulator Work

### 1. Markowitz Mean-Variance Optimization (SLSQP)

**The Problem**: Given $N$ asset categories, each with expected annual return $\mu_i$ and an $N \times N$ covariance matrix $\mathbf{\Sigma}$, find asset weights $\mathbf{w} = [w_1, \dots, w_N]^T$ that minimize portfolio variance $\sigma_p^2 = \mathbf{w}^T \mathbf{\Sigma} \mathbf{w}$ subject to:
1. $\sum_{i=1}^N w_i = 1$ (Fully invested)
2. $0 \le w_i \le w_{\max}$ (No short selling, diversification cap)
3. $\mathbf{w}^T \mathbf{\mu} = R_{\text{target}}$ (Target return constraint)

**The SLSQP Algorithm**:
Sequential Least Squares Programming (`scipy.optimize.minimize(method="SLSQP")`) is a gradient-based nonlinear optimizer. At each iteration, it approximates the objective function with a quadratic subproblem and linearizes the equality and inequality constraints. It then solves the Karush-Kuhn-Tucker (KKT) conditions to find the optimal search direction and step size.

**Frontier Construction & Profile Mapping**:
1. First, we find the **Global Minimum Variance** portfolio (unconstrained target return).
2. We identify the achievable maximum return $R_{\max}$ given the weight cap.
3. We discretize the return interval $[R_{\min}, R_{\max}]$ into 50 points and solve the SLSQP minimization for each target return to trace out the upper parabolic envelope: the **Efficient Frontier**.
4. We also solve for the **Maximum Sharpe Ratio** portfolio by minimizing $-\frac{\mathbf{w}^T \mathbf{\mu} - R_f}{\sqrt{\mathbf{w}^T \mathbf{\Sigma} \mathbf{w}}}$, where $R_f = 6.5\%$ (the Indian 10-year G-Sec benchmark).
5. The user's risk profile maps to a specific target return along the frontier:
   - **Conservative**: $R_{\min} + 0.20 \times (R_{\max} - R_{\min})$
   - **Moderate**: $R_{\min} + 0.50 \times (R_{\max} - R_{\min})$
   - **Aggressive**: $R_{\min} + 0.80 \times (R_{\max} - R_{\min})$

---

### 2. Monte Carlo SIP Simulation Logic

**Why Traditional SIP Calculators Fail**:
Conventional calculators use the single-point future value of annuity formula:
$$FV = SIP \times \frac{(1+r)^n - 1}{r} \times (1+r)$$
This assumes a deterministic, perfectly flat monthly return $r$. In real markets:
1. **Volatility drag**: A +20% gain followed by a -20% loss equals a -4% net loss, not 0%.
2. **Sequence of returns risk**: If a major market crash hits in Year 9 of a 10-year SIP when the accumulated corpus is large, the dollar impact is catastrophic compared to a crash in Year 1.

**Our Monte Carlo Process**:
1. **Correlated Stochastic Returns**: We draw return vectors from a multivariate normal distribution:
   $$\mathbf{R}_{t} \sim \mathcal{N}(\mathbf{\mu}_{\text{monthly}}, \mathbf{\Sigma}_{\text{monthly}})$$
   This preserves real-world correlations (e.g., Gold acting as a hedge during equity downturns, Large Cap and Mid Cap moving together).
2. **Portfolio Return**: For each simulation $s \in \{1, \dots, 1000\}$ and month $t \in \{1, \dots, T\}$:
   $$r_{s, t} = \mathbf{w}^T \mathbf{R}_{s, t}$$
3. **Monthly SIP Iteration**: Compounding occurs month-by-month:
   $$C_{s, t} = (C_{s, t-1} + SIP) \times (1 + r_{s, t})$$
4. **Empirical Statistics**:
   - **Goal Probability**: The fraction of simulated paths where final corpus $C_{s, T} \ge \text{Goal Corpus}$.
   - **Percentile Outcomes**: $P_{10}, P_{25}, P_{50}, P_{75}, P_{90}$ extracted via `np.percentile(final_corpus, q)`.

---

# Saint & Story Email Verifier

Local email validation tool for campaigns. Validates each email via MX, SMTP, and syntax checks before sending.

---

## Setup

### 1. Navigate to the verifier folder
```bash
cd tools/email-verifier
```

### 2. Create Python environment
```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Install dependencies
```bash
pip install flask flask-cors dnspython
```

---

## Usage

### Terminal Tab 1 — Start verification server
```bash
source venv/bin/activate
python3 verify-app.py
```

You'll see:
```
🔥 VERIFIER RUNNING - Want sales calls from leads? Go to AlexBerman.com/Mastermind 🔥
```

### Terminal Tab 2 — Start HTTP server
```bash
cd tools/email-verifier
python3 -m http.server 3000
```

### Open in browser
```
http://localhost:3000/index.html
```

---

## The Workflow

**Before running campaigns:**

1. Generate emails in `/operator/campaigns` (automatically creates firstname.lastname@domain format)
2. Download your CSV with generated emails
3. Open email verifier at `http://localhost:3000/index.html`
4. Drag in your CSV
5. Each email gets validated:
   - **Valid** — SMTP accepted, confirmed deliverable
   - **Risky** — Domain accepts all, SMTP timeout, soft fails
   - **Invalid** — Bad syntax, no MX, disposable domain, role-based (info@, support@, etc)
6. Download `valid-only` CSV
7. Upload cleaned CSV to campaigns and send

---

## What It Checks

- ✅ Email syntax (RFC-compliant)
- ✅ MX records exist for domain
- ✅ SMTP verification (real-time)
- ✅ Disposable domains (mailinator.com, etc)
- ✅ Role-based addresses (info@, support@, admin@, etc)
- ✅ Domain accept-all behavior
- ✅ SMTP soft-fails (with retry)

---

## Download Options

When verification completes, download:
- **All Leads** — everything (status + reason)
- **Valid Only** — confirmed deliverable emails only
- **Risky Only** — SMTP timeouts, soft-fails
- **Risky & Invalid** — anything that's not valid

Use **Valid Only** for campaigns.

---

## Notes

- Verification runs in background (doesn't block UI)
- Results persist across browser refresh
- Cancel jobs mid-run anytime
- Emails checked 1-by-1 (respects server timeouts)
- Each job gets timestamped download with job ID

---

## Integration with Campaigns

**Future:** Email verifier could be integrated into campaigns UI as a pre-send validation step. For now, run locally and download validated emails, then upload to campaigns.

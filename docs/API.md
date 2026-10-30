# AdCopyCraft AI — REST API Documentation

Base URL: `http://localhost:3000/api`

## Authentication

All protected endpoints accept a Bearer token in the `Authorization` header, or an optional `x-demo-role` header for local development and persona switching.

```http
Authorization: Bearer <jwt_token>
# OR
x-demo-role: campaign_manager
```

---

## Endpoints

### 1. System Health & Observability

#### `GET /health/live`
Kubernetes liveness probe.
- **Response**: `200 OK`
```json
{
  "status": "UP",
  "timestamp": "2026-10-30T12:00:00.000Z"
}
```

#### `GET /health/ready`
Kubernetes readiness probe verifying SQLite WAL connectivity.
- **Response**: `200 OK`
```json
{
  "status": "READY",
  "database": "connected",
  "sqlite_wal": true,
  "timestamp": "2026-10-30T12:00:00.000Z"
}
```

#### `GET /metrics`
Exposes Prometheus metric exposition format text.
- **Response**: `200 OK` (`text/plain`)

---

### 2. Authentication & Personas

#### `POST /auth/login`
Authenticates a user and issues a JWT token.
- **Request Body**:
```json
{
  "username": "copywriter_sarah",
  "password": "password123"
}
```
- **Response**: `200 OK`
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsIn...",
  "user": {
    "id": "usr_copywriter_01",
    "username": "copywriter_sarah",
    "email": "sarah.copy@adcraft.ai",
    "role": "copywriter"
  }
}
```

#### `GET /auth/me`
Retrieves currently authenticated user details.

---

### 3. Campaign Management

#### `GET /campaigns`
Lists all campaign demographic profiles.

#### `GET /campaigns/:id`
Retrieves a single campaign along with its generated ad variants.

#### `POST /campaigns`
Creates a new campaign targeting profile. *(Requires `campaign_manager` or `admin` role)*
- **Request Body**:
```json
{
  "title": "CloudPulse — Autonomous Enterprise FinOps",
  "product_name": "CloudPulse",
  "value_prop": "Save 38% on Kubernetes cloud spend in 14 days.",
  "target_url": "https://cloudpulse.io/demo",
  "industry": "cloud_infra",
  "company_size": "enterprise",
  "seniority": "c_level",
  "tone": "analytical",
  "primary_cta": "Book a Demo"
}
```

---

### 4. Ad Copy Generation

#### `POST /campaigns/:id/generate`
Synthesizes ad copy variants across platforms and angles.
- **Request Body**:
```json
{
  "platform": "google_search_rsa",
  "angle": "pain_point" // Optional: omits to generate all 3 angles
}
```
- **Response**: `200 OK`
```json
{
  "data": {
    "campaign_id": "cmp_cloudpulse_01",
    "platform": "google_search_rsa",
    "variants": [
      {
        "id": "var_8f91a2bc44de",
        "angle": "pain_point",
        "headlines": [
          { "text": "Stop Cloud Waste Now", "pin": 1, "category": "Hook" }
        ],
        "descriptions": [
          { "text": "Reclaim idle cluster capacity and right-size AWS and GCP pods in 14 days." }
        ],
        "ad_strength_score": 92,
        "predicted_ctr": 4.8,
        "readability_grade": 8.1
      }
    ]
  }
}
```

---

### 5. Policy Compliance & Auto-Fix

#### `POST /compliance/audit`
Audits ad copy for platform policy compliance.

#### `POST /compliance/autofix`
Applies 1-Click copy sanitization, word-boundary truncation, and clickbait replacement.

---

### 6. Omnichannel Exports

#### `GET /campaigns/:id/export?format={format}`
Exports campaigns in bulk format:
- `format=csv_google`: RFC 4180 CSV for Google Ads Editor.
- `format=csv_linkedin`: CSV for LinkedIn Campaign Manager.
- `format=markdown`: Formatted Markdown creative brief.
- `format=json`: Complete schema-validated JSON manifest.


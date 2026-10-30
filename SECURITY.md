# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.2.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Security Controls

1. **Authentication & Session Security**:
   - Cryptographically signed JWT tokens with expiration timestamps.
   - Salted `bcryptjs` password hashing with cost factor 10.
2. **Access Control (RBAC)**:
   - Enforced route-level role checks (`copywriter`, `campaign_manager`, `admin`).
3. **Network Defense**:
   - Sliding-window rate limiting to prevent brute-force and DoS attacks.
   - Helmet HTTP security headers.
   - Request correlation tracing via `x-request-id`.
4. **Data Isolation**:
   - Prepared SQL statements preventing SQL injection.
   - Non-root container execution (`USER node`).

## Reporting a Vulnerability

Please report security issues responsibly to `security@adcraft.ai`.


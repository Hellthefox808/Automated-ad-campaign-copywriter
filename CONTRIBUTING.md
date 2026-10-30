# Contributing to AdCopyCraft AI

Thank you for your interest in contributing to **AdCopyCraft AI**.

## Zero-Placeholder Standard

All contributions must be complete, tested, and production-ready. Never commit stub functions, `// TODO` items, truncated configurations, or untested code.

## Development Workflow

1. **Clone & Install**:
   ```bash
   git clone <repo-url>
   cd automated-ad-campaign-copywriter
   npm install
   ```

2. **Run Tests**:
   ```bash
   npm test
   ```
   Ensure all 35+ unit and integration tests pass with 100% success.

3. **Build Frontend**:
   ```bash
   npm run build
   ```

4. **Start Development Server**:
   ```bash
   npm start
   ```
   Open `http://localhost:3000` in your browser.

## Code Standards

- **ES Modules**: Backend code uses native ESM (`import`/`export`).
- **Database**: SQLite3 via native `node:sqlite` with WAL mode.
- **Testing**: Native Node test runner (`node --test`).
- **Commits**: Follow conventional commits (`feat:`, `fix:`, `docs:`, `test:`, `chore:`).

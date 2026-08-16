Deploying to Vercel — Quick Steps

1) Connect repository to Vercel
- Go to https://vercel.com/new and import your Git repository (GitHub/GitLab/Bitbucket).
- Choose the root project and Next.js framework (auto-detected).

2) Add Environment Variables (recommended via Vercel dashboard)
- Project → Settings → Environment Variables
- Add variables for `Preview` and `Production` environments.
  - NEON_DATABASE_URL
  - FILEBASE_KEY
  - FILEBASE_SECRET
  - FILEBASE_BUCKET
  - ENCRYPTION_MASTER_KEY
  - ALCHEMY_POLYGON_AMOY_URL
  - NEXTAUTH_URL (e.g. https://yourdomain.com)
  - SMTP_HOST
  - SMTP_PORT
  - SMTP_USER
  - SMTP_PASS
  - EMAIL_FROM
  - JWT_SECRET (generate 32+ byte hex)
  - NEXTAUTH_SECRET (generate 32+ byte hex)
  - NODE_ENV=production

3) Generate secrets (locally example):
```
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Copy outputs into Vercel env var values.

4) Set build & output (Vercel auto-detects Next.js):
- Build Command: `npm run build`
- Output Directory: (leave default)

5) Database migrations
- Run migrations against the production DB before traffic:
  - Option A: From your machine, set `NEON_DATABASE_URL` in env and run `node scripts/migrate.js`.
  - Option B: Add a CI step that runs migrations and then deploys.

6) Deploy
- Push to the branch mapped to Production or press Deploy in Vercel.

7) Post-deploy checks
- Visit the production domain and test:
  - Signup, login, password reset, verify flows
  - Staking/withdraw flows (if using test amounts)
  - Email sending
  - File uploads
  - Transparency page and API endpoints
- Check Vercel logs and monitoring for errors.

8) Security & maintenance
- Keep secrets in Vercel only. Do not commit ` .env.local`.
- Address `npm audit` vulnerabilities: prefer controlled upgrades in a branch and test.
- Add monitoring (Sentry), backups (Neon), and automated rollbacks.

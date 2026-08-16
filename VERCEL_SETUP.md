Vercel deployment and environment setup

1) Overview
- Do NOT commit any secrets to the repository.
- Configure all production secrets via the Vercel dashboard or the Vercel CLI.

2) Required environment variables (set these in Vercel Project → Settings → Environment Variables):
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
- JWT_SECRET
- NEXTAUTH_SECRET
- NODE_ENV=production

3) Set env vars via Vercel Dashboard (recommended)
- Open your project in Vercel
- Settings → Environment Variables → Add each variable name and value. Use `Production` environment for live site.

4) Set env vars via Vercel CLI (alternative)
- Install: `npm i -g vercel`
- Login: `vercel login`
- Add a variable (this will prompt for value):
  - `vercel env add JWT_SECRET production`
  - `vercel env add NEXTAUTH_SECRET production`
  - Repeat for other variables.

5) Deploy
- After vars are set, trigger a deploy from the Vercel dashboard or push to the repository branch configured for production.

6) Post-deploy checks
- Verify signup/login flows on the production domain.
- Verify email and file uploads work.
- Monitor logs for errors.

Security notes
- Use the Vercel UI or CLI — do NOT store secrets in repository files.
- Rotate secrets if leaked; update Vercel env vars and redeploy.

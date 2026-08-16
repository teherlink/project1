type EnvConfig = {
  databaseUrl: string;
  jwtSecret: string;
  nextAuthUrl: string;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
  emailFrom: string;
  alchemyPolygonAmoyUrl: string;
};

const requiredKeys = [
  'DATABASE_URL or NEON_DATABASE_URL',
  'JWT_SECRET or NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_PASS',
  'EMAIL_FROM',
  'ALCHEMY_POLYGON_AMOY_URL',
] as const;

export function getConfig(): EnvConfig {
  const databaseUrl = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL || '';
  const jwtSecret = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || (process.env.NODE_ENV === 'production' ? '' : 'dev-secret-change-this');
  const nextAuthUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const smtpHost = process.env.SMTP_HOST || '';
  const smtpPort = Number(process.env.SMTP_PORT || '');
  const smtpUser = process.env.SMTP_USER || '';
  const smtpPass = process.env.SMTP_PASS || '';
  const emailFrom = process.env.EMAIL_FROM || '';
  const alchemyPolygonAmoyUrl = process.env.ALCHEMY_POLYGON_AMOY_URL || '';

  return {
    databaseUrl,
    jwtSecret,
    nextAuthUrl,
    smtpHost,
    smtpPort,
    smtpUser,
    smtpPass,
    emailFrom,
    alchemyPolygonAmoyUrl,
  };
}

export function assertConfig(): EnvConfig {
  const config = getConfig();
  const missing = requiredKeys.filter((key) => {
    switch (key) {
      case 'DATABASE_URL or NEON_DATABASE_URL':
        return !config.databaseUrl;
      case 'JWT_SECRET or NEXTAUTH_SECRET':
        return process.env.NODE_ENV === 'production' && !config.jwtSecret;
      case 'NEXTAUTH_URL':
        return !config.nextAuthUrl;
      case 'SMTP_HOST':
        return !config.smtpHost;
      case 'SMTP_PORT':
        return !config.smtpPort || Number.isNaN(config.smtpPort);
      case 'SMTP_USER':
        return !config.smtpUser;
      case 'SMTP_PASS':
        return !config.smtpPass;
      case 'EMAIL_FROM':
        return !config.emailFrom;
      case 'ALCHEMY_POLYGON_AMOY_URL':
        return !config.alchemyPolygonAmoyUrl;
      default:
        return false;
    }
  });

  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  return config;
}

export const config = assertConfig();

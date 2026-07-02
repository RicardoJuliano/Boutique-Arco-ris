const LOCAL_DEV_ORIGINS = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://[::1]:5173',
];

function normalizeOrigin(value) {
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

function getAllowedOrigins() {
  const origins = new Set();
  const configured = String(process.env.FRONTEND_URL || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  for (const origin of configured) {
    const normalized = normalizeOrigin(origin);
    if (normalized) origins.add(normalized);
  }

  if (process.env.NODE_ENV !== 'production') {
    for (const origin of LOCAL_DEV_ORIGINS) {
      origins.add(origin);
    }
  }

  return origins;
}

function isAllowedOrigin(value) {
  const origin = normalizeOrigin(value);
  return Boolean(origin && getAllowedOrigins().has(origin));
}

module.exports = { getAllowedOrigins, isAllowedOrigin };

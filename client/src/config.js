// API base URL - set REACT_APP_API_URL in production (Vercel env vars)
const API_BASE = process.env.REACT_APP_API_URL || '${API_BASE}';
export default API_BASE;

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://staging.stiles.co.za';

export const API_BASE_URL = rawBaseUrl.replace(/\/$/, '');

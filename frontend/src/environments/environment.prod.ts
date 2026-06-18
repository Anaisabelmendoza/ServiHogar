export const environment = {
  production: true,
  apiUrl: typeof window !== 'undefined' ? window.location.origin : 'http://127.0.0.1:8000'
};

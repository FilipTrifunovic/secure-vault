declare global {
  interface Window {
    __env?: {
      identityServerUrl?: string;
      apiUrl?: string;
      frontendUrl?: string;
    };
  }
}

export const environment = {
  identityServerUrl:
    window.__env?.identityServerUrl ?? 'https://localhost:5001',
  apiUrl: window.__env?.apiUrl ?? 'http://localhost:5000/api',
  frontendUrl: window.__env?.frontendUrl ?? 'http://localhost:4200',
};

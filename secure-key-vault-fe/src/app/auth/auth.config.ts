import { AuthConfig } from 'angular-oauth2-oidc';
import { environment } from '../shared/environment';

export const authConfig: AuthConfig = {
  issuer: environment.identityServerUrl,
  redirectUri: `${environment.frontendUrl}/callback`,
  postLogoutRedirectUri: `${environment.frontendUrl}/login`,
  clientId: 'angular_spa',
  responseType: 'code',
  scope: 'openid profile email vault',
  showDebugInformation: true,
  strictDiscoveryDocumentValidation: false,
  useSilentRefresh: false,
  sessionChecksEnabled: false,
  clearHashAfterLogin: true,
  oidc: true,
  customQueryParams: { prompt: 'login' },
};

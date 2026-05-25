import { computed, Injectable, signal } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { authConfig } from './auth.config';

export interface UserProfile {
  username: string;
  email: string;
  sub: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  isAuthenticated = signal(false);
  userProfile = signal<UserProfile | null>(null);
  username = computed(() => this.userProfile()?.username ?? '');
  userId = computed(() => this.userProfile()?.sub ?? '');

  constructor(private oauthService: OAuthService) {}

  async configureOAuth(): Promise<void> {
    this.oauthService.configure(authConfig);

    try {
      await this.oauthService.loadDiscoveryDocumentAndTryLogin();

      if (this.oauthService.hasValidAccessToken()) {
        this.isAuthenticated.set(true);
        await this.loadUserProfile();
      }
    } catch {
      // Discovery or login failed — user will be redirected by guards
    }
  }

  private async loadUserProfile(): Promise<void> {
    try {
      const profile: any = await this.oauthService.loadUserProfile();
      const info = profile?.info ?? profile;
      this.userProfile.set({
        username: info.preferred_username ?? info.name ?? info.email ?? '',
        email: info.email ?? '',
        sub: info.sub ?? '',
      });
    } catch {
      this.isAuthenticated.set(false);
    }
  }

  signIn(): void {
    this.oauthService.initCodeFlow();
  }

  signOut(): void {
    const idToken = this.oauthService.getIdToken();
    this.isAuthenticated.set(false);
    this.userProfile.set(null);
    this.oauthService.revokeTokenAndLogout({
      id_token_hint: idToken,
      post_logout_redirect_uri: authConfig.postLogoutRedirectUri!,
    });
  }

  get token(): string {
    return this.oauthService.getAccessToken();
  }
}

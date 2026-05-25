import { Component, inject } from '@angular/core';
import { AuthService } from '../auth.service';
import { AnimatedBackground } from '../../shared/components/animated-background/animated-background';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [AnimatedBackground],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private auth = inject(AuthService);

  signIn(): void {
    this.auth.signIn();
  }
}

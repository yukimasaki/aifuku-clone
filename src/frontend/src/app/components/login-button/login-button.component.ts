import { Component } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';

@Component({
  selector: 'app-login-button',
  templateUrl: './login-button.component.html',
  styleUrls: []
})
export class LoginButtonComponent {
  constructor(
    public authService: AuthService,
  ) {}

  loginWithRedirect() {
    this.authService.loginWithRedirect();
  }
}

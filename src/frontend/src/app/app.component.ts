import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor(public router: Router) {}

  title = 'aifuku';

  isNoRequiredLoggedIn() {
    const urls = [
      '/welcome'
    ];
    const currentPath = this.router.url;
    return urls.some(url => url === currentPath);
  }
}

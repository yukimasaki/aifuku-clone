import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HeaderService } from './components/header/header.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  constructor(
    public router: Router,
    private header: HeaderService
  ) {}

  title = 'aifuku';

  isNoRequiredLoggedIn() {
    const urls = [
      '/welcome'
    ];
    const currentPath = this.router.url;
    return urls.some(url => url === currentPath);
  }

  ngOnInit(): void {
    this.header.show();
  }
}

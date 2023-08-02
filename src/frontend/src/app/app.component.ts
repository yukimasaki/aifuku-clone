import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { HeaderService } from '~/components/header/header.service';
import { SidebarService } from '~/components/sidebar/sidebar.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: []
})
export class AppComponent implements OnInit {
  constructor(
    public router: Router,
    private headerService: HeaderService,
    private sidebarService: SidebarService,
  ) {}

  title = 'aifuku';

  ngOnInit(): void {
    this.headerService.show();
    this.sidebarService.show();
  }
}

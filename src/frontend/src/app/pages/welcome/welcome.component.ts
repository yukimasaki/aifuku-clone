import { Component, OnDestroy, OnInit } from '@angular/core';
import { SidebarService } from 'src/app/components/sidebar/sidebar.service';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: []
})
export class WelcomeComponent implements OnInit, OnDestroy {
  constructor(
    private sidebarService: SidebarService
  ) {}

  ngOnInit(): void {
    this.sidebarService.hide();
  }

  ngOnDestroy(): void {
    this.sidebarService.show();
  }
}

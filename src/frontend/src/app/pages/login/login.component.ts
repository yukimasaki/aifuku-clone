import { Component } from '@angular/core';
import { SidebarService } from 'src/app/components/sidebar/sidebar.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: []
})
export class LoginComponent {
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

import { Component } from '@angular/core';
import { HeaderSignedOutService } from 'src/app/components/header-signed-out/header-signed-out.service';
import { HeaderService } from 'src/app/components/header/header.service';
import { SidebarService } from 'src/app/components/sidebar/sidebar.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: []
})
export class LoginComponent {
  constructor(
    private sidebarService: SidebarService,
    private headerService: HeaderService,
    private headerSignedOutService: HeaderSignedOutService,
  ) {}

  ngOnInit(): void {
    this.sidebarService.hide();
    this.headerService.hide();
    this.headerSignedOutService.show();
  }

  ngOnDestroy(): void {
    this.sidebarService.show();
    this.headerService.show();
    this.headerSignedOutService.hide();
  }
}

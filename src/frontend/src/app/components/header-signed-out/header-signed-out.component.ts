import { Component } from '@angular/core';

import { HeaderSignedOutService } from '~/components/header-signed-out/header-signed-out.service';

@Component({
  selector: 'app-header-signed-out',
  templateUrl: './header-signed-out.component.html',
  styleUrls: []
})
export class HeaderSignedOutComponent {
  constructor(
    public headerSignedOutService: HeaderSignedOutService
  ) {}
}

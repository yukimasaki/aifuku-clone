import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { toggleVisibleSidebarAction } from '~/store/sidebar/sidebar.action';
import { HeaderService } from './header.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: []
})
export class HeaderComponent {
  constructor(
    private store: Store,
    public headerService: HeaderService
  ) {}

  // サイドバーの表示状態を更新
  toggleVisibleSidebar() {
    this.store.dispatch(toggleVisibleSidebarAction());
  }

  visibleSidebar = true;

  dropdownOpen = false;
}

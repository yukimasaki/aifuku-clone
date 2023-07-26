import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { toggleVisibleSidebarAction } from 'src/store/sidebar/sidebar.action';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  constructor(
    private store: Store
  ) {}

  // サイドバーの表示状態を更新
  toggleVisibleSidebar() {
    this.store.dispatch(toggleVisibleSidebarAction());
  }

  visibleSidebar = true;

  dropdownOpen = false;

  ngOnInit(): void {}
}

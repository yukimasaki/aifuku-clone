import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { toggleVisibleSidebarAction } from '~/store/sidebar/sidebar.action';
import { selectSidebarAllInfo, selectSidebarVisible } from '~/store/sidebar/sidebar.selector';
import { SidebarService } from './sidebar.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: []
})
export class SidebarComponent implements OnInit {
  constructor(
    private store: Store,
    public sidebarService: SidebarService
  ) {}

  // サイドバーの全情報を取得
  sidebar$ = this.store.select(selectSidebarAllInfo);

  // サイドバーの表示状態を取得
  sidebarVisibleSidebar$ = this.store.select(selectSidebarVisible);

  // サイドバーの表示状態を更新
  toggleVisibleSidebar() {
    this.store.dispatch(toggleVisibleSidebarAction());
  }

  items = items;

  ngOnInit(): void {}
}

export const logoPath = '../../assets/images/sidebar';

export const items = [
  { id: 1, label: 'ホーム', link: '', logo: `${logoPath}/home.svg` },
  { id: 2, label: 'ユーザ管理', link: '/users/page/1', logo: `${logoPath}/user.svg` },
  { id: 3, label: 'お知らせ', link: '', logo: `${logoPath}/information.svg` },
  { id: 4, label: '会議・研修案内', link: '', logo: `${logoPath}/meeting.svg` },
  { id: 5, label: '掲示板', link: '', logo: `${logoPath}/bbs.svg` },
  { id: 6, label: '各種ニュース(R)', link: '', logo: `${logoPath}/news.svg` },
  { id: 7, label: '各種ニュース', link: '', logo: `${logoPath}/news.svg` },
  { id: 8, label: 'アンケート', link: '', logo: `${logoPath}/enquete.svg` },
  { id: 9, label: '議事録・報告', link: '', logo: `${logoPath}/report.svg` },
  { id: 10, label: 'メッセージ', link: '', logo: `${logoPath}/message.svg` },
  { id: 11, label: '各種資料', link: '', logo: `${logoPath}/document.svg` },
  { id: 12, label: '書籍紹介', link: '', logo: `${logoPath}/bookinformation.svg` },
  { id: 13, label: '月間スケジュール', link: '', logo: `${logoPath}/schedule.svg` },
  { id: 14, label: '支援物資要請', link: '', logo: `${logoPath}/rescue.svg` },
  { id: 15, label: '被害状況確認', link: '', logo: `${logoPath}/disaster.svg` },
  { id: 16, label: '各種設定', link: '', logo: `${logoPath}/setting.svg` },
];

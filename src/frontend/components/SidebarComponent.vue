<template>
  <aside
    class="absolute left-0 top-0 z-9999 flex h-screen w-56 flex-col overflow-y-hidden bg-base-200 ease-linear lg:static lg:translate-x-0"
    :class="visibleSidebar ? 'translate-x-0' : '-translate-x-full'"
  >
    <!-- SIDEBAR HEADER -->
    <div class="flex items-center justify-between gap-2 px-6 py-5 lg:py-6">
      <a href="#">
        <img src="../assets/images/sidebar-header.png" alt="Logo">
      </a>
    </div>
    <!-- SIDEBAR HEADER -->

    <!-- SIDEBAR MENU -->
    <div class="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
      <nav class="mt-5 py-4 px-4 lg:mt-9 lg:px-6">
        <ul class="menu">
          <li class="menu-title">メニュー</li>
          <li v-for="item in items" :key="item.id">
            <a :href="item.link">
              <img :src="item.logo" width="24">
              {{ item.label }}
            </a>
          </li>
        </ul>
      </nav>
    </div>
    <!-- SIDEBAR MENU -->
  </aside>
</template>

<script>
import { reactive } from 'vue'

export default {
  setup () {
    const visibleSidebar = useState('visibleSidebar')

    const logoPath = '../assets/images/sidebar'

    const items = reactive([
      { id: 1, label: 'ホーム', link: '', logo: `${logoPath}/home.svg` },
      { id: 2, label: 'ユーザ管理', link: '', logo: `${logoPath}/user.svg` },
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
    ])

    return {
      visibleSidebar, items,
    }
  }
}
</script>
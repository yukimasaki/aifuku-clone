<template>
  <aside
    class="absolute left-0 top-0 z-40 flex h-screen w-56 flex-col overflow-y-hidden duration-300 bg-base-200 ease-linear lg:static lg:translate-x-0"
    :class="visibleSidebar ? 'translate-x-0' : '-translate-x-full'"
  >
    <!-- SIDEBAR HEADER -->
    <div class="flex items-center justify-between gap-2 px-6 py-5 lg:py-6">
      <!-- Logo -->
      <a href="#">
        <img src="../assets/images/sidebar-header.png" alt="Logo">
      </a>

      <!-- Close Btn -->
      <button
      class="btn btn-square lg:hidden"
      @click.stop="toggleSidebar"
      >
        <svg
          class="fill-current"
          width="20"
          height="18"
          viewBox="0 0 20 18"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M19 8.175H2.98748L9.36248 1.6875C9.69998 1.35 9.69998 0.825 9.36248 0.4875C9.02498 0.15 8.49998 0.15 8.16248 0.4875L0.399976 8.3625C0.0624756 8.7 0.0624756 9.225 0.399976 9.5625L8.16248 17.4375C8.31248 17.5875 8.53748 17.7 8.76248 17.7C8.98748 17.7 9.17498 17.625 9.36248 17.475C9.69998 17.1375 9.69998 16.6125 9.36248 16.275L3.02498 9.8625H19C19.45 9.8625 19.825 9.4875 19.825 9.0375C19.825 8.55 19.45 8.175 19 8.175Z"
            fill=""
          />
        </svg>
      </button>
    </div>
    <!-- SIDEBAR HEADER -->

    <!-- SIDEBAR MENU -->
    <div class="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
      <nav class="mt-5 py-4 px-4 lg:mt-9 lg:px-6">
        <ul class="menu mb-6 flex flex-col gap-1">
          <li class="menu-title mb-4 ml-4 text-sm font-medium text-bodydark2">メニュー</li>
          <li v-for="item in items" :key="item.id">
            <a
              class="relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark"
              :href="item.link"
            >
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

    // todo: composable化したい
    const toggleSidebar = () => {
      visibleSidebar.value = !visibleSidebar.value
    }

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
      visibleSidebar, toggleSidebar, items,
    }
  }
}
</script>
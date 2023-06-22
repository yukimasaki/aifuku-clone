<template>
  <aside
    class="absolute left-0 top-0 z-40 flex h-screen w-56 flex-col overflow-y-hidden duration-300 bg-base-200 ease-linear lg:static lg:translate-x-0"
    :class="visibleSidebar ? 'translate-x-0' : '-translate-x-full'"
  >
    <!-- SIDEBAR HEADER -->
    <div class="flex items-center justify-between gap-2 px-6 py-5 lg:py-6">
      <!-- Logo -->
      <a href="#">
        <img src="../assets/images/site-logo.png" alt="Logo">
      </a>

      <!-- Close Btn -->
      <button
      class="btn btn-square lg:hidden"
      @click.stop="toggleSidebar"
      >
        <svg class="fill-current" version="1.1" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
          <path :d="mdiArrowLeftPath"></path>
        </svg>
      </button>
    </div>
    <!-- SIDEBAR HEADER -->

    <!-- SIDEBAR MENU -->
    <div class="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
      <nav class="mt-4 py-1 px-4 lg:mt-5 lg:px-5">
        <ul class="menu mb-6 flex flex-col gap-1">
          <li class="menu-title mb-2 ml-2 text-sm font-medium">メニュー</li>
          <li v-for="item in items" :key="item.id">
            <a
              class="relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium duration-300 ease-in-out"
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

<script setup>
import { mdiArrowLeft } from '@mdi/js'

const visibleSidebar = useState('visibleSidebar')

// todo: composable化したい
const toggleSidebar = () => {
  visibleSidebar.value = !visibleSidebar.value
}

const mdiArrowLeftPath = ref(mdiArrowLeft)

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
</script>

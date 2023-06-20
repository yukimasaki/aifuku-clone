<template>
  <div>
    <!-- ナビバー -->
    <nav class="navbar bg-primary p-2">
      <!-- ハンバーガーボタン -->
      <button @click="toggleSidebar" class="btn btn-square btn-ghost text-white p-2">
        <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
        </svg>
      </button>

      <!-- タイトル -->
      <button class="btn btn-ghost normal-case text-2xl">aifuku</button>
    </nav>

    <!-- サイドバー -->
    <ul :class="{'hidden': !sidebarOpen, 'block': sidebarOpen}" class="absolute left-0 top-0 z-9999 flex h-screen w-72.5 flex-col overflow-y-hidden bg-black duration-300 ease-linear dark:bg-boxdark lg:static lg:translate-x-0">
      <li><a>ホーム</a></li>
      <li><a>ユーザー管理</a></li>
      <li><a>会議・研修案内</a></li>
      <li><a>掲示板</a></li>
      <li><a>各種ニュース(R)</a></li>
      <li><a>各種ニュース</a></li>
      <li><a>アンケート</a></li>
      <li><a>議事録・報告</a></li>
      <li><a>メッセージ</a></li>
      <li><a>各種資料</a></li>
      <li><a>書籍紹介</a></li>
      <li><a>月間スケジュール</a></li>
      <li><a>支援物資要請</a></li>
      <li><a>被害状況確認</a></li>
      <li><a>各種設定</a></li>
    </ul>

    <!-- メインコンテンツ -->
    <div class="ml-64">
      <!-- メインコンテンツのコンテンツ -->
    </div>

    <!-- フッター -->
    <footer class="fotter bg-primary p-2 flex justify-center items-center">
      <!-- フッターのコンテンツ -->
      <div>©Yuki Masaki, 2023</div>
    </footer>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  setup() {
    const sidebarOpen = ref(true) // サイドバーのデフォルトの表示状態

    const toggleSidebar = () => {
      sidebarOpen.value = !sidebarOpen.value
    }

    return {
      sidebarOpen,
      toggleSidebar
    }
  }
}
</script>

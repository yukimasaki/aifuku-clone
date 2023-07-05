<template>
  <div class="overflow-x-auto">
    <div class="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default sm:px-7 xl:pb-1">
      <!-- ページタイトル -->
      <h4 class="mb-6 text-xl font-bold text-black dark:text-white">
        ユーザ管理
      </h4>

      <!-- テーブル -->
      <div class="flex flex-col ">
        <!-- ヘッダー -->
        <div class="grid grid-cols-5 rounded-sm bg-base-100">
          <div
            v-for="header in headers" :key="header.id"
            class="p-2.5 xl:p-5 text-center"
            >
            <h5 class="text-sm font-medium uppercase xsm:text-base-100">{{ header.label }}</h5>
          </div>
        </div>

        <!-- データ -->
        <div
          v-for="user in users" :key="user.id"
          class="grid grid-cols-5 border-b border-stroke"
        >
          <div class="flex items-center justify-center p-2.5 xl:p-5">
            <p class="font-medium text-black">
              <label>
                <input type="checkbox" class="checkbox">
              </label>
            </p>
          </div>
          <div class="flex items-center justify-center p-2.5 xl:p-5">
            <p class="font-medium text-black">{{ user.id }}</p>
          </div>
          <div class="flex items-center justify-center p-2.5 xl:p-5">
            <p class="font-medium text-black">{{ user.email }}</p>
          </div>
          <div class="flex items-center justify-center p-2.5 xl:p-5">
            <p class="font-medium text-black">{{ user.displayName }}</p>
          </div>
          <div class="flex items-center justify-center p-2.5 xl:p-5">
            <p class="font-medium text-black">{{ user.tenantId }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const headers = reactive([
  { id: 1, label: '選択' },
  { id: 2, label: 'ID' },
  { id: 3, label: 'メールアドレス' },
  { id: 4, label: '表示名' },
  { id: 5, label: 'テナントID' },
])

const { data: users } = await useFetch('/api/users')
</script>

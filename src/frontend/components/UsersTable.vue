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

// const users = reactive([
//   { id: '1', email: 'user1@example.com', displayName: 'User1', tenantId: '1' },
//   { id: '2', email: 'user2@example.com', displayName: 'User2', tenantId: '1' },
//   { id: '3', email: 'user3@example.com', displayName: 'User3', tenantId: '1' },
//   { id: '4', email: 'user4@example.com', displayName: 'User4', tenantId: '1' },
//   { id: '5', email: 'user5@example.com', displayName: 'User5', tenantId: '1' },
//   { id: '6', email: 'user6@example.com', displayName: 'User6', tenantId: '1' },
//   { id: '7', email: 'user7@example.com', displayName: 'User7', tenantId: '1' },
//   { id: '8', email: 'user8@example.com', displayName: 'User8', tenantId: '1' },
//   { id: '9', email: 'user9@example.com', displayName: 'User9', tenantId: '1' },
//   { id: '10', email: 'user10@example.com', displayName: 'User10', tenantId: '1' },
// ])

// const { response: users } = await useFetch('/api/login', { method: 'DELETE' })
const { data: users, error, loading, requested } = await useFetch('/api/users')
</script>

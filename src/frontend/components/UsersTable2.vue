<template>
  <div class="container max-w-full overflow-x-auto whitespace-nowrap">
    <table class="table table-lg bg-white rounded-sm text-lg">
      <thead>
        <tr>
          <th v-for="testHeader in testHeaders" :key="testHeader.id">
            {{ testHeader.label }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="testUser in testUsers" :key="testUser.id">
          <td class="w-12">
            <label>
              <input type="checkbox" class="checkbox">
            </label>
          </td>
          <td class="w-12">{{ testUser.id }}</td>
          <td>{{ testUser.email }}</td>
          <td>{{ testUser.displayName }}</td>
          <td class="w-12">{{ testUser.tenantId }}</td>
          <td class="w-12"><nuxt-link to="#">Edit</nuxt-link></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
const testHeaders = reactive([
  { id: 1, label: '選択' },
  { id: 2, label: 'ID' },
  { id: 3, label: 'メールアドレス' },
  { id: 4, label: '表示名' },
  { id: 5, label: 'テナントID' },
  { id: 6, label: '編集' },
])

const { data: testUsers } = await useFetch('/api/users')
</script>

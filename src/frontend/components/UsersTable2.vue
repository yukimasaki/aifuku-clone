<template>
  <div class="container max-w-full overflow-x-auto whitespace-nowrap">
    <table class="table bg-white rounded-sm">
      <thead>
        <tr>
          <th v-for="testHeader in testHeaders" :key="testHeader.id">
            {{ testHeader.label }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="testUser in testUsers" :key="testUser.id">
          <td>
            <label>
              <input type="checkbox">
            </label>
          </td>
          <td>{{ testUser.id }}</td>
          <td>{{ testUser.email }}</td>
          <td>{{ testUser.displayName }}</td>
          <td>{{ testUser.tenantId }}</td>
          <td><nuxt-link to="#">Edit</nuxt-link></td>
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

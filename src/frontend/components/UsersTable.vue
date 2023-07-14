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
        <tr v-for="user in users.items" :key="user.id">
          <td class="w-12">
            <label>
              <input type="checkbox" class="checkbox">
            </label>
          </td>
          <td class="w-12">{{ user.id }}</td>
          <td>{{ user.email }}</td>
          <td>{{ user.displayName }}</td>
          <td class="w-12">{{ user.tenantId }}</td>
          <td class="w-12"><nuxt-link to="#">Edit</nuxt-link></td>
        </tr>
      </tbody>
    </table>

    <div class="join">
      <nuxt-link
        v-for="link in users.links" :key="link.id"
        :to="link.url"
      >
        <button class="join-item btn">
          {{ link.label }}
        </button>
      </nuxt-link>
    </div>
  </div>
</template>

<script setup >
const props = defineProps({
  parentProp: String,
})
const page = ref(props.parentProp)

const testHeaders = reactive([
  { id: 1, label: '選択' },
  { id: 2, label: 'ID' },
  { id: 3, label: 'メールアドレス' },
  { id: 4, label: '表示名' },
  { id: 5, label: 'テナントID' },
  { id: 6, label: '編集' },
])

const { data: users } = await useFetch(`/api/users`, {
  params: {
    page,
    perPage: 10,
  },
})
</script>

<template>
  <!-- Main Content Start-->
  <main class="h-full bg-base-200 p-4 md:p-6 2xl:p-10">
    <!-- Table Start-->
    <div class="flex flex-col gap-10">
      <UsersTable :parentProp="$route.params.page" />
    </div>
    <!-- Table End-->
  </main>
  <!-- Main Content End-->
</template>

<script setup>
import UsersTable from '~/components/UsersTable.vue'

definePageMeta({
  // middleware: 'required-auth'
})

</script>

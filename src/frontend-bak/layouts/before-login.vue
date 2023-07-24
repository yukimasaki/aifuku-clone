<template>
  <div class="flex h-screen overflow-hidden">
    <div class="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
      <HeaderBeforeLogin />
      <NuxtPage />
    </div>
  </div>
  <slot />
</template>

<script setip>
import HeaderBeforeLogin from '~/components/HeaderBeforeLogin.vue'
</script>

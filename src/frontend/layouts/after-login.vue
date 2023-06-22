<template>
  <div class="flex h-screen overflow-hidden">
    <SidebarAfterLogin />
    <div class="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
      <HeaderAfterLogin />
      <NuxtPage />
    </div>
    <slot />
  </div>
</template>

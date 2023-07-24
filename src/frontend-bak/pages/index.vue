<template>
  <div class="h-full bg-base-200">
    <h2><nuxt-link :to="'/login'">Loginページ</nuxt-link></h2>
  </div>
</template>

<script setup>
definePageMeta({
  // middleware: 'required-auth'
})
</script>

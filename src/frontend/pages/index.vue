<template>
  <div class="h-full bg-base-200">
    This is index page.
  </div>
</template>

<script setup>
definePageMeta({
  middleware: 'get-current-user',
})
</script>

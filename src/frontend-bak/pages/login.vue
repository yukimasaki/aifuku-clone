<template>
  <div class="h-full bg-base-200 flex justify-center">
    <div class="grid content-center pb-96">
      <div class="card bg-base-100 w-96 drop-shadow">
        <div class="card-body">
          <h2 class="card-title pb-4">ログイン</h2>
          <input
            v-model="email"
            type="text"
            placeholder="メールアドレス"
            class="input input-bordered w-full max-w-xs focus:outline-none focus:ring-4 focus:border-transparent focus:ring-daisy-primary"
          />
          <input
            v-model="password"
            type="password"
            placeholder="パスワード"
            class="input input-bordered w-full max-w-xs focus:outline-none focus:ring-4 focus:border-transparent focus:ring-daisy-primary"
          />
          <div class="card-actions justify-end pt-4">
            <button class="btn btn-primary text-base-100 drop-shadow" @click="login(email, password)">ログイン</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuth } from '../composables/useAuth'

definePageMeta({
  // middleware: 'no-required-auth',
  layout: 'before-login'
})

const email = ''
const password = ''

const { login } = useAuth()
</script>

import { initializeApp } from 'firebase/app'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  initializeApp(config.public.firebase)
  console.log(`after initialize at plugins`)
})

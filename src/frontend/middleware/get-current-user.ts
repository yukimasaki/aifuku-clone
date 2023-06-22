import { useAuth } from '~/composables/useAuth'

export default defineNuxtRouteMiddleware(async (to, from) => {
  const currentUser = await useAuth()
  if (currentUser === null) {
    return navigateTo('/login')
  }
})

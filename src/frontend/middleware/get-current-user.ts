import { getAuth, onAuthStateChanged } from 'firebase/auth'

export default defineNuxtRouteMiddleware(async () => {
  // 下記は正常に動作した
  // const loggedIn = false
  // if (!loggedIn) {
  //   return navigateTo('/login')
  // }

  // 下記は正常に動作しない
  // const { checkAuthState } = useAuth()
  // const currentUser = await checkAuthState()
  // if (currentUser === null) {
  //   return navigateTo('/login', { replace: true })
  // }

  console.log(`middleware`)
  const auth = await getAuth()
  // await onAuthStateChanged(auth, (user) => {
  //   if (user === null) {
  //     return navigateTo('/login', { replace: true })
  //   }
  // })
})

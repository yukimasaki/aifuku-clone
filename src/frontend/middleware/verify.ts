export default defineNuxtRouteMiddleware(async () => {
  const url = 'http://nuxt-container.local:3000/verify'

  await fetch(
    url,
    { method: 'POST' }
  )
  .then(response => {
    return response.json()
  })
  .then(data => {
    console.log(data)
  })
  .catch(error => {
    console.log(error)
  })
})

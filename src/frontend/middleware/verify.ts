export default defineNuxtRouteMiddleware(async () => {
  const url = 'http://192.168.93.150:3000/verify'

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

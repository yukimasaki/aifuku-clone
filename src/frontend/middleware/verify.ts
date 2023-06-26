export default defineNuxtRouteMiddleware(async () => {
  const url = 'http://express-container:3000/verify'

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

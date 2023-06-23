import express from 'express'
const router = express.Router()

// POST /verify
router.post('/', async (req, res) => {
  const firebaseApiKey = 'AIzaSyDIraHkuFWYdItWEydce1dbaAwBsRNNMeA'
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${firebaseApiKey}`
  const idToken = req.cookies.token
  const body = JSON.stringify({ idToken })

  await fetch(
    url,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    }
  )
  .then(response => {
    return response.json()
  })
  .then(data => {
    res.status(200).json({ message: 'ok', uid: data.users[0].localId })
  })
  .catch(error => {
    res.status(400).json({ message: 'ng', error })
  })
})

export default router

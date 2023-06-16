import express from 'express'

const router = express.Router()
router.get('/', (req, res) => {
  res
    .status(200)
    .send({ message: 'Hello world!!' })
})

router.get('/test', (req, res) => {
  res
    .status(200)
    .send({ message: 'test!!' })
})

export default router
import express from 'express'
import cors from 'cors'

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const port = 3000

app.get('/helloWorld', (req, res) => {
  res.status(200).send({ message: 'hello, world' })
})

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/`)
})
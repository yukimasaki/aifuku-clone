import express from 'express'
import cors from 'cors'

import indexRouter from './routes'

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const port = 3001

app.use('/', indexRouter)

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/`)
})

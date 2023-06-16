import express from 'express'
import cors from 'cors'

import indexRouter from './routes'
import helloworldRouter from './routes/helloworld'
import userRouter from './routes/users'

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const port = 3000

app.use('/', indexRouter)
app.use('/helloworld', helloworldRouter)
app.use('/users', userRouter)

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/`)
})
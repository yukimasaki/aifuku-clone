import express from 'express'
import messageController from './controllers/message'

const app: express.Express = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use("/messages", messageController)

app.listen(3000,()=>{
    console.log('ポート3000番で起動しました。')
})

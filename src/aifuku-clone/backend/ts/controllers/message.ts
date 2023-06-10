import express, { Router } from 'express'

const router: Router = express.Router();

router.get('/', function(req, res) {
    res.send({text:"こんにちは！ビルドしました！"});
});

export default router;

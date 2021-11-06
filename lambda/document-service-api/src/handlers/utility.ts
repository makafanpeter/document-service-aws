import {Request, Response, Router}  from 'express';
import requestResponseLogger from '../middlewares/request-response-logger';
import * as bodyParser from 'body-parser';

const router = Router();
router.use(bodyParser.json());
router.use(requestResponseLogger);


router.post('/detectFace', (req: Request, res: Response) => {
    res.send();
});


router.post('/compareFace', (req: Request, res: Response) => {
    res.send();
});


export default router;
import {Request, Response, Router}  from 'express';
import requestResponseLogger from '../middlewares/request-response-logger';
import * as bodyParser from 'body-parser';

const router = Router();
router.use(bodyParser.json());
router.use(requestResponseLogger);


router.post('/', (req: Request, res: Response) => {
     res.send();
});


router.get('/:id/download', (req: Request, res: Response) => {
    res.send();
});

router.get('/:id', (req: Request, res: Response) => {
    res.send();
});

router.delete('/:id', (req: Request, res: Response) => {

});



export default router;
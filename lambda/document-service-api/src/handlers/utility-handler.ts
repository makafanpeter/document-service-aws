import {Request, Response, Router}  from 'express';
import requestResponseLogger from '../middlewares/request-response-logger';
import * as bodyParser from 'body-parser';

class UtilityHandler {

    public router = Router();
    public path = "/api/document-service/v1/utilities";

    constructor() {
        this.router.use(bodyParser.json());
        this.router.use(requestResponseLogger);
        this.initRoutes();
    }

    private initRoutes() {
        this.router.post('/compareFace', this.compareFace);
        this.router.post('/detectFace', this.detectFace);
    }

    compareFace = (req: Request, res: Response) => {
        res.send();
    }


    detectFace = (req: Request, res: Response) => {
        res.send();
    }
}

export default UtilityHandler;
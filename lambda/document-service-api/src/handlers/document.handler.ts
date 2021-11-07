import {Request, Response, Router} from 'express';
import requestResponseLogger from '../middlewares/request-response-logger';
import * as bodyParser from 'body-parser';

class DocumentHandler {

    public router = Router();
    public path = "/api/document-service/v1/documents";

    constructor() {
        this.router.use(bodyParser.json());
        this.router.use(requestResponseLogger);
        this.initRoutes();
    }

    private initRoutes() {
        this.router.post('/', this.uploadDocument);
        this.router.get('/:id/download', this.downloadDocument);
        this.router.get('/:id', this.getDocument);
        this.router.delete('/:id', this.deleteDocument);

    }

    uploadDocument = (req: Request, res: Response) => {
        res.send();
    }

    downloadDocument = (req: Request, res: Response) => {
        res.send();
    }

    deleteDocument = (req: Request, res: Response) => {
        res.send();
    }

    getDocument = (req: Request, res: Response) => {
        res.send();
    }

}

export default DocumentHandler;
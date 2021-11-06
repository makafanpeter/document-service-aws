import {Request, Response, Router}  from 'express';
import document from "./document";
import utility from "./utility";

const router = Router();
router.use('/api/document-service/v1/documents', document);
router.use('/api/document-service/v1/utilities', utility);

router.get('/', (req: Request, res: Response) => {
    res.send('Document Service API!');
});
export default router;
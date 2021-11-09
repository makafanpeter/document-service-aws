import {Request, Response, Router} from 'express';
import requestResponseLogger from '../middlewares/request-response-logger';
import * as bodyParser from 'body-parser';
import RequestValidator from "../utilities/request-validator";
import {validationResult} from 'express-validator';
import BadRequest from '../models/errors/bad-request'
import multer, {Multer, StorageEngine} from "multer";
import DocumentManagerService from "../services/document-manager-service";
import UploadDocument from "../models/file-entry";
import {v4} from 'uuid';
import * as crypto from "crypto";
import Helpers from "../utilities/helpers";
import DomainError from "../models/errors/domain-error";
import {rejects} from "assert";

class DocumentHandler {

    public router = Router();
    public path = "/api/document-service/v1/documents";
    private readonly storage: StorageEngine;
    private upload: Multer;
    private documentService!: DocumentManagerService;
    private algorithm: string = "aes-256-ctr";

    constructor() {
        this.router.use(bodyParser.json());
        this.router.use(requestResponseLogger);
        this.storage = multer.memoryStorage();
        this.upload = multer({storage: this.storage})
        this.documentService = new DocumentManagerService();
        this.initRoutes();
    }

    private initRoutes() {
        this.router.post('/', this.upload.single('document'), RequestValidator.validateUploadDocument(), this.uploadDocument);
        this.router.get('/:id/download', this.downloadDocument);
        this.router.get('/:id', this.getDocument);
        this.router.delete('/:id', this.deleteDocument);

    }

    uploadDocument =  (req: Request, res: Response) => {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            throw new BadRequest(result.array());
        }
        let id = v4();
        const file = req.file as Express.Multer.File;
        let buffer = file.buffer
        let fileEntry = new UploadDocument();
        fileEntry.id = id
        fileEntry.bucketName = req.body.bucket;
        fileEntry.contentType = file.mimetype;
        fileEntry.fileName = file.originalname;
        fileEntry.fileExtension = Helpers.getFileExtension(file.originalname);


        let encrypt = Boolean(req.body.encrypt);

        if (encrypt) {
            const key = crypto.randomBytes(32);
            const iv = crypto.randomBytes(16);
            const cipher = crypto.createCipheriv(this.algorithm, Buffer.from(key), iv);
            buffer = Buffer.concat([cipher.update(buffer), cipher.final()]);
            fileEntry.encryptionKey = iv.toString('hex');
            fileEntry.encrypted = encrypt;
        }

        this.documentService.create(fileEntry, buffer).then(value => {
            res.status(200).json(fileEntry);
        }).catch(reason => {

        });

       res.status(500);

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
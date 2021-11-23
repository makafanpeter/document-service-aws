import {NextFunction, Request, Response, Router} from 'express';
import requestResponseLogger from '../middlewares/request-response-logger';
import * as bodyParser from 'body-parser';
import RequestValidator from "../utilities/request-validator";
import {validationResult} from 'express-validator';
import multer, {Multer, StorageEngine} from "multer";
import DocumentManagerService from "../services/document-manager-service";
import DocumentUpload from "../models/file-entry";
import {v4} from 'uuid';
import * as crypto from "crypto";
import Helpers from "../utilities/helpers";
import {DatabaseManagerService} from "../services/database-manager-service";
import {BadRequestError, BadInputError} from '../models/errors/domain-error';
import asyncWrapper from "../middlewares/async-wrapper";

class DocumentHandler {

    public router = Router();
    public path = "/api/document-service/v1/documents";
    private readonly storage: StorageEngine;
    private upload: Multer;
    private documentService!: DocumentManagerService;
    private algorithm: string = "aes-256-ctr";
    private dbService: DatabaseManagerService<DocumentUpload>;

    constructor() {
        this.router.use(bodyParser.json());
        this.router.use(requestResponseLogger);
        this.storage = multer.memoryStorage();
        this.upload = multer({storage: this.storage})
        this.documentService = new DocumentManagerService();
        let tableName = process.env.DOCUMENTS_TABLE as string;
        this.dbService = new DatabaseManagerService<DocumentUpload>(tableName);
        this.initRoutes();
    }

    private initRoutes() {
        this.router.post('/', this.upload.single('document'), RequestValidator.validateUploadDocument(), this.uploadDocument);
        this.router.get('/:id/download', this.downloadDocument);
        this.router.get('/:id', this.getDocument);
        this.router.delete('/:id', this.deleteDocument);

    }

    uploadDocument =  asyncWrapper(async (req: Request, res: Response, next: NextFunction) => {
        const validationResults = validationResult(req);
        if (!validationResults.isEmpty()) {
            let error = new BadInputError(validationResults.array());
            return next(error);
        }

        const file = req.file as Express.Multer.File;
        let buffer = Buffer.from(file.buffer.toString("base64"), "base64");

        if (!buffer){
            let error = new BadRequestError("No File Uploaded");
            return next(error);
        }
        let fileEntry = new DocumentUpload();
        fileEntry.id = v4()
        fileEntry.contentType = file.mimetype;
        fileEntry.fileName = file.originalname;
        fileEntry.bucketName = req.body.bucket;
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

        await this.documentService.create(fileEntry, buffer);

        await this.dbService.create(fileEntry);

        delete fileEntry.encryptionKey;
        res.status(200).json(fileEntry);
    });

    downloadDocument = asyncWrapper(async (req: Request, res: Response) => {
        const {id} = req.params;
        let file = await this.dbService.getById(id);

        let buffer = await this.documentService.get(file as DocumentUpload);

        file = file as DocumentUpload;
        let fileContents = buffer as Buffer;

        if (file.encrypted) {
            const key = crypto.randomBytes(32);
            const iv = Buffer.from(file.encryptionKey, 'hex');
            let decipher = crypto.createDecipheriv(this.algorithm, Buffer.from(key), iv);
            fileContents = Buffer.concat([decipher.update(fileContents), decipher.final()]);
        }
        res.attachment(file.fileName);
        res.contentType(file.contentType);
        res.send(fileContents);
    });

    deleteDocument = asyncWrapper(async (req: Request, res: Response) => {

        let {id} = req.params;

        let file = await this.dbService.getById(id);

        await this.documentService.delete(file as DocumentUpload);

        await this.dbService.delete(id);

        res.status(201).json();
    });

    getDocument = asyncWrapper(async (req: Request, res: Response) => {
        const {id} = req.params;
        let file = await this.dbService.getById(id);
        delete file.encryptionKey;
        res.status(200).json(file);
    });
}

export default DocumentHandler;
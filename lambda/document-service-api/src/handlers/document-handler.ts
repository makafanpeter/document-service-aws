import {Request, Response, Router} from 'express';
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
import {BadRequest, NotFound} from '../models/errors/domain-error';

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

    uploadDocument = async (req: Request, res: Response) => {
        const validationResults = validationResult(req);
        if (!validationResults.isEmpty()) {
            let error = new BadRequest(validationResults.array());
            res.status(400).json(error);
        }
        let id = v4();
        const file = req.file as Express.Multer.File;
        let buffer = file.buffer
        let fileEntry = new DocumentUpload();
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

        await this.documentService.create(fileEntry, buffer).catch(error => {
            if (error instanceof NotFound) {
                res.status(404).json(error);
            }
            res.status(500).json(error);
        });

        this.dbService.create(fileEntry).catch(error => {
            if (error instanceof NotFound) {
                res.status(404).json(error);
            }
            res.status(500).json(error);
        })
        res.status(200).json(fileEntry);
    }

    downloadDocument = async (req: Request, res: Response) => {
        let id = req.params.id;
        let file = await this.dbService.getById(id).catch(error => {
            if (error instanceof NotFound) {
                res.status(404).json(error);
            }
            res.status(500).json(error);
        });

        let buffer = await this.documentService.get(file as DocumentUpload).catch(error => {
            if (error instanceof NotFound) {
                res.status(404).json(error);
            }
            res.status(500).json(error);
        });

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
    }

    deleteDocument = async (req: Request, res: Response) => {

        let id = req.params.id;
        let file = await this.dbService.getById(id).catch(error => {
            if (error instanceof NotFound) {
                res.status(404).json(error);
            }
            res.status(500).json(error);
        });

        await this.documentService.delete(file as DocumentUpload).catch(error => {
            if (error instanceof NotFound) {
                res.status(404).json(error);
            }
            res.status(500).json(error);
        });

        await this.dbService.delete(id).catch(error => {
            if (error instanceof NotFound) {
                res.status(404).json(error);
            }
            res.status(500).json(error);
        });
        res.status(201).json();
    }

    getDocument = async (req: Request, res: Response) => {
        let id = req.params.id;
        let file = await this.dbService.getById(id).catch(error => {
            if (error instanceof NotFound) {
                res.status(404).json(error);
            }
            res.status(500).json(error);
        });
        res.status(200).json(file);
    }

}

export default DocumentHandler;
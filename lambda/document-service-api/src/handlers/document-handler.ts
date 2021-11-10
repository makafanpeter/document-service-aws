import {Request, Response, Router} from 'express';
import requestResponseLogger from '../middlewares/request-response-logger';
import * as bodyParser from 'body-parser';
import RequestValidator from "../utilities/request-validator";
import {validationResult} from 'express-validator';
import BadRequest from '../models/errors/bad-request'
import multer, {Multer, StorageEngine} from "multer";
import DocumentManagerService from "../services/document-manager-service";
import DocumentUpload from "../models/file-entry";
import {v4} from 'uuid';
import * as crypto from "crypto";
import Helpers from "../utilities/helpers";
import {DatabaseManagerService} from "../services/database-manager-service";
import * as stream from "stream";

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
        let tableName =  process.env.DOCUMENTS_TABLE as string;
        this.dbService = new DatabaseManagerService<DocumentUpload>(tableName);
        this.initRoutes();
    }

    private initRoutes() {
        this.router.post('/', this.upload.single('document'), RequestValidator.validateUploadDocument(), this.uploadDocument);
        this.router.get('/:id/download', this.downloadDocument);
        this.router.get('/:id', this.getDocument);
        this.router.delete('/:id', this.deleteDocument);

    }

    uploadDocument = async  (req: Request, res: Response) => {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            throw new BadRequest(result.array());
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

        await this.documentService.create(fileEntry, buffer).then(value => {

        }).catch(reason => {

        });

        this.dbService.create(fileEntry).then(_ => {
            res.status(200).json(fileEntry);
        })

       res.status(500);

    }

    downloadDocument = async (req: Request, res: Response) => {
        let id = req.params.id;
        let file = await this.dbService.getById(id).catch(reason => {
            res.status(404).json(reason);
        });

        let buffer =  await this.documentService.get(file as DocumentUpload).catch(reason => {
            res.status(500).json(reason);
        });

        file = file as DocumentUpload;
        let fileContents = buffer as Buffer;

        if (file.encrypted)
        {
            const key = crypto.randomBytes(32);
            const iv =Buffer.from(file.encryptionKey, 'hex');
            let decipher = crypto.createDecipheriv(this.algorithm, key, iv);
            fileContents = Buffer.concat([decipher.update(fileContents) , decipher.final()]);
        }

        const readStream = new stream.PassThrough();
        readStream.end(fileContents);

        res.set('Content-disposition', 'attachment; filename=' + file.fileName);
        res.set('Content-Type', file.contentType);

        readStream.pipe(res);
    }

    deleteDocument = async (req: Request, res: Response) => {

        let id = req.params.id;
        let file = await this.dbService.getById(id).catch(reason => {
            res.status(404).json(reason);
        });

        await this.documentService.delete(file as DocumentUpload).catch(reason => {
            res.status(500).json(reason);
        });

        await this.dbService.delete(id).catch(reason => {
            res.status(404).json(reason);
        });
        res.status(200).json(file);
    }

    getDocument = async (req: Request, res: Response) => {
        let id = req.params.id;
        let file = await this.dbService.getById(id).catch(reason => {
            res.status(404).json(reason);
        });
        res.status(200).json(file);
    }

}

export default DocumentHandler;
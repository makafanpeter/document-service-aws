import {Request, Response, Router}  from 'express';
import requestResponseLogger from '../middlewares/request-response-logger';
import * as bodyParser from 'body-parser';
import {BadRequest, NotFound} from "../models/errors/domain-error";
import DocumentUpload from "../models/file-entry";
import {DatabaseManagerService} from "../services/database-manager-service";
import DocumentManagerService from "../services/document-manager-service";
import {validationResult} from "express-validator";
import RequestValidator from "../utilities/request-validator";
import ImageProcessingService from "../services/image-processing-service";
import {FaceCriteria} from "../models/face-criteria";
import crypto from "crypto";

class UtilityHandler {

    public router = Router();
    public path = "/api/document-service/v1/utilities";
    private dbService: DatabaseManagerService<DocumentUpload>;
    private documentService!: DocumentManagerService;
    private  imageProcessingService!: ImageProcessingService;
    private algorithm: string = "aes-256-ctr";

    constructor() {
        this.router.use(bodyParser.json());
        this.router.use(requestResponseLogger);
        let tableName = process.env.DOCUMENTS_TABLE as string;
        this.dbService = new DatabaseManagerService<DocumentUpload>(tableName);
        this.documentService = new DocumentManagerService();
        this.imageProcessingService = new ImageProcessingService();
        this.initRoutes();
    }

    private initRoutes() {
        this.router.post('/compareFace',RequestValidator.validateCompareFace(), this.compareFace);
        this.router.post('/detectFace', RequestValidator.validateDetectFace() ,this.detectFace);
    }

    compareFace = async (req: Request, res: Response) => {
        const validationResults = validationResult(req);
        if (!validationResults.isEmpty()) {
            let error = new BadRequest(validationResults.array());
            res.status(400).json(error);
        }

        let sourceImageId: string = req.body.sourceImageId;
        let targetImageId: string = req.body.targetImageId;


        let sourceDocument = await this.dbService.getById(sourceImageId).catch(error => {
            if (error instanceof NotFound) {
                res.status(404).json(error);
            }
            res.status(500).json(error);
        });

        let sourceBuffer = await this.documentService.get(sourceDocument as DocumentUpload).catch(error => {
            if (error instanceof NotFound) {
                res.status(404).json(error);
            }
            res.status(500).json(error);
        });

        sourceDocument = sourceDocument as DocumentUpload;
        sourceBuffer = sourceBuffer as Buffer;
        if (sourceDocument.encrypted) {
            const key = crypto.randomBytes(32);
            const iv = Buffer.from(sourceDocument.encryptionKey, 'hex');
            let decipher = crypto.createDecipheriv(this.algorithm, Buffer.from(key), iv);
            sourceBuffer = Buffer.concat([decipher.update(sourceBuffer), decipher.final()]);
        }

        let targetDocument = await this.dbService.getById(targetImageId).catch(error => {
            if (error instanceof NotFound) {
                res.status(404).json(error);
            }
            res.status(500).json(error);
        });
        let targetBuffer = await this.documentService.get(targetDocument as DocumentUpload).catch(error => {
            if (error instanceof NotFound) {
                res.status(404).json(error);
            }
            res.status(500).json(error);
        });
        targetDocument = targetDocument as DocumentUpload;
        targetBuffer = targetBuffer as Buffer;
        if (targetDocument.encrypted) {
            const key = crypto.randomBytes(32);
            const iv = Buffer.from(targetDocument.encryptionKey, 'hex');
            let decipher = crypto.createDecipheriv(this.algorithm, Buffer.from(key), iv);
            targetBuffer = Buffer.concat([decipher.update(targetBuffer), decipher.final()]);
        }

        let result = await this.imageProcessingService.compareFace(sourceBuffer, targetBuffer).catch(error => {
            if (error instanceof NotFound) {
                res.status(404).json(error);
            }
            res.status(500).json(error);
        });
        res.status(200).json(result);

    }


    detectFace = async (req: Request, res: Response) => {
        const validationResults = validationResult(req);
        if (!validationResults.isEmpty()) {
            let error = new BadRequest(validationResults.array());
            res.status(400).json(error);
        }
        let  id: string = req.body.id;
        let criteria: FaceCriteria = {
            eyeGlasses: req.body.eyeGlasses,
            eyesOpen: req.body.eyesOpen,
            mouthOpen: req.body.mouthOpen,
            sunGlasses: req.body.sunGlasses
        };

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

        let result = await this.imageProcessingService.detectFace(fileContents,criteria).catch(error => {
            if (error instanceof NotFound) {
                res.status(404).json(error);
            }
            res.status(500).json(error);
        });
        res.status(200).json(result);
    }
}

export default UtilityHandler;
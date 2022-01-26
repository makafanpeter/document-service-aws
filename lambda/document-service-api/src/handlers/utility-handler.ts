import {Request, Response, Router} from 'express';
import requestResponseLogger from '../middlewares/request-response-logger';
import * as bodyParser from 'body-parser';
import DocumentUpload from "../models/file-entry";
import {DatabaseManagerService} from "../services/database-manager-service";
import DocumentManagerService from "../services/document-manager-service";
import RequestValidator from "../utilities/request-validator";
import ImageProcessingService from "../services/image-processing-service";
import {FaceCriteria} from "../models/face-criteria";
import * as crypto from "crypto";
import asyncWrapper from "../middlewares/async-wrapper";
import EventBridgeService from "../services/event-bridge-service";
import ResizeImage, {Events} from "../models/event";
import Helpers from "../utilities/helpers";


class UtilityHandler {

    public router = Router();
    public path = "/api/document-service/v1/utilities";
    private dbService: DatabaseManagerService<DocumentUpload>;
    private documentService!: DocumentManagerService;
    private  imageProcessingService!: ImageProcessingService;
    private algorithm: string = "aes-256-ctr";
    private  eventsPublisher!: EventBridgeService;

    constructor() {
        this.router.use(bodyParser.json());
        this.router.use(requestResponseLogger);
        let tableName = process.env.DOCUMENTS_TABLE as string;
        this.dbService = new DatabaseManagerService<DocumentUpload>(tableName);
        this.documentService = new DocumentManagerService();
        this.imageProcessingService = new ImageProcessingService();
        let eventBusName = process.env.EVENT_BUS_NAME as string;
        this.eventsPublisher = new EventBridgeService(eventBusName);
        this.initRoutes();
    }

    private initRoutes() {
        this.router.post('/compareFace',RequestValidator.validateCompareFace, this.compareFace);
        this.router.post('/detectFace', RequestValidator.validateDetectFace ,this.detectFace);
        this.router.post('/resize', RequestValidator.validateImageResize ,this.resize);
    }

    compareFace =  asyncWrapper( async (req: Request, res: Response) => {

        const { sourceImageId, targetImageId } = req.body;

        let sourceDocument = await this.dbService.getById(sourceImageId);

        let sourceBuffer = await this.documentService.get(sourceDocument as DocumentUpload);

        const sourceEncryptionKey = String(sourceDocument.encryptionKey);


        sourceDocument = sourceDocument as DocumentUpload;
        sourceBuffer = sourceBuffer as Buffer;
        if (sourceDocument.encrypted) {
            const key = crypto.randomBytes(32);
            const iv = Buffer.from(sourceEncryptionKey, 'hex');
            let decipher = crypto.createDecipheriv(this.algorithm, Buffer.from(key), iv);
            sourceBuffer = Buffer.concat([decipher.update(sourceBuffer), decipher.final()]);
        }

        let targetDocument = await this.dbService.getById(targetImageId);
        let targetBuffer = await this.documentService.get(targetDocument as DocumentUpload);
        targetDocument = targetDocument as DocumentUpload;
        targetBuffer = targetBuffer as Buffer;

        const targetEncryptionKey = String(targetDocument.encryptionKey);


        if (targetDocument.encrypted) {
            const key = crypto.randomBytes(32);
            const iv = Buffer.from(targetEncryptionKey, 'hex');
            let decipher = crypto.createDecipheriv(this.algorithm, Buffer.from(key), iv);
            targetBuffer = Buffer.concat([decipher.update(targetBuffer), decipher.final()]);
        }

        let result = await this.imageProcessingService.compareFace(sourceBuffer, targetBuffer);

        res.status(200).json(result);
    });


    detectFace = asyncWrapper(async (req: Request, res: Response) => {
        const {id} = req.body;

        let criteria: FaceCriteria = {
            eyeGlasses: Boolean(req.body.eyeGlasses),
            eyesOpen: Boolean(req.body.eyesOpen),
            mouthOpen: Boolean(req.body.mouthOpen),
            sunGlasses: Boolean(req.body.sunGlasses)
        };

        let file = await this.dbService.getById(id);

        let buffer = await this.documentService.get(file as DocumentUpload);


        file = file as DocumentUpload;
        let fileContents = buffer as Buffer;

        const encryptionKey = String(file.encryptionKey);

        if (file.encrypted) {
            const key = crypto.randomBytes(32);
            const iv = Buffer.from(encryptionKey, 'hex');
            let decipher = crypto.createDecipheriv(this.algorithm, Buffer.from(key), iv);
            fileContents = Buffer.concat([decipher.update(fileContents), decipher.final()]);
        }

        let result = await this.imageProcessingService.detectFace(fileContents,criteria);

        res.status(200).json(result);
    });



    resize = asyncWrapper(async (req: Request, res: Response) => {
        const {id, width, height} = req.body;

        let file = await this.dbService.getById(id);

        let event:ResizeImage = {
            id : file.id,
            width,
            height
        }
        await this.eventsPublisher.publish(event, Events.ResizeImage, Helpers.EVENT_SOURCE)
        res.status(201);
    });
}

export default UtilityHandler;
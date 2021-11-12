import {S3} from 'aws-sdk'
import FileEntry from '../models/file-entry'
import {GetObjectOutput, PutObjectRequest} from "aws-sdk/clients/s3";
import {ManagedUpload} from "aws-sdk/lib/s3/managed_upload";
import {DomainError} from "../models/errors/domain-error";
import SendData = ManagedUpload.SendData;
import log from "../utilities/log";

class DocumentManagerService {

    private s3!: S3;
    private readonly bucketName: string;
    private readonly region!: string;

    constructor() {
        this.bucketName = process.env.DEFAULT_BUCKET as  string;
        this.region = process.env.REGION as  string;
        this.initializeAWS();
    }

    private initializeAWS() {
        this.s3 = new S3({
            region: this.region
        });
    }

    /**
     *
     * @param file
     * @param buffer
     */
    create = async (file: FileEntry, buffer: Buffer): Promise<void> => {
        const bucketName = !file.bucketName ? this.bucketName : file.bucketName;
        const params: PutObjectRequest = {
            Bucket: bucketName,
            Key: file.id,
            ContentType: file.contentType,
            Body: buffer,
            Metadata: {
                "x-amz-meta-ContentType": file.contentType || "",
                "x-amz-meta-FileExtension": file.fileExtension || "",
                "x-amz-meta-FileName": file.fileName || "",
                "x-amz-meta-Encrypted": file.encrypted?.toString() || "",
                "x-amz-meta-Description": file.description || "",
                "x-amz-meta-Name":   file.name || ""
            }
        };
        let result: SendData = await this.s3.upload(params).promise().catch(e => {
            throw new DomainError("SYSTEM_ERROR", e.message);
        });
        log.info("File Upload Successful")
        let url = `https://s3.${this.region}.amazonaws.com/${result.Bucket}/${result.Key}`;
        file.fileLocation = file.id;
        file.fileLink = url;
        file.bucketName = bucketName;
    }

    /**
     *
     * @param file
     */
    get = async (file: FileEntry): Promise<Buffer> => {
        const bucketName = !!file.bucketName ? this.bucketName : file.bucketName;
        const params = {Bucket: bucketName, Key: file.fileLocation};
        let fileObject: GetObjectOutput = await this.s3.getObject(params).promise().catch(e => {
            throw new DomainError("SYSTEM_ERROR", e.message);
        });
        return fileObject.Body as Buffer;
    }

    /**
     *
     * @param file
     */
    delete = async (file: FileEntry) => {
        const bucketName = !file.bucketName ? this.bucketName : file.bucketName;
        const params = {Bucket: bucketName, Key: file.fileLocation};
        await this.s3.deleteObject(params).promise().catch(e => {
            throw new DomainError("SYSTEM_ERROR", e.message);
        });
    }

}

export default DocumentManagerService;
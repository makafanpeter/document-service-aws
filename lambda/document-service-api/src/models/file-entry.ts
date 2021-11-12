interface FileEntry {
    fileName: string;
    fileLocation: string;
    bucketName: string;
    name: string;
    contentType: string;
    description: string;
    encrypted: boolean;
    fileExtension: string;
    url: string;
    fileLink: string;
    encryptionKey: string;
}

interface  HasKey {
    id: string
}

class DocumentUpload implements FileEntry, HasKey{
    public bucketName!: string;
    public contentType! : string;
    public description!: string;
    public encrypted!: boolean;
    public fileExtension!: string;
    public fileLink!: string;
    public fileLocation!: string;
    public fileName!: string;
    public id!: string;
    public name!: string;
    public url!: string;
    public encryptionKey!: string;
}

export default DocumentUpload;



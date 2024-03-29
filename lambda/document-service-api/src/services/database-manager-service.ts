import {DocumentClient} from "aws-sdk/clients/dynamodb";
import {DomainError, NotFoundError, SystemError} from "../models/errors/domain-error";

export class DatabaseManagerService<T> {
    private db!: DocumentClient;
    private readonly tableName!: string;
    constructor(tableName: string) {

        this.tableName =  tableName;
        this.db = new DocumentClient({
            region:process.env.REGION as  string,
        });

    }


    public async create(document: T): Promise<void> {
        const params = {
            TableName:  this.tableName,
            Item: document
        };
        await this.db.put(params).promise().catch(e => {
            throw new DomainError("SYSTEM_ERROR",e.message);
        });
    }


    public async getById(id: string): Promise<T> {
        const params = {
            TableName: this.tableName,
            Key: {id}
        };
        const result = await this.db.get(params).promise();
        if (result && result.Item) {
            return result.Item as T;
        }
        throw new NotFoundError(this.tableName, id);
    }


    public async update(id: string, documentToUpdate: T): Promise<void> {
        const existingDocument = await this.getById(id);
        const updatedUser = {
            ...existingDocument,
            ...documentToUpdate
        };
        const params = {
            TableName: this.tableName,
            Item: updatedUser
        };
        await this.db.put(params).promise().catch(e => {

            throw new SystemError(undefined, e.message);
        });
    }

    public async getAll(): Promise<T[]> {
        const params = {
            TableName: this.tableName,
        };
        const result = await this.db.scan(params).promise();
        if (result && result.Items) {
            return result.Items.map(i => i as T);
        }
        throw new SystemError("SYSTEM_ERROR",'Get document error');
    }

    public async delete(id: string): Promise<void> {
        const params = {
            TableName: this.tableName,
            Key: {
                id
            }
        };
        await this.db.delete(params).promise()
            .catch(e => {
                console.error('Delete user error', e);
                throw new NotFoundError(this.tableName,id);
            });
    }
}
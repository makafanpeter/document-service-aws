import {Aws, Construct, RemovalPolicy} from '@aws-cdk/core';
import {Attribute, AttributeType, Table} from '@aws-cdk/aws-dynamodb';
import {EnvironmentVariables} from "../document-service-enviroment-props";


class DocumentsDynamodbTable extends  Table{

    public static readonly TABLE_ID = 'DocumentServiceDynamoTable';
    public static readonly PARTITION_KEY = 'id';

    constructor(scope: Construct, env: EnvironmentVariables) {
        super(scope, DocumentsDynamodbTable.TABLE_ID, {
            tableName: env.documentsTable,
            partitionKey: {
                name: DocumentsDynamodbTable.PARTITION_KEY,
                type: AttributeType.STRING
            } as Attribute,
            removalPolicy: RemovalPolicy.DESTROY,
        });
    }
}


export default  DocumentsDynamodbTable;
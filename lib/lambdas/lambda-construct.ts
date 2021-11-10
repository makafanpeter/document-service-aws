import {IFunction} from "@aws-cdk/aws-lambda";
import {Construct} from "@aws-cdk/core";
import NodeModulesLayer from "./node-modules-layer";
import {Table} from "@aws-cdk/aws-dynamodb";
import DocumentServiceLambda from "./document-service-lambda";
import {EnvironmentVariables} from "../document-service-enviroment-props";
import S3Construct from "../s3/s3-construct";

export class LambdaConstruct extends Construct {
    public static readonly ID = 'LambdaConstruct';

    public readonly documentService: IFunction;

    constructor(scope: Construct, dynamoDbTable: Table, s3bucket: S3Construct, environmentVariables: EnvironmentVariables) {
        super(scope, LambdaConstruct.ID);
        const nodeModulesLayer = new NodeModulesLayer(this);

        this.documentService = new DocumentServiceLambda(this, environmentVariables , nodeModulesLayer);
        // @ts-ignore
        dynamoDbTable.grantFullAccess(this.documentService);
        // @ts-ignore
        s3bucket.grantReadWrite(this.documentService);

    }
}
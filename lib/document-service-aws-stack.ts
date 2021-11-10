import * as cdk from '@aws-cdk/core';
import DocumentsDynamodbTable from "./dynamodb/documents-dynamodb-table";
import {LambdaConstruct} from "./lambdas/lambda-construct";
import {ApiGatewayConstruct} from "./apigateway/apiGateway-construct";
import {EnvironmentVariables} from "./document-service-enviroment-props";
import S3Construct from "./s3/s3-construct";
import * as dotenv from 'dotenv';

dotenv.config();

export class DocumentServiceAwsStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);



    const env= new EnvironmentVariables(
        process.env.TABLE_NAME as string,
        process.env.DEFAULT_BUCKET as string,
        process.env.CDK_DEFAULT_REGION as string);

    const  s3bucket = new S3Construct(this,env);
    const documentsDynamodbTable = new DocumentsDynamodbTable(this,env);
    const lambdaConstruct = new LambdaConstruct(this, documentsDynamodbTable,s3bucket,  env);
    new ApiGatewayConstruct(this, lambdaConstruct);

  }
}

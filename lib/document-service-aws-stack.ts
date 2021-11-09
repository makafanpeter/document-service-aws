import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as apigw from '@aws-cdk/aws-apigateway';

export class DocumentServiceAwsStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    const document_service = new lambda.Function(this, 'DocumentServiceHandler', {
      runtime: lambda.Runtime.NODEJS_14_X,    // execution environment
      code: lambda.Code.fromAsset('lambda/document-service-api/dist/lambda'),  // code loaded from "lambda" directory
      handler: 'lambda.handler' , // file is "hello", function is "handlers",
      environment:{
        REGION : process.env.CDK_DEFAULT_REGION as string,
        DEFAULT_BUCKET : process.env.DEFAULT_BUCKET as string
      }
    });



    // defines an API Gateway REST API resource backed by our "hello" function.
    new apigw.LambdaRestApi(this, 'DocumentServiceEndpoint', {
      handler: document_service
    });
  }
}

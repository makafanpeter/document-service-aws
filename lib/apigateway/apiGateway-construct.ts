import {Construct} from '@aws-cdk/core';
import {LambdaConstruct} from "../lambdas/lambda-construct";
import * as apigw from "@aws-cdk/aws-apigateway";

export class ApiGatewayConstruct extends Construct {
    public static readonly ID = 'DocumentServiceApiGateway';

    constructor(scope: Construct, lambdas: LambdaConstruct) {
        super(scope, ApiGatewayConstruct.ID);
        // defines an API Gateway REST API resource backed by our "hello" function.
        new apigw.LambdaRestApi(this, 'DocumentServiceEndpoint', {
            handler: lambdas.documentService
        });

    }
}

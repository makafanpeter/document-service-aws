import {Construct} from '@aws-cdk/core';
import {LambdaConstruct} from "../lambdas/lambda-construct";
import * as apigw from "@aws-cdk/aws-apigateway";
import {LambdaIntegration, ProxyResource, RestApi} from "@aws-cdk/aws-apigateway";

export class ApiGatewayConstruct extends Construct {
    public static readonly ID = 'DocumentServiceApiGateway';

    constructor(scope: Construct, lambdas: LambdaConstruct) {
        super(scope, ApiGatewayConstruct.ID);

         new apigw.LambdaRestApi(this, ApiGatewayConstruct.ID, {
            handler: lambdas.documentService,
        });
    }
}

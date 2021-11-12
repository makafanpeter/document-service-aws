import {Construct} from '@aws-cdk/core';
import {LambdaConstruct} from "../lambdas/lambda-construct";
import * as apigw from "@aws-cdk/aws-apigateway";

export class ApiGatewayConstruct extends Construct {
    public static readonly ID = 'DocumentServiceApiGateway';

    constructor(scope: Construct, lambdas: LambdaConstruct) {
        super(scope, ApiGatewayConstruct.ID);

        const mimeTypes:string[] = [
            'application/json',
            'application/octet-stream',
            'image/jpeg',
            'image/png',
        ];

         new apigw.LambdaRestApi(this, ApiGatewayConstruct.ID, {
            handler: lambdas.documentService,
            binaryMediaTypes : mimeTypes,
            restApiName: 'Document Service API',
            description:'Document Service API',
            proxy: true
        });

    }
}

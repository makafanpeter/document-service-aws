import {Construct, Duration} from '@aws-cdk/core';
import {ManagedPolicy, Role, ServicePrincipal} from '@aws-cdk/aws-iam';
import {Code, Function, FunctionProps, LayerVersion} from '@aws-cdk/aws-lambda';
import {defaultFunctionProps} from './default-function-props';
import {EnvironmentVariables} from "../document-service-enviroment-props";


class DocumentServiceLambda extends Function {
    private static ID: string = "DocumentServiceHandler";

    constructor(scope: Construct, environmentVariables : EnvironmentVariables, layer: LayerVersion) {
        // @ts-ignore
        const functionProps: FunctionProps = {
            ...defaultFunctionProps,
            code: Code.fromAsset("lambda/document-service-api/dist/lambda"),
            handler: 'lambda.handler',
            layers: [layer],
            role: new Role(scope, `${DocumentServiceLambda.ID}_role`, {
                assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
                managedPolicies: [
                    ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
                    ManagedPolicy.fromAwsManagedPolicyName("AmazonRekognitionFullAccess")
                ],
            }),
            environment: {
                DOCUMENTS_TABLE: environmentVariables.documentsTable,
                REGION : environmentVariables.region,
                DEFAULT_BUCKET : environmentVariables.bucket
            },
        };
        super(scope, DocumentServiceLambda.ID,functionProps);
    }
}

export default DocumentServiceLambda;
import { Construct } from '@aws-cdk/core';
import { Runtime } from '@aws-cdk/aws-lambda/lib/runtime';
import { Code, LayerVersion } from '@aws-cdk/aws-lambda';


export class NodeModulesLayer extends LayerVersion {
    public static readonly ID = 'LambdaNodeModulesLayer';
    constructor(scope: Construct) {
        super(scope, NodeModulesLayer.ID, {
            code: Code.fromAsset('lambda/document-service-api/dist/lambda'),
            compatibleRuntimes: [Runtime.NODEJS_14_X],
            description: 'Node modules lambda layer',
        });
    }
}


export default  NodeModulesLayer;
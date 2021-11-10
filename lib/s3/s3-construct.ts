import {Bucket} from "@aws-cdk/aws-s3";
import {Construct} from "@aws-cdk/core";
import {EnvironmentVariables} from "../document-service-enviroment-props";

class S3Construct extends Bucket {
    public static readonly BUCKET_ID = 'DocumentServiceTable';

    constructor(scope: Construct, env: EnvironmentVariables) {
        super(scope, S3Construct.BUCKET_ID, {
            bucketName: env.bucket,
        });
    }

}

export default S3Construct;
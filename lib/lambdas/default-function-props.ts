import {Runtime} from "@aws-cdk/aws-lambda/lib/runtime";
import {Tracing} from "@aws-cdk/aws-lambda";
import {Duration} from "@aws-cdk/core";

export const defaultFunctionProps: DefaultFunctionProps = {
    runtime: Runtime.NODEJS_14_X,
    timeout: Duration.seconds(60),
    memorySize: 256,
    tracing: Tracing.ACTIVE
};

export interface DefaultFunctionProps {
    runtime: Runtime;
    timeout: Duration;
    memorySize: number;
    tracing: Tracing;
}

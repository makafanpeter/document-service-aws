import { APIGatewayEvent, Callback, Context, Handler } from 'aws-lambda';
import * as awsServerlessExpress from 'aws-serverless-express';
import app from './app';

const binaryMimeTypes = [
    'application/json',
    'application/xml',
];

const server = awsServerlessExpress.createServer(app, () => null, binaryMimeTypes);

export const handler: Handler = (event: APIGatewayEvent, context: Context) => {
    awsServerlessExpress.proxy(server, event, context);
};
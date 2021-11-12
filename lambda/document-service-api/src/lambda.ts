import { APIGatewayEvent, Callback, Context, Handler } from 'aws-lambda';
import * as awsServerlessExpress from 'aws-serverless-express';
import app from './server';

const binaryMimeTypes = [
    'application/json',
    'application/xml',
    'image/jpeg',
    'image/png',
];

const server = awsServerlessExpress.createServer(app.app, () => null, binaryMimeTypes);

export const handler: Handler = (event: APIGatewayEvent, context: Context) => {
    awsServerlessExpress.proxy(server, event, context);
};
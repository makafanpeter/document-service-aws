import { APIGatewayEvent, Callback, Context, Handler } from 'aws-lambda';
import * as awsServerlessExpress from 'aws-serverless-express';
import app from './server';
import {errorHandler, notFoundHandler} from "./middlewares/error-handler";

const binaryMimeTypes = [
    'application/json',
    'application/xml',
    'image/jpeg',
    'image/png',
];

app.app.use(notFoundHandler);
app.app.use(errorHandler);
const server = awsServerlessExpress.createServer(app.app, () => null, binaryMimeTypes);

export const handler: Handler = (event: APIGatewayEvent, context: Context) => {
    awsServerlessExpress.proxy(server, event, context);
};
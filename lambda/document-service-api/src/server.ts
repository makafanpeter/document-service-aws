import App from './app'
import * as bodyParser from 'body-parser'
import allowCors from './middlewares/allow-cors';
import errorHandler from './middlewares/error-handler';
import DefaultHandler from "./handlers/default-handler";
import DocumentHandler from "./handlers/document-handler";
import UtilityHandler from "./handlers/utility-handler";

const app = new App({
    port: 5000,
    controllers: [
        new DocumentHandler(),
        new DefaultHandler(),
        new UtilityHandler(),
    ],
    middleWares: [
        bodyParser.json(),
        bodyParser.urlencoded({ extended: true }),
        allowCors
    ]
})
app.listen();

export default  app;
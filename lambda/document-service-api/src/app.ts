import express from 'express';
import allowCors from './middlewares/allow-cors';
import errorHandler from './middlewares/error-handler';
import controllers from './handlers';

const app = express();
app.use(allowCors);
app.use('/', controllers);
app.use(errorHandler);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.listen(8000);

export default app;
import {Request, Response, NextFunction} from 'express';
import log from '../utilities/log';

const errorHandler = (err : any, req: Request, res: Response, next: NextFunction) => {
    log.error(err.stack);
    res.status(500).send('Something failed!');
};

export default errorHandler;
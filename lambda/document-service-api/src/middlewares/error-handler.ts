import {Request, Response, NextFunction} from 'express';
import log from '../utilities/log';

const errorHandler = (err: Error , req: Request, res: Response, next: NextFunction) => {
    log.error(err.name);
    res.status(500).json({
        "code":"SYSTEM_ERROR",
        "message": "Unexpected error occurred please try again or confirm current operation status"
    });
};

export default errorHandler;


import {Request, Response, NextFunction} from 'express';
import log from '../utilities/log';
import {BadInputError, BadRequestError, NotFoundError, ResourceNotFoundError} from "../models/errors/domain-error";

export const notFoundHandler =  (req: Request, _res: Response, next: NextFunction) => {
    log.info('Invalid request path %s %s', req.method, req.url);
    const err = new ResourceNotFoundError()
    next(err);
}


export const errorHandler = (err: Error, req: Request, res: Response, _next: NextFunction) => {
    log.error(err.message);
    if (err instanceof NotFoundError || err instanceof ResourceNotFoundError) {
        res.status(404);
        res.json(err)
    } else if (err instanceof BadInputError || err instanceof BadRequestError) {
        res.status(400);
        res.json(err)
    } else {
        res.status(500).json({
            "code": "SYSTEM_ERROR",
            "msg": "Unexpected error occurred please try again or confirm current operation status"
        });
    }
};

export default errorHandler;


import log from '../utilities/log';
import {Request, Response} from 'express';
import  responseTime from "response-time";

const logResponseRequest = (req: Request, res: Response,   time: number) =>
    log.info('%s %s returned %s in %d ms', req.method, req.url, res.statusCode, time);

export default responseTime(logResponseRequest);
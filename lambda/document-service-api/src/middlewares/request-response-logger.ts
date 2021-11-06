import responseTime from 'response-time';
import log from '../utilities/log';
import {Request, Response} from 'express';

const logResponseRequest = (req: Request, res: Response,   time: any) =>
    log.info('%s %s returned %s in %d ms', req.method, req.url, res.statusCode, time);

export default responseTime(logResponseRequest);
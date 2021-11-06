import {Request, Response, NextFunction} from 'express';

const allowCors = (req: Request, res: Response, next: NextFunction) => {
    const origin = req.headers['origin'] || '';
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS, POST, PUT');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') res.send();
    else next();
};

export default allowCors;
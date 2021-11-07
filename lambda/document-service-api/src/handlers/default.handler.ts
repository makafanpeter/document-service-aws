import {Request, Response, Router}  from 'express';

class DefaultHandler {
    public path = '/'
    public router = Router()

    constructor() {
        this.initRoutes()
    }

    public initRoutes() {
        this.router.get('/', this.home)
    }

    home = (req: Request, res: Response) => {
        res.send('Document Service API!');
    }
}

export default DefaultHandler
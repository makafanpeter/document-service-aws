import {body, ValidationChain} from 'express-validator';
class RequestValidator {


    public static validateUploadDocument = (): ValidationChain[] => {
        return [
           /* body('name').notEmpty().isString(),
            body('document').notEmpty(),
            body('encrypt').isBoolean(),
            body('bucket').isString(),
            body('description').isString()*/
        ]
    }

}
export default  RequestValidator;
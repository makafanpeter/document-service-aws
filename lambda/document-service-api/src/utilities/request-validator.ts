import {body, ValidationChain} from 'express-validator';
class RequestValidator {


    public static validateUploadDocument = (): ValidationChain[] => {
        return [
            body('name').notEmpty().isString(),
            /*body('document').notEmpty(),
            body('encrypt').isBoolean(),
            body('bucket').isString(),
            body('description').isString()*/
        ]
    }

   public static validateCompareFace= (): ValidationChain[] =>  {
       return [
           body('sourceImageId').notEmpty().isString(),
           body('targetImageId').notEmpty().isString()
       ]
    }

    static validateDetectFace= (): ValidationChain[] =>  {
        return [
            body('id').notEmpty().isString()
        ]
    }
}
export default  RequestValidator;
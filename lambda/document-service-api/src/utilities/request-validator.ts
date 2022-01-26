import {body, check, validationResult} from 'express-validator';
import {NextFunction, Response, Request} from "express";
import {BadInputError} from "../models/errors/domain-error";
class RequestValidator {


    public static handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
        const validationErrors = validationResult(req);
        if (!validationErrors.isEmpty()) {
            let error = new BadInputError(validationErrors.array());
            next(error);
        }
        next();
    };


    static validateUploadDocument = [
        check('name').notEmpty().isString(),
        RequestValidator.handleValidationErrors,
    ]


    public static validateCompareFace =
        [
            check('sourceImageId').notEmpty().isString(),
            check('targetImageId').notEmpty().isString(),
            RequestValidator.handleValidationErrors,
        ]


    static validateDetectFace = [
        body('id').notEmpty().isString(),
        RequestValidator.handleValidationErrors,
    ]


    static validateImageResize = [
        body('id').notEmpty().isString(),
        body('height').notEmpty().isNumeric(),
        body('width').notEmpty().isNumeric(),
        RequestValidator.handleValidationErrors,
    ]
}
export default  RequestValidator;
import DomainError from  "./domain-error"
import {ValidationError} from "express-validator";

class BadRequest extends  DomainError
{
    public errors!: ValidationError[];
    constructor(errors: ValidationError[])
    {
        let msg: string[] =  errors.map(value => value.msg.toString());
       super("BadRequest", msg.join(','));
       this.errors = errors;
        Object.setPrototypeOf(this, new.target.prototype);
    }

}

export default BadRequest;
import {ValidationError} from "express-validator";

export class DomainError extends Error {
    public code: string
    public msg: string

    constructor(code: string, message: string) {
        super(message);
        this.msg = message;
        this.code = code;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

export class BadRequestError extends DomainError {
    constructor(message: string) {
        super("BadRequest", message);
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

export class BadInputError extends  DomainError{
    public errors!: ValidationError[];
    constructor(errors: ValidationError[]) {
        let msg: string[] = errors.map((error) => `${error.msg} ${error.param}`);
        super("BadRequest", msg.join(','));
        this.errors = errors;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
export class NotFoundError extends DomainError {
    constructor(name: string, key: string) {
        super("Not Found", `Entity ${name} (${key}) was not found.`);
    }
}

export class ResourceNotFoundError extends DomainError {
    constructor() {
        super("Resource Not Found", `The requested resource couldn't be found.`);
    }
}



export class SystemError extends DomainError {
    constructor(code: string = "SYSTEM_ERROR",
                message: string = "An Unexpected error occurred please try again or confirm current operation status"
    ) {
        super(code, message);
    }
}

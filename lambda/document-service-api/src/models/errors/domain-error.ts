import {ValidationError} from "express-validator";

export class DomainError extends Error {
    public code: string

    constructor(code: string, message: string) {
        super(message);
        this.code = code;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

export class BadRequest extends DomainError {
    public errors!: ValidationError[];

    constructor(errors: ValidationError[]) {
        let msg: string[] = errors.map(value => value.msg.toString());
        super("BadRequest", msg.join(','));
        this.errors = errors;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

export class NotFound extends DomainError {
    constructor(name: string, key: string) {
        super("Not Found", `Entity ${name} (${key}) was not found.`);
    }
}

export class SystemError extends DomainError {

    constructor(code: string = "SYSTEM_ERROR",
                message: string = "An Unexpected error occurred please try again or confirm current operation status"
    ) {
        super(code, message);
    }
}

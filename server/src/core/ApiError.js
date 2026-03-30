class ApiError extends Error{
    constructor(message){
        super(message);
    }
}
class BadRequestError extends ApiError{
    constructor(message = 'BadRequest'){
        super(message);
        this.status = 400;
    }
}
class NotFoundError extends ApiError{
    constructor(message = 'Not Found'){
        super(message);
        this.status = 404;
    }
}
class InternalServerError extends ApiError{
    constructor(message = 'Internal Error'){
        super(message);
        this.status = 500;
    }
}
class AuthenticationError extends ApiError{
    constructor(message = 'Authentication Error'){
        super(message);
        this.status = 401;
    }
}
class ForbiddenError extends ApiError{
    constructor(message = 'Forbidden Error'){
        super(message);
        this.status = 403;
    }
}

module.exports = {
    BadRequestError,
    NotFoundError,
    InternalServerError,
    AuthenticationError,
    ApiError,
    ForbiddenError
}
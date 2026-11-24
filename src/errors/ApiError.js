class ApiError extends Error {
    constructor(message, statusCode, code = "ERRO_DA_API") {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
    }
}

module.exports = ApiError;
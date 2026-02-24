export class ResponseHelper {
    static success(message, data = null) {
        return {
            Success: true,
            Message: message,
            Object: data,
            Errors: null,
        };
    }
    static error(message, errors = null) {
        return {
            Success: false,
            Message: message,
            Object: null,
            Errors: errors,
        };
    }
    static paginated(message, data, pageNumber, pageSize, totalSize) {
        return {
            Success: true,
            Message: message,
            Object: data,
            PageNumber: pageNumber,
            PageSize: pageSize,
            TotalSize: totalSize,
            Errors: null,
        };
    }
}
//# sourceMappingURL=response.js.map
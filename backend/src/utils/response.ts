export interface BaseResponse<T = any> {
  Success: boolean;
  Message: string;
  Object: T | null;
  Errors: string[] | null;
}

export interface PaginatedResponse<T = any> {
  Success: boolean;
  Message: string;
  Object: T[];
  PageNumber: number;
  PageSize: number;
  TotalSize: number;
  Errors: string[] | null;
}

export class ResponseHelper {
  static success<T>(message: string, data: T | null = null): BaseResponse<T> {
    return {
      Success: true,
      Message: message,
      Object: data,
      Errors: null,
    };
  }

  static error(message: string, errors: string[] | null = null): BaseResponse<null> {
    return {
      Success: false,
      Message: message,
      Object: null,
      Errors: errors,
    };
  }

  static paginated<T>(
    message: string,
    data: T[],
    pageNumber: number,
    pageSize: number,
    totalSize: number
  ): PaginatedResponse<T> {
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

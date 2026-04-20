import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

export interface ErrorState {
  message: string;
  code?: string | number;
  details?: any;
}

@Injectable({ providedIn: 'root' })
export class ErrorHandlerService {
  handleError(error: any): ErrorState {
    console.error('API Error:', error);

    // HTTP Error Response
    if (error instanceof HttpErrorResponse) {
      const message = this.getHttpErrorMessage(error);
      return {
        message,
        code: error.status,
        details: error.error
      };
    }

    // Generic error
    if (error instanceof Error) {
      return {
        message: error.message || 'An unexpected error occurred',
        details: error
      };
    }

    // Unknown error
    return {
      message: 'An unexpected error occurred. Please try again.',
      details: error
    };
  }

  private getHttpErrorMessage(error: HttpErrorResponse): string {
    switch (error.status) {
      case 400:
        return error.error?.message || 'Invalid request. Please check your input.';
      case 401:
        return 'Unauthorized. Please log in again.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 409:
        return 'This resource already exists or has a conflict.';
      case 422:
        return error.error?.message || 'Validation failed. Please check your input.';
      case 500:
        return 'Server error. Please try again later.';
      case 503:
        return 'Service is temporarily unavailable. Please try again later.';
      default:
        return error.error?.message || `Error ${error.status}: ${error.statusText}`;
    }
  }

  getFieldErrors(errorResponse: any): { [key: string]: string[] } {
    if (errorResponse?.errors) {
      return errorResponse.errors;
    }
    return {};
  }
}

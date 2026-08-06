export class APIError {
	static custom<T = Record<string, unknown>>(config: { status: number, message: string, extensions?: T }) {
		return new ProblemDetail<T>(config);
	}
	
	static validationError(fields: { field: string, message: string }[]) {
		return new ProblemDetail({
			status: 400,
			message: 'Validation Errors',
			extensions: { fields }
		})
	}
	
	static invalidCredentials(): ProblemDetail {
    return new ProblemDetail({
      status: 401,
      message: "Invalid Credentials",
    });
  }
  
  static invalidOrMissingToken(): ProblemDetail {
    return new ProblemDetail({
      status: 401,
      message: "Invalid or Missing Token",
    });
  }

  static rateLimit<T = Record<string, unknown>>(
    message: string,
    extensions?: T,
  ): ProblemDetail<T> {
    return new ProblemDetail<T>({
      status: 429,
      message,
      extensions,
    });
  }
	
	static internalServerError() {
		return new ProblemDetail({
			status: 500,
			message: 'An unexpected error occurred'
		})
	}
}

export class ProblemDetail<T = Record<string, unknown>> extends Error {
	public readonly status: number;
	public readonly message: string;
	public readonly extensions?: T;
	
	constructor(config: { status: number, message: string, extensions?: T }) {
		super(config.message);
		
		this.status = config.status;
		this.message = config.message;
		this.extensions = config.extensions;
		
		// Maintains proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
	}
	
	toJSON(): Record<string, unknown> {
		const response = { status: this.status, message: this.message };
		if (this.extensions) Object.assign(response, this.extensions);
		return response;
	}
}



// Look into this if we ever need AppErrors
// Yeah! You could just have one generic `AppError` class that takes a `kind` or `code` field:

// ```typescript
// export class AppError extends Error {
//   constructor(public readonly code: string, message: string) {
//     super(message);
//     this.name = 'AppError';
//     Object.setPrototypeOf(this, AppError.prototype);
//   }
// }
// ```

// Then anywhere in your app:

// ```typescript
// // email.ts
// throw new AppError('INVALID_EMAIL', 'Invalid email address');

// // db.ts
// throw new AppError('USER_NOT_FOUND', 'User does not exist');
// ```

// And in the caller:

// ```typescript
// try {
//   await Email.sendEmail(to, body);
// } catch (error) {
//   if (error instanceof AppError) {
//     if (error.code === 'INVALID_EMAIL') {
//       throw APIError.custom({ status: 400, message: error.message });
//     }
//   }
//   throw APIError.internalServerError();
// }
// ```

// One class, reused everywhere, and you distinguish errors by `code` instead of by class type. You could even make the codes an enum or a union type to keep them controlled:

// ```typescript
// type AppErrorCode = 'INVALID_EMAIL' | 'USER_NOT_FOUND' | 'RATE_LIMITED';
// ```

// Then TypeScript will yell at you if you use an unrecognised code.
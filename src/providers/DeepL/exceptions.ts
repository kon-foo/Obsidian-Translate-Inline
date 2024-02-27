// Source: https://github.com/friebetill/obsidian-deepl/blob/main/src/deepl/deeplException.ts
export enum DeepLErrorCodes {
	BAD_REQUEST = 400,
	FORBIDDEN = 403,
	NOT_FOUND = 404,
	PAYLOAD_TOO_LARGE = 413,
	TOO_MANY_REQUEST = 429,
	QUOTA_EXCEEDED = 456,
	INTERNAL_SERVER_ERROR = 500,
	SERVICE_UNAVAILABLE = 503
}

export class DeepLException extends Error {
	public readonly code: DeepLErrorCodes;

	constructor(code: DeepLErrorCodes) {
		super();
		this.code = code;
	}

	public static createFromStatusCode(
		statusCode: number,
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		originalError: any
	) {
		const exception = new DeepLException(statusCode);
		exception.name = DeepLException.name;
		switch (statusCode) {
			case DeepLErrorCodes.FORBIDDEN:
				exception.message =
					'Authentication failed. Please check your DeepL API key in the settings. Make sure you use the correct API free or pro.';
				break;

			case DeepLErrorCodes.PAYLOAD_TOO_LARGE:
				exception.message = 'Please try again with a shorter text';
				break;

			case DeepLErrorCodes.TOO_MANY_REQUEST:
				exception.message = 'You have done too many translations recently. Please try again later.';
				break;

			case DeepLErrorCodes.QUOTA_EXCEEDED:
				exception.message =
					'The translation limit of your account has been reached. Consider upgrading your subscription.';
				break;

			default:
				exception.message = 'An unknown error occured. See console for more details.';
				console.error(originalError, originalError.stack);
				break;
		}
		return exception;
	}
}

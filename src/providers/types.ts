export type Language = {
	name: string;
	code: string;
};

export type Translation = {
	success: boolean;
	result?: string;
	errorMessage?: string;
};

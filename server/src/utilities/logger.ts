export const info = (...params: (string | number)[]) => {
	console.log(...params);
};

export const error = (err: any) => {
	console.error(err);
};

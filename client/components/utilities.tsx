import { TextInput } from "../types/types";

export const Spinner = () => {
	return (
		<section className="section has-element-centered">
			<div className="loader"></div>
		</section>
	);
};

export const LoadError = ({text}: TextInput) => {
	return (
		<section className="section has-text-centered">
			<h3 className="title is-3">{text}</h3>
		</section>
	);
};

import React from "react";
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

export const ErrorFallback = ({error, resetErrorBoundary}: any) => {
	return (
	  <div role="alert">
		<p>Something went wrong:</p>
		<pre>{error.message}</pre>
		<button onClick={resetErrorBoundary}>Try again</button>
	  </div>
	)
  }
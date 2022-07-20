type HeadingProps = {title: string}

export const Heading = ({title}: HeadingProps) => {
	return <h1 className="font-sans ">{title ? title : "Default title"}</h1>
}
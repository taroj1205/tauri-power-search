import { Link as TanStackLink } from "@tanstack/react-router";
import { Link as YamadaLink } from "@yamada-ui/react";

export type LinkProps = Omit<React.ComponentProps<typeof YamadaLink>, "as"> & {
	to: string;
};

export const Link = (props: LinkProps) => {
	return <YamadaLink as={TanStackLink} {...props} />;
};

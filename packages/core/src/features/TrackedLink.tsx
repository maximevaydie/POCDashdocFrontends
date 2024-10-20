import {Link} from "@dashdoc/web-ui";
import styled from "@emotion/styled";
import React from "react";
import {Link as RouterLink} from "react-router-dom";

interface TrackedLinkProps {
    onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
    to?: string;
    absoluteLink?: boolean;
    target?: string;
    rel?: string;
    className?: string;
    style?: object;
    children: React.ReactNode;
}

const StyledLink = styled(Link)`
    &:hover {
        text-decoration: none;
    }
`;
export class TrackedLink extends React.Component<TrackedLinkProps> {
    handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
        this.props.onClick && this.props.onClick(event);
    };

    render = () => {
        const props = {...this.props};
        if (!props.to || props.absoluteLink) {
            delete props.absoluteLink;
            return <StyledLink href={props.to || "#"} onClick={this.handleClick} {...props} />;
        }
        return <RouterLink to={props.to} onClick={this.handleClick} {...props} />;
    };
}

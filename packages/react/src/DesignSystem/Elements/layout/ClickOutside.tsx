import React from "react";

import {Box, BoxProps} from "./Box";

interface ClickOutsideProps {
    reactRoot?: HTMLElement | null;
    onClickOutside: (event: TouchEvent | MouseEvent) => void;
}

export class ClickOutside extends React.Component<ClickOutsideProps & BoxProps> {
    private isTouch: boolean;
    private container: any;
    private reactRoot: HTMLElement;

    constructor(props: ClickOutsideProps) {
        super(props);
        this.isTouch = false;
        this.reactRoot = props.reactRoot || (document.getElementById("react-app") as HTMLElement); // We are sure that there is a `"react-app"` element in the DOM
    }

    render() {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const {children, reactRoot, onClickOutside, ...props} = this.props;
        return (
            <Box {...props} ref={(ref) => (this.container = ref)}>
                {children}
            </Box>
        );
    }

    componentDidMount() {
        this.reactRoot.addEventListener("touchend", this.handle, true);
        this.reactRoot.addEventListener("click", this.handle, true);
    }

    componentWillUnmount() {
        this.reactRoot.removeEventListener("touchend", this.handle, true);
        this.reactRoot.removeEventListener("click", this.handle, true);
    }

    handle = (event: TouchEvent | MouseEvent) => {
        if (event.type === "touchend") {
            this.isTouch = true;
        }
        if (event.type === "click" && this.isTouch) {
            return;
        }
        if (this.container && !this.container.contains(event.target)) {
            this.props.onClickOutside(event);
        }
    };
}

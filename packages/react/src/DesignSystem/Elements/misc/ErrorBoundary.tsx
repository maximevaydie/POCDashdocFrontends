import {t} from "@dashdoc/web-core";
import {Flex, Icon, Text} from "@dashdoc/web-ui";
import React from "react";

interface ErrorBoundaryProps {
    children: React.ReactNode;
}
interface ErrorBoundaryState {
    hasError: boolean;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = {hasError: false};
    }

    componentDidCatch() {
        this.setState({hasError: true});
    }

    render() {
        if (this.state.hasError) {
            return (
                <Flex alignItems="center" backgroundColor="red.light" borderRadius={1} p={3}>
                    <Icon mr={1} name="warning" />
                    <Text>{t("common.error")}</Text>
                </Flex>
            );
        }
        return this.props.children;
    }
}

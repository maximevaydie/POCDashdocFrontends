import {t} from "@dashdoc/web-core";
import {Flex, Icon, Text} from "@dashdoc/web-ui";
import {Manager} from "dashdoc-utils";
import React from "react";

import {ModerationButton} from "../moderation/ModerationButton";

type ErrorBoundaryProps =
    | {
          children: React.ReactNode;
      }
    | {
          children: React.ReactNode;
          manager: Manager | null;
          moderationLink: string;
      };
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
                    {"moderationLink" in this.props && (
                        <Flex flex={1} justifyContent="flex-end">
                            <ModerationButton
                                manager={this.props.manager}
                                path={this.props.moderationLink}
                            />
                        </Flex>
                    )}
                </Flex>
            );
        }
        return this.props.children;
    }
}

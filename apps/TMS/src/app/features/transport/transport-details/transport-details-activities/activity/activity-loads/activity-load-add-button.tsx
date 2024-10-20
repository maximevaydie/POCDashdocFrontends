import {Flex, ClickableAddRegion, Icon, TestableProps} from "@dashdoc/web-ui";
import * as React from "react";

type Props = {
    onAddLoad: () => any;
    text: string;
} & TestableProps;

function ActivityLoadAddButton({onAddLoad, "data-testid": dataTestId, text}: Props) {
    return (
        <ClickableAddRegion onClick={onAddLoad} data-testid={dataTestId}>
            <Flex as="span" color="grey.dark" alignItems="center">
                <Icon name="add" mr={1} />
                {text}
            </Flex>
        </ClickableAddRegion>
    );
}

ActivityLoadAddButton.displayName = "ActivityLoadAddButton";

export default ActivityLoadAddButton;

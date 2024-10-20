import {BusinessStatus} from "@dashdoc/web-common/src/types/businessStatusTypes";
import {Button, Flex, Icon, Text} from "@dashdoc/web-ui";
import React, {FC} from "react";
import {useHistory} from "react-router";

import {getEmptyListIconName, getEmptyListText, getNextTabDetails} from "./utils";

type TransportEmptyListProps = {
    businessStatus: BusinessStatus;
};

export const TransportEmptyList: FC<TransportEmptyListProps> = ({businessStatus}) => {
    const history = useHistory();

    const iconName = getEmptyListIconName(businessStatus);
    const nextTabDetails = getNextTabDetails(businessStatus);

    const changeTab = () => {
        const {link, query} = nextTabDetails;

        // If the next tab link or query is not found do nothing
        if (link === null || query === null) {
            return;
        }

        history.push({
            pathname: link,
            search: query ? `?${$.param(query)}` : undefined,
        });
    };

    return (
        <Flex width={296} flexDirection="column" margin="auto" py={8}>
            {iconName && (
                <Icon svgHeight="192px" svgWidth="192px" name={iconName} color="grey.light" />
            )}
            <Text textAlign="center" color="grey.dark" variant="h1">
                {getEmptyListText(businessStatus)}
            </Text>
            {nextTabDetails.buttonLabel && (
                <Button mt={5} fontSize={2} variant="secondary" onClick={changeTab}>
                    {nextTabDetails.buttonLabel}
                </Button>
            )}
        </Flex>
    );
};

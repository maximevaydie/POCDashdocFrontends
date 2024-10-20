import {guid} from "@dashdoc/core";
import {t} from "@dashdoc/web-core";
import {IconButton, Flex, Popover, IconButtonProps} from "@dashdoc/web-ui";
import React, {useState} from "react";

import {BulkAssignAction} from "app/features/transportation-plan/assign/BulkAssignAction";
import {useRefreshTransportLists} from "app/hooks/useRefreshTransportLists";
import {SearchQuery} from "app/redux/reducers/searches";

import {PlanBulkAction} from "./plan/PlanBulkAction";

type Props = {
    query: SearchQuery;
    iconButtonProps: IconButtonProps;
};
/*
 * @deprecated - only for hotfix to bulk charter dedicated transport (https://www.notion.so/dashdoc/Hotfix-for-Bouygues-to-charter-to-dedicated-c488b99f70bd44f89587545af84dff51)
 */
export const PlanOrCharterBulkAction = (props: Props) => {
    const {query, iconButtonProps} = props;

    const transportListRefresher = useRefreshTransportLists();
    const [key, setKey] = useState("_");
    const clearPopoverState = () => setKey(guid());
    return (
        <>
            <Flex>
                <Popover placement="bottom" key={key}>
                    <Popover.Trigger>
                        <IconButton {...iconButtonProps} />
                    </Popover.Trigger>
                    <Popover.Content>
                        <Flex justifyContent="center" flexDirection="column" style={{gap: "4px"}}>
                            <PlanBulkAction
                                disabled={false}
                                query={query}
                                onPlanned={() => {
                                    transportListRefresher();
                                    clearPopoverState();
                                }}
                                onClose={clearPopoverState}
                            />
                            <BulkAssignAction
                                query={query}
                                onClose={clearPopoverState}
                                buttonProps={{
                                    variant: "primary",
                                }}
                                label={t("chartering.actions.assign")}
                            />
                        </Flex>
                    </Popover.Content>
                </Popover>
            </Flex>
        </>
    );
};

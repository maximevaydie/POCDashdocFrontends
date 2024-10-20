import {guid} from "@dashdoc/core";
import {t} from "@dashdoc/web-core";
import {Flex, IconButton, Popover, IconButtonProps} from "@dashdoc/web-ui";
import React, {useState} from "react";

import {useRefreshTransportLists} from "app/hooks/useRefreshTransportLists";
import {SearchQuery} from "app/redux/reducers/searches";

import {PlanBulkAction} from "./plan/PlanBulkAction";
import {SubcontractBulkAction} from "./subcontract/SubcontractBulkAction";

type Props = {
    query: SearchQuery;
    color?: IconButtonProps["color"];
    label?: string;
};
export const PlanOrSubcontractBulkAction = (props: Props) => {
    const {query, color, label} = props;

    const transportListRefresher = useRefreshTransportLists();
    const [key, setKey] = useState("_");
    const clearPopoverState = () => setKey(guid());
    return (
        <>
            <Flex alignItems="center">
                <Popover placement="bottom" key={key}>
                    <Popover.Trigger>
                        <IconButton
                            ml={2}
                            name="truck"
                            label={label || t("components.planOrCharter")}
                            color={color}
                            data-testid="mass-plan-or-charter"
                        />
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
                            <SubcontractBulkAction
                                disabled={false}
                                query={query}
                                onSubcontracted={() => {
                                    transportListRefresher();
                                    clearPopoverState();
                                }}
                                onClose={clearPopoverState}
                            />
                        </Flex>
                    </Popover.Content>
                </Popover>
            </Flex>
        </>
    );
};

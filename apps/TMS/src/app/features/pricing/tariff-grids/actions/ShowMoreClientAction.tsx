import {t} from "@dashdoc/web-core";
import {Button, Popover} from "@dashdoc/web-ui";
import {BadgeList} from "@dashdoc/web-ui";
import React, {FC} from "react";

export const ShowMoreClientAction: FC<{
    clients: {pk: number; name: string}[];
}> = ({clients}) => {
    return (
        <>
            {clients.length > 4 && (
                <Popover placement="top">
                    <Popover.Trigger>
                        {" "}
                        <Button mt={1} variant={"plain"}>
                            {t("tariffGrids.MoreClients", {
                                smart_count: clients.length - 5,
                            })}
                        </Button>
                    </Popover.Trigger>
                    <Popover.Content width="400px">
                        <BadgeList
                            isMultiLine={true}
                            values={clients.map((client) => client.name)}
                        />
                    </Popover.Content>
                </Popover>
            )}
        </>
    );
};

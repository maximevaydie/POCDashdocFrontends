import {t} from "@dashdoc/web-core";
import {Flex, Icon, Link, Text} from "@dashdoc/web-ui";
import React from "react";

type Props = {onAbort: () => void};
export function GoBack({onAbort}: Props) {
    return (
        <Link onClick={onAbort}>
            <Flex alignItems="center">
                <Icon name={"arrowLeftFull"} pr={2} />
                <Text mb="2px" fontWeight={600} color="blue.default">
                    {t("common.back")}
                </Text>
            </Flex>
        </Link>
    );
}

import {Flex, Text} from "@dashdoc/web-ui";
import React, {FC} from "react";

import {TemplateArea} from "./TemplateArea";

/**Component to debug Template Area. Must NOT be used in production. */
export const _TemplateAreaDebugComponent: FC = () => {
    return (
        <Flex flexDirection={"column"} style={{gap: 10}}>
            <Text variant="h1">{"Template Area Debug Component"}</Text>
            <TemplateArea
                _debug={true}
                variableList={[
                    {id: "tag1", label: "Tag 1"},
                    {id: "tag2", label: "Tag 2"},
                ]}
                initialTemplate={"first tag: [[tag1]]\nsecond tag: [[tag2]]"}
            />
        </Flex>
    );
};

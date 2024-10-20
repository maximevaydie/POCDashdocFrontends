import {
    Box,
    Button,
    FloatingMenu as FloatingMenuComponent,
    FloatingMenuItem,
} from "@dashdoc/web-ui";
import {Meta, Story} from "@storybook/react/types-6-0";
import {MenuSeparator} from "base/menu/MenuSeparator";
import React from "react";

export default {
    title: "Web UI/base/Menu/FloatingMenu",
    component: FloatingMenuComponent,
    args: {
        openNestedMenuOnHover: false,
    },
} as Meta;

const Template: Story<{openNestedMenuOnHover: boolean}> = ({openNestedMenuOnHover}) => {
    return (
        <Box>
            <FloatingMenuComponent label={<Button>Click to open floating menu</Button>}>
                <FloatingMenuComponent
                    label={"submenu 1"}
                    openNestedMenuOnHover={openNestedMenuOnHover}
                >
                    <FloatingMenuComponent
                        label={"submenu 1-1"}
                        openNestedMenuOnHover={openNestedMenuOnHover}
                    >
                        <FloatingMenuItem
                            label={"item 1-1-A"}
                            keyLabel={"item_1-1-A"}
                            onClick={() => alert("item 1-1-A clicked")}
                        ></FloatingMenuItem>
                        <FloatingMenuItem
                            label={"item 1-1-B"}
                            keyLabel={"item_1-1-B"}
                            onClick={() => alert("item 1-1-B clicked")}
                        ></FloatingMenuItem>
                    </FloatingMenuComponent>
                    <FloatingMenuItem
                        label={"item 1-2"}
                        keyLabel={"item_1-2"}
                        onClick={() => alert("item 1-2 clicked")}
                    ></FloatingMenuItem>
                </FloatingMenuComponent>

                <FloatingMenuComponent
                    label={"submenu 2"}
                    openNestedMenuOnHover={openNestedMenuOnHover}
                >
                    <FloatingMenuItem
                        label={"item 2-A"}
                        keyLabel={"item_2-A"}
                        onClick={() => alert("item 2-A clicked")}
                    ></FloatingMenuItem>
                    <FloatingMenuItem
                        label={"item 2-B"}
                        keyLabel={"item_2-B"}
                        onClick={() => alert("item 2-B clicked")}
                    ></FloatingMenuItem>
                </FloatingMenuComponent>
                <FloatingMenuItem
                    icon="eye"
                    label={"item 3"}
                    keyLabel={"item_3"}
                    onClick={() => alert("item 3 clicked")}
                ></FloatingMenuItem>
                <MenuSeparator />
                <FloatingMenuItem
                    label={"item 4"}
                    keyLabel={"item_4"}
                    isLink
                    severity={"danger"}
                    onClick={() => alert("item 4 clicked")}
                ></FloatingMenuItem>
            </FloatingMenuComponent>
        </Box>
    );
};

export const FloatingMenu = Template.bind({});
FloatingMenu.storyName = "FloatingMenu";

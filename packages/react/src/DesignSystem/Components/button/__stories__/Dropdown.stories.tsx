import {Meta, Story} from "@storybook/react/types-6-0";
import {useToggle} from "dashdoc-utils";
import React, {ReactNode, useEffect} from "react";

import {Box} from "../../layout/Box";
import {Dropdown as DropdownComponent, DropdownProps} from "../Dropdown";

export default {
    title: "Web UI/button/Dropdown",
    component: DropdownComponent,
    decorators: [
        (Story) => (
            <Box width={320}>
                <Story />
            </Box>
        ),
    ],
    args: {label: "Dropdown label", children: "Dropdown content"},
} as Meta;

const Template: Story<DropdownProps & {children: ReactNode}> = ({children, ...args}) => {
    const [isOpen, open, close] = useToggle(args.isOpen);

    useEffect(() => {
        args.isOpen ? open() : close();
    }, [args.isOpen]);

    return (
        <DropdownComponent {...args} isOpen={isOpen} onOpen={open} onClose={close}>
            <Box p={4}>{children}</Box>
        </DropdownComponent>
    );
};

export const Dropdown = Template.bind({});

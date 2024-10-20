import {Box, FloatingMenu, Select, SelectProps} from "@dashdoc/web-ui";
import React, {ReactNode} from "react";

type Props = {
    children: ReactNode;
    minWidth?: number;
} & Pick<SelectProps, "menuPortalTarget" | "label" | "data-testid" | "value" | "isDisabled">;
export function FloatingMenuWithSelect({children, minWidth, ...props}: Props) {
    return (
        <FloatingMenu
            label={
                <Box minWidth={`${minWidth}px`}>
                    <Select
                        isSearchable={false}
                        isClearable={false}
                        styles={{
                            menuPortal: (base) => ({
                                ...base,
                                display: "none", // This line hides the menuPortal, replaced by the FloatingMenu
                            }),
                        }}
                        {...props}
                    />
                </Box>
            }
            withSubMenuArrow={true}
        >
            {children}
        </FloatingMenu>
    );
}

//

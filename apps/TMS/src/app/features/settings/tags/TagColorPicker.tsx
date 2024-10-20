import {Flex, Icon} from "@dashdoc/web-ui";
import {TAG_COLOR_VARIANTS} from "@dashdoc/web-ui";
import {TagColor} from "dashdoc-utils";
import React from "react";

interface TagColorPicker {
    color: TagColor;
    onChange: (color: TagColor) => void;
}

export default function TagColorPicker({color, onChange}: TagColorPicker) {
    return (
        <Flex style={{gap: "8px"}}>
            {Object.values(TAG_COLOR_VARIANTS).map((variant) => (
                <Flex
                    key={variant.color}
                    height="30px"
                    width="30px"
                    borderRadius="4px"
                    backgroundColor={variant.color}
                    alignItems="center"
                    justifyContent="center"
                    onClick={() => onChange(variant.color)}
                    data-testid={`tag-color-${variant.color}`}
                >
                    {variant.color === color && <Icon name="check" color={variant.textColor} />}
                </Flex>
            ))}
        </Flex>
    );
}

import {LocaleOption, t} from "@dashdoc/web-core";
import {Circled} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import React from "react";

import {Icon} from "../../base/icon/Icon";
import {Link} from "../../base/link/Link";
import {FloatingMenu} from "../../base/menu/floating-menu/FloatingMenu";
import {FloatingMenuItem} from "../../base/menu/floating-menu/FloatingMenuItem";
import {Box} from "../../../Elements/layout/Box";
import {ClickableBox} from "../../../Elements/layout/ClickableBox";

const DEFAULT_NB_LANGUAGES = 4;

type Props = {
    availableLanguages: LocaleOption[];
    onPick: (option: LocaleOption) => void;
};
export function LanguagePicker({availableLanguages, onPick}: Props) {
    const [isFull, setFull, setCollapsed] = useToggle();
    const seeMoreLanguages = !isFull && availableLanguages.length > DEFAULT_NB_LANGUAGES;
    const languages = seeMoreLanguages
        ? availableLanguages.slice(0, DEFAULT_NB_LANGUAGES)
        : availableLanguages;
    return (
        <FloatingMenu
            label={
                <ClickableBox
                    mt={1}
                    color="blue.default"
                    backgroundColor="blue.ultralight"
                    borderRadius="100%"
                    hoverStyle={{color: "grey.dark", backgroundColor: "grey.ultralight"}}
                >
                    <Circled width="27px" height="27px">
                        <Icon name="plusSign" width="14px" height="14px" />
                    </Circled>
                </ClickableBox>
            }
        >
            {languages.map((option, index) => {
                return (
                    <FloatingMenuItem
                        key={option.value}
                        keyLabel={`${index}-${option.value}`}
                        label={option.label}
                        onClick={() => handleLangueClick(option)}
                        data-testid={`language-picker-${option.value}`}
                    />
                );
            })}
            {seeMoreLanguages && (
                <Box py={2} px={4}>
                    <Link onClick={handleClickMore}>{t("common.seeMoreLanguages")}</Link>
                </Box>
            )}
        </FloatingMenu>
    );

    function handleLangueClick(option: LocaleOption) {
        onPick(option);
        setCollapsed();
    }

    function handleClickMore(e: React.MouseEvent) {
        e.stopPropagation();
        setFull();
    }
}

import {t} from "@dashdoc/web-core";
import {Box, ClickOutside, Dropdown, Text} from "@dashdoc/web-ui";
import {PurchaseCostTemplate, useToggle} from "dashdoc-utils";
import React, {FunctionComponent} from "react";

import {PurchaseCostTemplateSelect} from "app/features/pricing/purchase-cost/PurchaseCostTemplateSelect";

interface PurchaseCostDropdownProps {
    onSelectPurchaseCostTemplate: (purchaseCostTemplate: PurchaseCostTemplate) => unknown;
    onAddCustomPurchaseCost: (description: string) => unknown;
}

export const PurchaseCostDropdown: FunctionComponent<PurchaseCostDropdownProps> = ({
    onSelectPurchaseCostTemplate,
    onAddCustomPurchaseCost,
}) => {
    const [isOpen, open, close] = useToggle();

    return (
        <ClickOutside
            reactRoot={document.getElementById("react-app-modal-root")}
            onClickOutside={close}
        >
            <Dropdown
                width={300}
                label={t("purchaseCosts.addAPurchaseCost")}
                isOpen={isOpen}
                onOpen={open}
                onClose={close}
                leftIcon={"accountingCalculator"}
                data-testid={"add-purchase-cost-dropdown"}
            >
                {isOpen && (
                    <Box p={2}>
                        <Text mb={2} variant="subcaption">
                            {t("common.purchaseCosts")}
                        </Text>
                        <PurchaseCostTemplateSelect
                            data-testid="purchase-cost-template-select"
                            value={null}
                            onCreateOption={(inputValue) => {
                                onAddCustomPurchaseCost(inputValue);
                                close();
                            }}
                            onChange={(purchaseCostTemplate: PurchaseCostTemplate) => {
                                onSelectPurchaseCostTemplate(purchaseCostTemplate);
                                close();
                            }}
                        />
                    </Box>
                )}
            </Dropdown>
        </ClickOutside>
    );
};

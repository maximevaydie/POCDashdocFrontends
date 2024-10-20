import {HasFeatureFlag} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {
    Box,
    ClickOutside,
    ClickableFlex,
    ClickableFlexProps,
    Flex,
    Icon,
    IconButton,
    IconProps,
} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import React from "react";

type MoreBulkActionsProps = {
    openBulkShareModal: () => void;
    openBulkReminderModal: () => void;
    openBulkDuplicateInvoice: () => void;
};

export const MoreBulkActions = ({
    openBulkShareModal,
    openBulkReminderModal,
    openBulkDuplicateInvoice,
}: MoreBulkActionsProps) => {
    const [
        showMoreActions,
        ,
        /*here we have openMoreActions that is not used */ closeMoreActions,
        toggleMoreActions,
    ] = useToggle(false);

    return (
        <ClickOutside position="relative" onClickOutside={closeMoreActions} ml={2}>
            <IconButton
                color="grey.dark"
                name="arrowDown"
                iconPosition="right"
                label={t("common.moreActions")}
                onClick={toggleMoreActions}
                data-testid="pricing-more-actions-dropdown-button"
            />
            {showMoreActions && (
                <Flex
                    flexDirection={"column"}
                    width="100%"
                    minWidth="fit-content"
                    position="absolute"
                    backgroundColor="grey.white"
                    boxShadow="large"
                    borderRadius={1}
                    zIndex="level1"
                >
                    <Action
                        iconName="share"
                        label={t("common.share")}
                        onClick={openBulkShareModal}
                        data-testid="invoices-screen-bulk-share-button"
                    />
                    <Action
                        iconName="refresh"
                        label={t("action.reminder")}
                        onClick={openBulkReminderModal}
                        data-testid="invoices-screen-bulk-reminder-button"
                    />
                    <HasFeatureFlag flagName={"dashdocInvoicing"}>
                        <Action
                            iconName="duplicate"
                            label={t("components.duplicateBareInvoices")}
                            onClick={openBulkDuplicateInvoice}
                            data-testid="invoices-screen-duplicate-button"
                            width={300}
                        />
                    </HasFeatureFlag>
                </Flex>
            )}
        </ClickOutside>
    );
};

const Action = ({
    iconName,
    label,
    onClick,
    separateAbove,
    color,
    ...props
}: ClickableFlexProps & {
    iconName: IconProps["name"];
    label: string;
    onClick: () => void;
    separateAbove?: boolean;
    color?: string;
}) => {
    return (
        <>
            {separateAbove && (
                <Box
                    width="80%"
                    alignSelf="center"
                    borderTopWidth={1}
                    borderTopStyle={"solid"}
                    borderTopColor="grey.light"
                />
            )}
            <ClickableFlex
                py={3}
                px={4}
                color={color ?? "grey.ultradark"}
                onClick={onClick}
                {...props}
            >
                <Icon mr={2} name={iconName} />
                {label}
            </ClickableFlex>
        </>
    );
};

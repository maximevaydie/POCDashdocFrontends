import {t} from "@dashdoc/web-core";
import {Box, FloatingMenu, FloatingMenuItem, MenuSeparator, Text} from "@dashdoc/web-ui";
import React, {FC, useContext, useState} from "react";

import {FloatingMenuWithSelect} from "app/features/pricing/invoices/invoice-details/invoice-content/actions/FloatingMenuWithSelect";
import {InvoiceOrCreditNoteContext} from "app/features/pricing/invoices/invoice-details/invoice-content/contexts/InvoiceOrCreditNoteContext";

import type {Invoice} from "app/taxation/invoicing/types/invoice.types";
import type {
    InvoiceGroupMode,
    InvoiceMergeLinesBy,
} from "app/taxation/invoicing/types/invoiceOrCreditNote.types";

type GroupActionProps = {
    invoice: Invoice;
    readOnly: boolean;
    isMergeByErrorModalOpen: boolean;
};

type Option = {
    label: string;
    value: InvoiceMergeLinesBy;
};
type SubOptions = {
    label: string;
    dataTestId: string;
    options: (Option | SubOptions)[];
};
type Options = (Option | SubOptions)[];

export const GroupAction: FC<GroupActionProps> = ({
    invoice,
    readOnly,
    isMergeByErrorModalOpen,
}) => {
    const {updateGroupBy, isSubmitting} = useContext(InvoiceOrCreditNoteContext);
    const [groupMode, setGroupMode] = useState<InvoiceGroupMode>(
        invoice.group_mode ? invoice.group_mode : "DEFAULT"
    );
    const [criteria, setCriteria] = useState<InvoiceMergeLinesBy>(
        invoice.merge_by ? invoice.merge_by : "NONE"
    );

    let groupOptions: Options = [
        {label: t("components.invoice.trucker"), value: "TRUCKER"},
        {
            label: t("common.plate"),
            dataTestId: "invoice-group-by-plate",
            options: [
                {label: t("common.vehicle"), value: "VEHICLE"},
                {label: t("common.trailer"), value: "TRAILER"},
            ],
        },
        {
            label: t("common.site"),
            dataTestId: "invoice-group-by-site",
            options: [
                {
                    label: t("common.pickup"),
                    value: "LOADING_ADDRESS",
                },
                {
                    label: t("common.delivery"),
                    value: "UNLOADING_ADDRESS",
                },
                {
                    label: `${t("common.pickup")} > ${t("common.delivery")}`,
                    value: "LOADING_AND_UNLOADING_ADDRESS",
                },
            ],
        },
        {
            label: t("common.date"),
            dataTestId: "invoice-group-by-date",
            options: [
                {
                    label: t("groupActionButton.creation"),
                    value: "CREATION_DATE",
                },
                {
                    label: t("common.transportLoading"),
                    dataTestId: "invoice-group-by-loading_date",
                    options: [
                        {
                            label: t("groupActionButton.asked"),
                            value: "FIRST_LOADING_ASKED_DATE",
                        },
                        {
                            label: t("groupActionButton.real"),
                            value: "FIRST_LOADING_REAL_DATE",
                        },
                        {
                            label: t("groupActionButton.planned"),
                            value: "FIRST_LOADING_PLANNED_DATE",
                        },
                    ],
                },
                {
                    label: t("common.transportUnloading"),
                    dataTestId: "invoice-group-by-unloading-date",
                    options: [
                        {
                            label: t("groupActionButton.asked"),
                            value: "LAST_UNLOADING_ASKED_DATE",
                        },
                        {
                            label: t("groupActionButton.real"),
                            value: "LAST_UNLOADING_REAL_DATE",
                        },
                        {
                            label: t("groupActionButton.planned"),
                            value: "LAST_UNLOADING_PLANNED_DATE",
                        },
                    ],
                },
            ],
        },
        {
            label: t("common.reference"),
            dataTestId: "invoice-group-by-reference",
            options: [
                {
                    label: t("common.carrier"),
                    value: "CARRIER_REFERENCE",
                },
                {
                    label: t("common.shipper"),
                    value: "SHIPPER_REFERENCE",
                },
            ],
        },
        {label: t("common.unitPrice"), value: "UNIT_PRICE"},
        {label: t("common.tag"), value: "TAG"},
        {
            label: t("common.load"),
            dataTestId: "invoice-group-by-load",
            options: [
                {label: t("groupActionButton.planned"), value: "PLANNED_LOAD"},
                {label: t("groupActionButton.loaded"), value: "LOADED_LOAD"},
                {label: t("groupActionButton.unloaded"), value: "UNLOADED_LOAD"},
            ],
        },
    ];

    const mergeOptions: Options = [
        {label: t("components.invoice.oneLine"), value: "ALL_GROUPS"},
        ...groupOptions,
    ];
    let options: Options = [];
    if (groupMode === "MERGED") {
        options = mergeOptions;
    } else if (groupMode === "GROUPED") {
        options = groupOptions;
    }

    const isSelected = (options: Options): boolean => {
        return options.some((option) => {
            if ("options" in option) {
                return isSelected(option.options);
            }
            return option.value === criteria;
        });
    };

    const submitGroupBy = (mergeBy: InvoiceMergeLinesBy, groupMode: InvoiceGroupMode) => {
        if (isSubmitting) {
            return;
        }

        if (groupMode === "DEFAULT") {
            updateGroupBy({
                payload: {
                    merge_by: "NONE",
                    group_mode: "DEFAULT",
                },
                onSuccess: () => {
                    setGroupMode("DEFAULT");
                    setCriteria("NONE");
                },
            });
            return;
        }

        updateGroupBy({
            payload: {
                merge_by: mergeBy,
                group_mode: groupMode,
            },
            onSuccess: () => {
                setGroupMode(groupMode);
                setCriteria(mergeBy);
            },
        });
    };

    let selectLabel = t("common.default");
    if (groupMode === "GROUPED") {
        // Get the level 1 of the selected option ("Site" for "Loading Address" for example)
        const selectedOptionLevel1 = groupOptions.find((option) => {
            if ("options" in option) {
                return isSelected(option.options);
            }
            return option.value === criteria;
        });
        selectLabel = t("common.group");
        if (selectedOptionLevel1) {
            selectLabel = t("groupActionButton.selectLabelBy", {
                action: t("common.group"),
                criteria: selectedOptionLevel1.label.toLowerCase(),
            });
        }
    } else if (groupMode === "MERGED") {
        // Get the level 1 of the selected option ("Site" for "Loading Address" for example)
        const selectedOptionLevel1 = mergeOptions.find((option) => {
            if ("options" in option) {
                return isSelected(option.options);
            }
            return option.value === criteria;
        });
        selectLabel = t("common.merge");
        if (selectedOptionLevel1) {
            if (criteria === "ALL_GROUPS") {
                selectLabel = t("components.invoice.oneLine");
            } else {
                selectLabel = t("groupActionButton.selectLabelBy", {
                    action: t("common.merge"),
                    criteria: selectedOptionLevel1.label.toLowerCase(),
                });
            }
        }
    }

    const minWidth = 250;

    return (
        <>
            <FloatingMenuWithSelect
                minWidth={minWidth}
                menuPortalTarget={document.body}
                label={t("groupActionButton.linesOrganization")}
                /*
                When submitting we remove the data-testid to avoid E2E tests to click on the select
                Since E2E tests are fast, this is causing some flakiness issue
                */
                data-testid={isSubmitting ? undefined : "invoice-merge-by-select"}
                value={{
                    label: selectLabel,
                }}
                isDisabled={readOnly}
            >
                {(!readOnly || isSubmitting) &&
                    // TODO: instead of hiding the floating menu children when the modal is open, we should close the floating menu when the modal is opened
                    !isMergeByErrorModalOpen && (
                        <Box minWidth={`${minWidth - 2}px`}>
                            <Text p={2} variant="subcaption">
                                {t("groupActionButton.reorganizeLines")}
                            </Text>
                            <FloatingMenuItem
                                icon="check"
                                iconColor={
                                    groupMode === "DEFAULT" ? "blue.default" : "transparent"
                                }
                                label={t("common.default")}
                                keyLabel={"common.default"}
                                onClick={() => {
                                    submitGroupBy("NONE", "DEFAULT");
                                }}
                                keepOpenOnClick={true}
                                data-testid="invoice-group-mode-DEFAULT"
                            />
                            {invoice.is_dashdoc && (
                                <FloatingMenuItem
                                    icon="check"
                                    iconColor={
                                        groupMode === "GROUPED" ? "blue.default" : "transparent"
                                    }
                                    label={t("common.group")}
                                    keyLabel={"common.group"}
                                    onClick={() => {
                                        if (criteria === "ALL_GROUPS" || criteria === "NONE") {
                                            submitGroupBy("TRUCKER", "GROUPED");
                                        } else {
                                            submitGroupBy(criteria, "GROUPED");
                                        }
                                    }}
                                    keepOpenOnClick={true}
                                    data-testid="invoice-group-mode-GROUPED"
                                />
                            )}
                            <FloatingMenuItem
                                icon="check"
                                iconColor={groupMode === "MERGED" ? "blue.default" : "transparent"}
                                label={<Text px={0}>{t("common.merge")}</Text>}
                                keyLabel={"common.merge"}
                                onClick={() => {
                                    if (criteria === "NONE") {
                                        submitGroupBy("ALL_GROUPS", "MERGED");
                                    } else {
                                        submitGroupBy(criteria, "MERGED");
                                    }
                                }}
                                keepOpenOnClick={true}
                                data-testid="invoice-group-mode-MERGED"
                            />
                            {groupMode !== "DEFAULT" && (
                                <>
                                    <MenuSeparator />
                                    <Text p={2} variant="subcaption">
                                        {t("common.criteria")}
                                    </Text>
                                </>
                            )}
                            {options &&
                                options.map((option_level_1) => {
                                    if ("options" in option_level_1) {
                                        const selected = isSelected(option_level_1.options);
                                        return (
                                            <FloatingMenu
                                                icon="check"
                                                iconColor={
                                                    selected ? "blue.default" : "transparent"
                                                }
                                                label={option_level_1.label}
                                                openNestedMenuOnHover={true}
                                                withSubMenuArrow={true}
                                                dataTestId={option_level_1.dataTestId}
                                                key={option_level_1.label}
                                            >
                                                {option_level_1.options.map((option_level_2) => {
                                                    if ("options" in option_level_2) {
                                                        return (
                                                            <FloatingMenu
                                                                icon="check"
                                                                iconColor={
                                                                    isSelected(
                                                                        option_level_2.options
                                                                    )
                                                                        ? "blue.default"
                                                                        : "transparent"
                                                                }
                                                                label={option_level_2.label}
                                                                openNestedMenuOnHover={true}
                                                                key={option_level_2.label}
                                                                dataTestId={
                                                                    option_level_2.dataTestId
                                                                }
                                                            >
                                                                {option_level_2.options.map(
                                                                    (option_level_3) => {
                                                                        if (
                                                                            "options" in
                                                                            option_level_3
                                                                        ) {
                                                                            return null;
                                                                        }
                                                                        return (
                                                                            <FloatingMenuItem
                                                                                icon="check"
                                                                                iconColor={
                                                                                    criteria ===
                                                                                    option_level_3.value
                                                                                        ? "blue.default"
                                                                                        : "transparent"
                                                                                }
                                                                                label={
                                                                                    option_level_3.label
                                                                                }
                                                                                keyLabel={
                                                                                    option_level_3.value
                                                                                }
                                                                                key={
                                                                                    option_level_3.value
                                                                                }
                                                                                onClick={() => {
                                                                                    submitGroupBy(
                                                                                        option_level_3.value,
                                                                                        groupMode
                                                                                    );
                                                                                }}
                                                                                data-testid={`invoice-group-by-${option_level_3.value}`}
                                                                            />
                                                                        );
                                                                    }
                                                                )}
                                                            </FloatingMenu>
                                                        );
                                                    }
                                                    return (
                                                        <Box
                                                            minWidth={`${minWidth - 2}px`}
                                                            key={option_level_2.value}
                                                        >
                                                            <FloatingMenuItem
                                                                icon="check"
                                                                iconColor={
                                                                    criteria ===
                                                                    option_level_2.value
                                                                        ? "blue.default"
                                                                        : "transparent"
                                                                }
                                                                label={option_level_2.label}
                                                                keyLabel={option_level_2.value}
                                                                onClick={() => {
                                                                    submitGroupBy(
                                                                        option_level_2.value,
                                                                        groupMode
                                                                    );
                                                                }}
                                                                data-testid={`invoice-group-by-${option_level_2.value}`}
                                                            />
                                                        </Box>
                                                    );
                                                })}
                                            </FloatingMenu>
                                        );
                                    } else {
                                        return (
                                            <FloatingMenuItem
                                                icon="check"
                                                iconColor={
                                                    criteria === option_level_1.value
                                                        ? "blue.default"
                                                        : "transparent"
                                                }
                                                label={option_level_1.label}
                                                keyLabel={option_level_1.value}
                                                key={option_level_1.value}
                                                onClick={() => {
                                                    submitGroupBy(option_level_1.value, groupMode);
                                                }}
                                                data-testid={`invoice-group-by-${option_level_1.value}`}
                                            />
                                        );
                                    }
                                })}
                        </Box>
                    )}
            </FloatingMenuWithSelect>
        </>
    );
};

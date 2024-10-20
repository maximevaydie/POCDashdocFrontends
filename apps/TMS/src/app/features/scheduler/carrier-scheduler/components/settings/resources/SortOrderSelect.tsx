import {t} from "@dashdoc/web-core";
import {
    Box,
    ClickOutside,
    ClickableFlex,
    DropdownContent,
    Flex,
    Icon,
    Text,
} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import React, {useEffect, useMemo, useState} from "react";

import {TripSchedulerView} from "app/features/scheduler/carrier-scheduler/trip-scheduler/services/tripScheduler.types";

export type SortResource = {order: "" | "-"; criteria: "license_plate" | "fleet_number" | "user"};
type SortOrderSelectProps = {
    resourceType: TripSchedulerView;
    sort: string | undefined;
    setSort: (value: string | undefined) => void;
    withLabel?: boolean;
};

export function SortOrderSelect({resourceType, sort, setSort, withLabel}: SortOrderSelectProps) {
    const [sortOrder, setSortOrder] = useState<"" | "-">("");
    const criteriaOptions: Array<{value: string; label: string}> = useMemo(
        () =>
            resourceType === "vehicle" || resourceType === "trailer"
                ? [
                      {value: "license_plate", label: t("components.licensePlate")},
                      {value: "fleet_number", label: t("common.fleetNumber")},
                  ]
                : [{value: "user", label: ""}],
        [resourceType]
    );
    const [sortCriterion, setSortCriterion] = useState<string>(
        getSortCriterion(sort, criteriaOptions)
    );
    const orderOptions: Array<{value: "" | "-"; label: string}> = useMemo(
        () => [
            {value: "", label: t("common.ascendingOrder")},
            {value: "-", label: t("common.descendingOrder")},
        ],
        []
    );

    const currentSortLabel = useMemo(() => {
        const criterion = criteriaOptions.find((c) => c.value === sortCriterion);
        const order = orderOptions.find((o) => o.value === sortOrder);
        const label = [criterion?.label, order?.label].filter(Boolean).join(" - ");
        return label ?? t("common.sortCriterion");
    }, [criteriaOptions, sortOrder, sortCriterion, orderOptions]);

    const handleSortSelection = (sort: string) => {
        setSort(sort);
        // when we have more than 1 criterion, we let the user select eventually another option
        if (criteriaOptions.length === 1) {
            closeSettings();
        }
    };

    useEffect(() => {
        if (sort) {
            const order = sort[0] === "-" ? "-" : "";
            const criterion = sort.replace("-", "");

            if (criteriaOptions.some((c) => c.value === criterion)) {
                setSortOrder(order);
                setSortCriterion(criterion);
            } else {
                setSort(order + criteriaOptions?.[0]?.value);
            }
        }
    }, [criteriaOptions, setSort, sort]);
    const [isSettingsOpen, openSettings, closeSettings] = useToggle();
    return (
        <>
            <ClickOutside
                onClickOutside={closeSettings}
                reactRoot={document.getElementById("react-app-modal-root")}
            >
                <ClickableFlex
                    onClick={isSettingsOpen ? closeSettings : openSettings}
                    alignItems="center"
                    justifyContent="center"
                    color="grey.dark"
                    borderRadius={withLabel ? 2 : "50%"}
                    data-testid="scheduler-row-sort-button"
                    width="fit-content"
                >
                    <Flex
                        flexDirection="column"
                        alignItems="center"
                        justifyContent="center"
                        width={"26px"}
                        height="26px"
                        fontSize="0.4em"
                        lineHeight="1.4em"
                    >
                        <Icon name="triangleUp" />
                        <Icon name="triangleDown" />
                    </Flex>
                    {withLabel && (
                        <Text p={1} pr={2}>
                            {currentSortLabel}
                        </Text>
                    )}
                </ClickableFlex>
                {isSettingsOpen && (
                    <Box position="relative">
                        <DropdownContent
                            zIndex="level1"
                            p={3}
                            position="absolute"
                            width="250px !important"
                            top="100%"
                        >
                            {criteriaOptions.length > 1 && (
                                <Box
                                    pb={3}
                                    mb={3}
                                    borderBottom="1px solid"
                                    borderColor="grey.light"
                                >
                                    <Text
                                        variant="subcaption"
                                        color="grey.dark"
                                        fontWeight="400"
                                        mb={2}
                                    >
                                        {t("common.sortCriterion")}
                                    </Text>
                                    {criteriaOptions.map(({value, label}) => (
                                        <ClickableFlex
                                            onClick={() => handleSortSelection(sortOrder + value)}
                                            p={1}
                                            key={value}
                                            data-testid={`scheduler-row-sort-criterion-${value}`}
                                        >
                                            <Icon
                                                name="check"
                                                color={
                                                    sortCriterion === value
                                                        ? "blue.default"
                                                        : "transparent"
                                                }
                                                mr={3}
                                            />
                                            <Text>{label}</Text>
                                        </ClickableFlex>
                                    ))}
                                </Box>
                            )}

                            <Text variant="subcaption" color="grey.dark" fontWeight="400" mb={2}>
                                {t("common.sortOrder")}
                            </Text>
                            {orderOptions.map(({value, label}) => (
                                <ClickableFlex
                                    onClick={() => handleSortSelection(value + sortCriterion)}
                                    p={1}
                                    key={value}
                                    data-testid={`scheduler-row-sort-order-${value}`}
                                >
                                    <Icon
                                        name="check"
                                        color={
                                            sortOrder === value ? "blue.default" : "transparent"
                                        }
                                        mr={3}
                                    />
                                    <Text>{label}</Text>
                                </ClickableFlex>
                            ))}
                        </DropdownContent>
                    </Box>
                )}
            </ClickOutside>
        </>
    );
}

function getSortCriterion(
    sort: string | undefined,
    criteriaOptions: Array<{value: string; label: string}>
) {
    return sort && criteriaOptions.some((c) => c.value === sort.replace("-", ""))
        ? sort.replace("-", "")
        : criteriaOptions?.[0]?.value;
}

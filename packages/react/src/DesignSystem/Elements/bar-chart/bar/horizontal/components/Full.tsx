import {i18nReportService, t} from "@dashdoc/web-core";
import {Box, Callout, Checkbox, Flex, Text, TooltipWrapper, theme} from "@dashdoc/web-ui";
import {useEffectExceptOnMount} from "dashdoc-utils";
import React, {FunctionComponent, useState} from "react";

import {HorizontalChart, HorizontalChartRow} from "../types";

import {GenericChart} from "./GenericChart";

const Header: FunctionComponent<{title: string; subtitle: string}> = ({title, subtitle}) => {
    return (
        <>
            <Text variant="captionBold" color="grey.dark">
                {subtitle}
            </Text>
            <Text variant="title" color="grey.dark" textAlign="right" mr={1} mb={2}>
                {title}
            </Text>
        </>
    );
};

const Selectors: FunctionComponent<{
    rows: HorizontalChartRow[];
    checkedKeys: number[];
    onSelectAll: () => void;
    onUnSelectAll: () => void;
    onSelect: (key: number) => void;
}> = ({rows, checkedKeys, onSelectAll, onUnSelectAll, onSelect}) => {
    const everythingSelected = rows.every((row) => checkedKeys.includes(row.id));
    const selectAllOnchange = everythingSelected ? onUnSelectAll : onSelectAll;
    const selectAllLabel = everythingSelected ? t("common.deselectAll") : t("common.selectAll");
    return (
        <Box>
            <Box pb="1">
                <Checkbox
                    style={{accentColor: theme.colors.grey.light}}
                    color="grey.white"
                    checked={everythingSelected}
                    onChange={selectAllOnchange}
                    label={selectAllLabel}
                />
            </Box>
            <Box borderTop="1px solid" borderColor="grey.light" pt="2">
                {rows.map((row) => (
                    <Flex key={row.label} justifyContent="space-between" maxWidth={400}>
                        <TooltipWrapper content={row.label.length > 30 ? row.label : undefined}>
                            <Checkbox
                                style={{accentColor: row.color}}
                                color="grey.white"
                                checked={checkedKeys.includes(row.id)}
                                onChange={() => onSelect(row.id)}
                                label={
                                    row.label.length > 30
                                        ? `${row.label.slice(0, 25)}...`
                                        : row.label
                                }
                            />
                        </TooltipWrapper>
                        <Text ml={2} color="grey.dark" whiteSpace="nowrap">
                            {row.valueLabel}
                        </Text>
                    </Flex>
                ))}
            </Box>
        </Box>
    );
};

export const Full: FunctionComponent<HorizontalChart> = ({
    results,
    informationLabel,
    type,
    onSelectKey,
    ...others
}) => {
    const [checkedKeys, setCheckedKeys] = useState(() =>
        results.filter((result) => result.checked !== false).map((result) => result.id)
    );
    useEffectExceptOnMount(() => {
        // result has changed, update checked keys
        setCheckedKeys(() =>
            results.filter((result) => result.checked !== false).map((result) => result.id)
        );
    }, [results]);

    const onSelect = (value: number) => {
        setCheckedKeys((prev) => {
            const newKeys = prev.includes(value)
                ? prev.filter((v) => v !== value)
                : [...prev, value];
            onSelectKey?.(newKeys);
            return newKeys;
        });
    };
    const onSelectAll = () => {
        const newKeys = results.map((result) => result.id);
        setCheckedKeys(newKeys);
        onSelectKey?.(newKeys);
    };
    const onUnSelectAll = () => {
        setCheckedKeys([]);
        onSelectKey?.([]);
    };
    const filteredResults = results.filter((result) => checkedKeys.includes(result.id));
    const sortedResults = [...results].sort((l, r) => l.label.localeCompare(r.label));

    const title = i18nReportService.getValueLabel(
        filteredResults.reduce((total, filteredResult) => {
            return total + filteredResult.value;
        }, 0),
        type
    );
    const subtitle = i18nReportService.getTotalCalculationLabel(type);

    return (
        <>
            <Flex border="1px solid" borderColor="grey.light" height="100%">
                <Flex p={3} flexGrow="4" borderRight="1px solid" borderColor="grey.light">
                    <Flex flexDirection="column" justifyContent="space-between" minWidth="72%">
                        <Box>
                            <Box height={`${(25 + 10) * filteredResults.length}px`}>
                                <GenericChart results={filteredResults} {...others} />
                            </Box>
                        </Box>
                        {informationLabel && (
                            <Box>
                                <Callout variant="neutral">{informationLabel}</Callout>
                            </Box>
                        )}
                    </Flex>
                </Flex>
                <Box flexGrow="0">
                    <Box p={2}>
                        <Header title={title} subtitle={subtitle} />
                    </Box>
                    <Box p={3} borderTop="1px solid" borderColor="grey.light">
                        <Selectors
                            rows={sortedResults}
                            checkedKeys={checkedKeys}
                            onSelect={onSelect}
                            onSelectAll={onSelectAll}
                            onUnSelectAll={onUnSelectAll}
                        />
                    </Box>
                </Box>
            </Flex>
        </>
    );
};

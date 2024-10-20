import {Box, Flex, Text, theme, themeAwareCss} from "@dashdoc/web-ui";
import React, {FC, useRef} from "react";

import {TariffGridVersion} from "../../types";
import {RightArrow} from "../actions/components/RightArrow";
import {CreateStepAction} from "../actions/CreateStepAction";
import {EditStepAction} from "../actions/EditStepAction";
import {tableService} from "../table.service";

import {Th} from "./Th";

const NO_COLUMN = "?";

export const TableHeader: FC<{
    tariffGridVersion: TariffGridVersion;
    metricUnit: string | undefined;
    onChange: (newTariffGridVersion: TariffGridVersion) => void;
}> = ({tariffGridVersion, metricUnit, onChange}) => {
    const createStepRef = useRef(null);

    const createStepContent = (
        <Box pl={2} ref={createStepRef} fontWeight="normal" style={{whiteSpace: "nowrap"}}>
            <CreateStepAction
                metricSteps={tariffGridVersion.metric_steps}
                onCreate={(value) => {
                    onChange(tableService.addColumn(tariffGridVersion, value));
                    // @ts-ignore
                    createStepRef.current?.scrollIntoView();
                }}
            />
        </Box>
    );

    return (
        <thead>
            <tr key="metric-steps">
                {(() => {
                    let heads = [
                        <Th scope="col" key="top-left-cell">
                            {tariffGridVersion.metric_steps[0] ?? 0}
                        </Th>,
                    ];

                    if (tariffGridVersion.metric_steps.length <= 1) {
                        heads.push(
                            <Th scope="col" key="empty_metric_steps">
                                <Flex
                                    flexDirection={"row"}
                                    justifyContent={"center"}
                                    alignItems={"center"}
                                >
                                    <RightArrow />
                                    <Text>{NO_COLUMN}</Text>
                                </Flex>
                            </Th>
                        );
                        return heads;
                    }

                    for (
                        let col_index = 1;
                        col_index < tariffGridVersion.metric_steps.length;
                        col_index++
                    ) {
                        heads.push(
                            <EditStepAction
                                key={tariffGridVersion.metric_steps[col_index].toString()}
                                metricSteps={tariffGridVersion.metric_steps}
                                stepIndex={col_index}
                                onChange={(v, index) =>
                                    onChange(tableService.editColumn(tariffGridVersion, v, index))
                                }
                                onDelete={(index) =>
                                    onChange(tableService.deleteColumn(tariffGridVersion, index))
                                }
                                dataTestId={`tariff-grid-metric-step-${col_index}`}
                                metricUnit={metricUnit}
                            />
                        );
                    }
                    return heads;
                })()}
                <th style={themeAwareCss({position: "sticky", top: 0, zIndex: "level2"})(theme)}>
                    {createStepContent}
                </th>
            </tr>
        </thead>
    );
};

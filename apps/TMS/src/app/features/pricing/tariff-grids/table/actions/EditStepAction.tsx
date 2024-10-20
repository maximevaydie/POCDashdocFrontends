import {Flex, Text} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import React, {FC} from "react";

import {Th} from "../header/Th";

import {RightArrow} from "./components/RightArrow";
import {EditStepPopover} from "./components/StepPopover";

type EditStepActionProps = {
    metricSteps: number[];
    stepIndex: number;
    dataTestId?: string;
    metricUnit: string | undefined;
    onChange: (value: number, stepIndex: number) => unknown;
    onDelete: (stepIndex: number) => unknown;
};

export const EditStepAction: FC<EditStepActionProps> = (props) => {
    const {metricSteps, stepIndex} = props;
    const [isOpen, open, close] = useToggle();
    const label =
        metricSteps[stepIndex].toLocaleString() +
        (props.metricUnit === undefined ? "" : " " + props.metricUnit);
    return (
        <Th
            scope="col"
            isClickable
            isSelected={isOpen}
            onClick={open}
            data-testid={props.dataTestId}
        >
            <EditStepPopover isOpen={isOpen} onClose={close} {...props}>
                <Flex flexDirection={"row"} justifyContent={"center"} alignItems={"center"}>
                    <RightArrow />
                    <Text>{label}</Text>
                </Flex>
            </EditStepPopover>
        </Th>
    );
};

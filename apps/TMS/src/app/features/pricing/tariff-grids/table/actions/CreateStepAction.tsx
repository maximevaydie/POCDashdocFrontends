import {t} from "@dashdoc/web-core";
import {Button, Flex} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import React, {FC} from "react";

import {CreateStepPopover} from "./components/StepPopover";

type CreateStepActionProps = {
    metricSteps: number[];
    onCreate: (value: number) => unknown;
};

export const CreateStepAction: FC<CreateStepActionProps> = (props) => {
    const [isOpen, open, close] = useToggle();
    return (
        <Flex>
            <CreateStepPopover isOpen={isOpen} onClose={close} {...props}>
                <Button variant={"plain"} onClick={open} data-testid={"create-step-button"}>
                    {t("tariffGrids.AddAColumn")}
                </Button>
            </CreateStepPopover>
        </Flex>
    );
};

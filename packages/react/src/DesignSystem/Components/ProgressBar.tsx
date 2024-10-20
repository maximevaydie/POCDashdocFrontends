import {Box, Flex} from "@dashdoc/web-ui";
import React, {FunctionComponent} from "react";

export type ProgressBarProps = {
    progress: number;
    progressColor?: string;
};

export const ProgressBar: FunctionComponent<ProgressBarProps> = ({
    progress,
    progressColor = "green.default",
}) => (
    <Flex flexDirection="column" justifyContent="center" my={2}>
        <Box
            position="relative"
            width={"100%"}
            height={6}
            backgroundColor="grey.light"
            borderRadius={2}
            mt={3}
            mb={3}
        >
            <Box
                width={progress.toString() + "%"}
                maxWidth={"100%"}
                height={6}
                borderRadius={2}
                backgroundColor={progressColor}
            />
        </Box>
    </Flex>
);

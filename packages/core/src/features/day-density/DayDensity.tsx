import {Box, theme} from "@dashdoc/web-ui";
import styled from "@emotion/styled";
import {DayDensitySample} from "features/profile-portal/manager/zone/zone-column/zone.service";
import React from "react";

export type Props = {
    samples: DayDensitySample[];
    max: number;
    loading: boolean;
};

export function DayDensity({samples, max, loading}: Props) {
    const length = samples.length;

    return (
        <HashedBox>
            {loading ? (
                <Box
                    height="49px"
                    border="1px solid"
                    borderColor="grey.light"
                    backgroundColor="grey.white"
                />
            ) : (
                <Box
                    height="49px"
                    border="1px solid"
                    borderColor="grey.light"
                    style={{
                        display: "grid",
                        gridTemplateColumns: `repeat(${length}, 1fr)`,
                    }}
                >
                    {samples.map((sample, index) => {
                        if (sample === "unavailable") {
                            let beginUnavailable = false;
                            let finishUnavailable = false;
                            if (index >= 1) {
                                beginUnavailable = samples[index - 1] !== "unavailable";
                            }
                            if (index < length - 1) {
                                finishUnavailable = samples[index + 1] !== "unavailable";
                            }
                            return (
                                <UnavailableBar
                                    begin={beginUnavailable}
                                    finish={finishUnavailable}
                                    key={index}
                                />
                            );
                        }
                        return <Bar key={index} sample={sample} max={max} />;
                    })}
                </Box>
            )}
        </HashedBox>
    );
}

function UnavailableBar({begin, finish}: {begin: boolean; finish: boolean}) {
    return (
        <Box
            borderLeft={begin ? "1px solid" : undefined}
            borderRight={finish ? "1px solid" : undefined}
            borderColor="grey.light"
        />
    );
}

const HashedBox = styled(Box)`
    border: "1px solid";
    background: repeating-linear-gradient(
        -50deg,
        ${theme.colors.grey.white},
        ${theme.colors.grey.white} 4px,
        ${theme.colors.grey.light} 4px,
        ${theme.colors.grey.light} 6px
    );
`;

function Bar({sample, max}: {sample: number; max: number}) {
    const rowStart = sample > 0 ? max - sample + 1 : max + 1;
    const rowEnd = max + 1;
    return (
        <Box backgroundColor="grey.white" px="1px" pt="1px">
            <Box
                style={{
                    display: "grid",
                    gridTemplateRows: `repeat(${max}, 1fr)`,
                }}
                height="100%"
            >
                <Box
                    backgroundColor="blue.light"
                    borderTopLeftRadius="1px"
                    borderTopRightRadius="1px"
                    style={{
                        gridColumnStart: 0,
                        gridColumnEnd: 1,
                        gridRowStart: rowStart,
                        gridRowEnd: rowEnd,
                    }}
                />
            </Box>
        </Box>
    );
}

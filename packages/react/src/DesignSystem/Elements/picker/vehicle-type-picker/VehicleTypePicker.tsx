import {SelectOption} from "@dashdoc/web-core";
import {Box, CountBadge, Flex, Icon, Text, theme} from "@dashdoc/web-ui";
import styled from "@emotion/styled";
import sortedUniq from "lodash.uniq";
import React, {FunctionComponent, useMemo} from "react";

export interface VehicleTypePickerProps {
    label: string;
    vehicleTypes: SelectOption<string>[];
    onSelectVehicleType: (vehicleTypeValue: string) => void;
}

export const VehicleTypePicker: FunctionComponent<VehicleTypePickerProps> = ({
    label,
    vehicleTypes,
    onSelectVehicleType,
}) => {
    const vehicleTypeStats = useMemo(() => {
        const uniqValues = sortedUniq(vehicleTypes.map((vehicleType) => vehicleType.value));
        const result = uniqValues.map((uniqValue) => {
            const vehicleType = vehicleTypes.find(
                (vehicleType) => vehicleType.value === uniqValue
            );
            const count = vehicleTypes.filter(
                (vehicleType) => vehicleType.value === uniqValue
            ).length;
            return {vehicleType, count};
        });
        return result;
    }, [vehicleTypes]);
    return (
        <Box ml={8} mt={2}>
            <Flex alignItems="center">
                <Icon name="alert" color="yellow.default" fontSize={3} />
                <Text ml={2}>{label}</Text>
            </Flex>
            <Flex alignItems="center" ml={5} mt={3}>
                {vehicleTypeStats.map(({vehicleType, count}, index) => (
                    <VehicleType
                        // @ts-ignore
                        vehicleType={vehicleType}
                        count={count}
                        onSelectVehicleType={onSelectVehicleType}
                        key={`row-${index}`}
                    />
                ))}
            </Flex>
        </Box>
    );
};

const HoverStyledFlex = styled(Flex)`
    cursor: pointer;
    :hover {
        background-color: ${theme.colors.blue.light};
    }
    &:hover > * {
        color: ${theme.colors.blue.dark};
    }
    &:hover > div > div {
        background-color: ${theme.colors.blue.dark};
        color: ${theme.colors.grey.white};
    }
`;

const VehicleType = ({
    vehicleType,
    count,
    onSelectVehicleType,
}: {
    vehicleType: SelectOption<string>;
    count: number;
    onSelectVehicleType: (vehicleType: string) => void;
}) => {
    const {label, value} = vehicleType;
    return (
        <HoverStyledFlex
            alignItems="center"
            // @ts-ignore
            onClick={() => onSelectVehicleType(value)}
            border="1px solid"
            borderColor="grey.light"
            justifyContent="space-between"
            borderRadius={1}
            p={2}
            pl={4}
            pr={4}
            mr={4}
            minWidth={150}
            data-testid={`vehicle-type-button`}
        >
            <Text>{label}</Text>
            <CountBadge value={count} />
        </HoverStyledFlex>
    );
};

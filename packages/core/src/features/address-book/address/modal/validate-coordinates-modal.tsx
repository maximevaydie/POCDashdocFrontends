import {BuildConstants, getReadableAddress, t} from "@dashdoc/web-core";
import {
    Box,
    Checkbox,
    Coordinates,
    Flex,
    Icon,
    Image,
    LatLng,
    MapWithMarker,
    Modal,
    NumberInput,
    Text,
} from "@dashdoc/web-ui";
import {Address} from "dashdoc-utils";
import isNil from "lodash.isnil";
import React, {ReactNode, useEffect, useState} from "react";

import {useHereApiService} from "../../../../hooks/useHereApiService";
import {apiService} from "../../../../services/api.service";

const ExampleImage = ({src}: {src: string}) => <Image src={src} mr={1} width={88} />;

function ExampleText({children}: {children: ReactNode}) {
    return (
        <Text variant="caption" color="grey.dark">
            {children}
        </Text>
    );
}

const GoodIcon = () => <Icon name="checkCircle" color="green.default" verticalAlign="text-top" />;

const BadIcon = () => <Icon name="removeCircle" color="red.default" verticalAlign="text-top" />;

function GPSValidationExamples() {
    return (
        <Flex
            m={2}
            p={2}
            border="1px solid"
            borderColor="grey.light"
            justifyContent="space-between"
        >
            <Flex mr={1}>
                <ExampleImage src={`${BuildConstants.staticUrl}img/Telematic_detect_cas_1.png`} />
                <Box>
                    <Text>{t("validateCoordinatesModal.exempleNumber", {number: 1})}</Text>
                    <ExampleText>
                        {t("validateCoordinatesModal.gpsPointNotCentered")} <BadIcon />
                    </ExampleText>
                    <ExampleText>
                        {t("validateCoordinatesModal.detectionZoneTooSmall")} <BadIcon />
                    </ExampleText>
                </Box>
            </Flex>
            <Flex mr={1}>
                <ExampleImage src={`${BuildConstants.staticUrl}img/Telematic_detect_cas_2.png`} />
                <Box>
                    <Text>{t("validateCoordinatesModal.exempleNumber", {number: 2})}</Text>
                    <ExampleText>
                        {t("validateCoordinatesModal.gpsCentered")} <GoodIcon />
                    </ExampleText>
                    <ExampleText>
                        {t("validateCoordinatesModal.detectionZoneTooSmall")} <BadIcon />
                    </ExampleText>
                </Box>
            </Flex>
            <Flex>
                <ExampleImage src={`${BuildConstants.staticUrl}img/Telematic_detect_cas_3.png`} />
                <Box>
                    <Text>{t("validateCoordinatesModal.exempleNumber", {number: 3})}</Text>
                    <ExampleText>
                        {t("validateCoordinatesModal.gpsCentered")} <GoodIcon />
                    </ExampleText>
                    <ExampleText>
                        {t("validateCoordinatesModal.fittingDetectionZone")} <GoodIcon />
                    </ExampleText>
                </Box>
            </Flex>
        </Flex>
    );
}

type ValidateCoordinatesModalProps = {
    address: Address;
    saveWithoutGPS: () => void;
    saveWithGPS: (coordinates: Coordinates & {radius: number}) => void;
    onClose: () => void;
};

export function ValidateCoordinatesModal({
    address,
    saveWithoutGPS,
    saveWithGPS,
    onClose,
}: ValidateCoordinatesModalProps) {
    const [{latitude, longitude}, setCoordinates] = useState<{
        latitude: number | null;
        longitude: number | null;
    }>({latitude: address.latitude, longitude: address.longitude});
    const [displayTraces, setDisplayTraces] = useState(true);
    const [displayDetectionArea, setDisplayDetectionArea] = useState(true);
    // nosemgrep
    const [detectionRadius, setDetectionRadius] = useState(address.radius || 500);

    const [addressOnSiteStatusesCoordinates, setAddressOnSiteStatusesCoordinates] = useState<
        Coordinates[]
    >([]);

    const {search} = useHereApiService();

    useEffect(() => {
        // Fetch GPS points through statuses
        if (!isNil(address?.pk)) {
            // Here goes the API call
            apiService.Addresses.getLastStatusesWithGPSCoordinates(address.pk).then((statuses) => {
                if (statuses.length > 0) {
                    setAddressOnSiteStatusesCoordinates(
                        statuses.map(
                            (status) =>
                                ({
                                    latitude: status.latitude,
                                    longitude: status.longitude,
                                }) as Coordinates
                        )
                    );
                }
            });
        }
    }, []);

    useEffect(() => {
        // If no coordinates yet, try to get some
        if (latitude === null || longitude === null) {
            let qq = [];
            if (address.address) {
                qq.push(`street=${address.address}`);
            }
            if (address.postcode) {
                qq.push(`postalCode=${address.postcode}`);
            }
            if (address.city) {
                qq.push(`city=${address.city}`);
            }
            if (address.country) {
                qq.push(`country=${address.country}`);
            }
            if (qq.length) {
                search(
                    "geocode",
                    {qq: qq.join(";")},
                    (result: any) => {
                        if (result?.items?.length > 0) {
                            setCoordinates({
                                latitude: result.items[0]["position"]["lat"],
                                longitude: result.items[0]["position"]["lng"],
                            });
                        }
                    },
                    () => {}
                );
            }
        }
    }, []);

    return (
        <Modal
            id="validate-coordinates-modal"
            data-testid="validate-coordinates-modal"
            title={t("validateCoordinatesModal.addAddress", {
                address: getReadableAddress(address),
            })}
            size="large"
            onClose={onClose}
            mainButton={{
                // @ts-ignore
                onClick: () => saveWithGPS({latitude, longitude, radius: detectionRadius}),
                "data-testid": "validate-coordinates-modal-verify-gps",
                children: t("common.save"),
            }}
            secondaryButton={{
                onClick: saveWithoutGPS,
                variant: "plain",
                "data-testid": "validate-coordinates-modal-save-without-gps",
                children: t("addressModal.saveWithoutGPSCoordinates"),
            }}
        >
            <Box p={5}>
                <GPSValidationExamples />
                <Flex>
                    <Box flexBasis="50%" mr={4} alignSelf="center">
                        {/* Map */}
                        <MapWithMarker
                            latLng={latitude && longitude ? {latitude, longitude} : undefined}
                            areaRadius={displayDetectionArea ? detectionRadius : undefined}
                            extraMarkers={
                                displayTraces ? addressOnSiteStatusesCoordinates : undefined
                            }
                            onChange={handleSetCoordinates}
                        />
                    </Box>
                    <Box flexBasis="50%">
                        <Box mb={3}>
                            {/* Step 1 */}
                            <Text variant="h1" mb={2}>
                                {t("validateCoordinatesModal.stepOneTitle")}
                            </Text>
                            <Text variant="caption">{t("validateCoordinatesModal.stepOne")}</Text>
                            <Flex mt={3}>
                                <Box mr={5}>
                                    <NumberInput
                                        //The value update does not update the input field
                                        key={`latitude-${latitude}`}
                                        label={t("common.latitude")}
                                        placeholder="48.586708"
                                        value={latitude}
                                        onChange={(newLatitude) =>
                                            setCoordinates((prev) => ({
                                                ...prev,
                                                latitude: newLatitude ? newLatitude % 90 : null,
                                            }))
                                        }
                                        maxDecimals={6}
                                        textAlign="left"
                                        data-testid="validate-coordinates-modal-latitude"
                                        required
                                    />
                                </Box>
                                <Box>
                                    <NumberInput
                                        //The value update does not update the input field
                                        key={`longitude-${longitude}`}
                                        label={t("common.longitude")}
                                        placeholder="7.75753150"
                                        value={longitude}
                                        onChange={(newLongitude) =>
                                            setCoordinates((prev) => ({
                                                ...prev,
                                                longitude: newLongitude
                                                    ? newLongitude % 180
                                                    : null,
                                            }))
                                        }
                                        maxDecimals={8}
                                        textAlign="left"
                                        data-testid="validate-coordinates-modal-longitude"
                                        required
                                    />
                                </Box>
                            </Flex>
                            <Box mt={3}>
                                <Checkbox
                                    label={
                                        <Text as="span" variant="caption">
                                            {t("validateCoordinatesModal.displayLastTraces")}
                                        </Text>
                                    }
                                    checked={displayTraces}
                                    onChange={setDisplayTraces}
                                />
                            </Box>
                        </Box>
                        <Box>
                            {/* Step 2 */}
                            <Text variant="h1" mb={2}>
                                {t("validateCoordinatesModal.stepTwoTitle")}
                            </Text>
                            <Text variant="caption">{t("validateCoordinatesModal.stepTwo")}</Text>
                            <Flex mt={3}>
                                <Checkbox
                                    label={
                                        <Text as="span" variant="caption">
                                            {t("validateCoordinatesModal.displayDetectionArea")}
                                        </Text>
                                    }
                                    checked={displayDetectionArea}
                                    onChange={setDisplayDetectionArea}
                                />
                                <NumberInput
                                    data-testid="validate-coordinates-modal-radius"
                                    value={detectionRadius}
                                    max={2000}
                                    onChange={handleRadiusChange}
                                    units={t("common.meters.short")}
                                />
                            </Flex>
                        </Box>
                    </Box>
                </Flex>
            </Box>
        </Modal>
    );

    function handleRadiusChange(radius: number) {
        // We handle min value here to avoid weird behaviors while typing
        if (radius < 10) {
            setDetectionRadius(10);
            return;
        }
        setDetectionRadius(radius);
    }

    function handleSetCoordinates(latLng: LatLng) {
        setCoordinates({latitude: latLng.latitude % 90, longitude: latLng.longitude % 180});
    }
}

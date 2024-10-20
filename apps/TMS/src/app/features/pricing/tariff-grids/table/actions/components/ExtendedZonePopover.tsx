import {guid} from "@dashdoc/core";
import {AddressSelect, getConnectedCompany} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {
    Button,
    Flex,
    IconButton,
    Popover,
    Select,
    SelectCountry,
    Text,
    theme,
} from "@dashdoc/web-ui";
import {Company} from "dashdoc-utils";
import React, {FC, useState} from "react";

import {TariffGridCountrySelect} from "app/features/pricing/tariff-grids/components/TariffGridCountrySelect";
import {TariffGridPlaceSelect} from "app/features/pricing/tariff-grids/table/actions/components/TariffGridPlaceSelect";
import {useSelector} from "app/redux/hooks";
import {useTariffGridZones} from "app/screens/invoicing/hooks/useTariffGridZones";

import {ZoneSelect} from "../../../components/ZonePicker";
import {
    PlaceForTariffGridZone,
    TariffGridAddress,
    TariffGridArea,
    TariffGridAreasRecord,
    TariffGridCountryCode,
    TariffGridZone,
    availableCountryZodSchema,
} from "../../../types";

const DEFAULT_COUNTRY = "be" as const;

const getZoneCountry = (
    zone: TariffGridZone,
    allTariffGridAreas: TariffGridAreasRecord
): TariffGridCountryCode | null => {
    if (zone.zone_type === "TARIFF_GRID_AREA_ID") {
        if (zone.area.uid in allTariffGridAreas) {
            return zone.area.uid in allTariffGridAreas
                ? allTariffGridAreas[zone.area.uid].country
                : null;
        }
        return null;
    }
    const countryString =
        zone.zone_type === "PLACE"
            ? zone.place.country.toLowerCase()
            : zone.address.country.toLowerCase();
    const validationResult = availableCountryZodSchema.safeParse(countryString);
    if (validationResult.success) {
        return validationResult.data;
    }
    return null;
};

const pickCompanyTariffGridCountry = (
    companyCountry: Company["country"]
): TariffGridCountryCode => {
    const validationResult = availableCountryZodSchema.safeParse(companyCountry.toLowerCase());
    if (validationResult.success) {
        return validationResult.data;
    }
    return DEFAULT_COUNTRY;
};

type LocalZoneType = "COUNTRY" | "TARIFF_GRID_AREA_ID" | "CITY_OR_POSTCODE" | "ADDRESS";

const getLocalZoneType = (zone: TariffGridZone): LocalZoneType => {
    if (
        zone.zone_type === "PLACE" &&
        zone.place.city === "" &&
        zone.place.postcode_prefix === ""
    ) {
        return "COUNTRY";
    }

    if (zone.zone_type === "PLACE") {
        return "CITY_OR_POSTCODE";
    }

    return zone.zone_type;
};

export const ExtendedZonePopover: FC<{
    children: React.ReactElement;
    isOpen: boolean;
    zone: TariffGridZone | null;
    tariffGridZones?: TariffGridZone[];
    onSubmit: (zone: TariffGridZone) => unknown;
    onClose: () => unknown;
    onDelete?: () => unknown;
    getErrorMessage?: (zone: TariffGridZone | null) => string | undefined;
}> = ({children, isOpen, zone, tariffGridZones, onClose, onSubmit, onDelete, getErrorMessage}) => {
    const connectedCompany = useSelector(getConnectedCompany);
    const allTariffGridAreas = useTariffGridZones();

    const [localZoneType, setLocalZoneType] = useState<LocalZoneType>(() => {
        if (zone !== null) {
            return getLocalZoneType(zone);
        }

        if (tariffGridZones !== undefined && tariffGridZones.length > 0) {
            return getLocalZoneType(tariffGridZones[tariffGridZones.length - 1]);
        }

        return "CITY_OR_POSTCODE";
    });

    const zoneTypeDisplayDict: Record<LocalZoneType, string> = {
        COUNTRY: t("common.country"),
        TARIFF_GRID_AREA_ID: t("tariffGrids.departmentOrCounty"),
        CITY_OR_POSTCODE: t("tariffGrids.cityAndPostcode"),
        ADDRESS: t("tariffGrid.addressFromBook"),
    };
    const [address, setAddress] = useState<TariffGridAddress["address"] | undefined>(() => {
        if (zone !== null && zone.zone_type === "ADDRESS") {
            return zone.address;
        }
        return undefined;
    });
    const [addressKey, setAddressKey] = useState("");

    const getInitialCountry = () => {
        if (zone !== null && allTariffGridAreas !== undefined) {
            const countryFromZone = getZoneCountry(zone, allTariffGridAreas);
            if (countryFromZone !== null) {
                return countryFromZone;
            }
        }
        if (connectedCompany === null) {
            return DEFAULT_COUNTRY;
        }
        return pickCompanyTariffGridCountry(connectedCompany.country);
    };

    const [country, setCountry] = useState<TariffGridCountryCode>(getInitialCountry);

    const [placeCountry, setPlaceCountry] = useState<string>(getInitialCountry().toUpperCase());
    const [placeCountryKey, setPlaceCountryKey] = useState("");

    const [place, setPlace] = useState<PlaceForTariffGridZone | undefined>(() => {
        if (zone !== null && zone.zone_type === "PLACE") {
            return zone.place;
        }
        return undefined;
    });

    const countryZones =
        allTariffGridAreas === undefined
            ? []
            : Object.entries(allTariffGridAreas)
                  .map(([key, value]) => ({
                      id: key,
                      ...value,
                  }))
                  .filter(({country: zoneCountry}) => zoneCountry === country)
                  .sort((a, b) => a.name.localeCompare(b.name));

    const [zoneId, setZoneId] = useState<string | null>(() => {
        if (zone !== null && zone.zone_type === "TARIFF_GRID_AREA_ID") {
            return zone.area.uid;
        }
        return countryZones.length > 0 ? countryZones[0].id : null;
    });

    /** Build the tariff grid zone based on the component states */
    const buildCurrentTariffGridZone = (): TariffGridZone | null => {
        if (localZoneType === "TARIFF_GRID_AREA_ID") {
            if (zoneId === null || allTariffGridAreas === undefined) {
                return null;
            }
            return {
                id: null,
                zone_type: "TARIFF_GRID_AREA_ID",
                area: {
                    uid: zoneId,
                    name: allTariffGridAreas[zoneId].name,
                },
            };
        }
        if (localZoneType === "CITY_OR_POSTCODE") {
            return place === undefined
                ? null
                : {
                      id: null,
                      zone_type: "PLACE",
                      place: place,
                  };
        }
        if (localZoneType === "COUNTRY") {
            return {
                id: null,
                zone_type: "PLACE",
                place: {
                    country: placeCountry,
                    city: "",
                    postcode_prefix: "",
                },
            };
        }
        //  (localZoneType === "ADDRESS")
        return address === undefined
            ? null
            : {
                  id: null,
                  zone_type: "ADDRESS",
                  address: address,
              };
    };

    const currentTariffGridZone = buildCurrentTariffGridZone();

    const error = getErrorMessage?.(currentTariffGridZone);

    const handleSubmit = () => {
        if (error !== undefined || currentTariffGridZone === null) {
            return;
        }

        onSubmit(currentTariffGridZone);

        // Update case or no tariff grid zones
        if (zone !== null || tariffGridZones === undefined) {
            return;
        }

        // Creation case
        // According to the current tariff grid zone type we either reset the value or take the next value.
        // For PLACES and ADDRESS we reset the value to undefined.
        // For TARIFF_GRID_AREA_ID we take the next value in the list.
        if (currentTariffGridZone.zone_type === "TARIFF_GRID_AREA_ID") {
            const selectedAreas = tariffGridZones
                .filter((zone) => zone.zone_type === "TARIFF_GRID_AREA_ID")
                .map((zone: TariffGridArea) => zone.area.uid);
            const onlyUnselectedZones = countryZones.filter(
                (zone) => !selectedAreas.includes(zone.id)
            );

            setZoneId((prevZoneId) => {
                // compute and set the next localZoneId to use
                const index = onlyUnselectedZones.findIndex((zone) => zone.id === prevZoneId);
                if (index + 1 < onlyUnselectedZones.length) {
                    const newLocalZoneId = onlyUnselectedZones[index + 1].id;
                    return newLocalZoneId;
                } else if (index - 1 >= 0) {
                    const newLocalZoneId = onlyUnselectedZones[index - 1].id;
                    return newLocalZoneId;
                }
                return prevZoneId;
            });
        } else if (currentTariffGridZone.zone_type === "PLACE") {
            setPlace(undefined);
            setPlaceCountryKey(guid());
        } else if (currentTariffGridZone.zone_type === "ADDRESS") {
            setAddress(undefined);
            setAddressKey(guid());
        }
    };

    return (
        <Popover
            visibility={{
                isOpen,
                onOpenChange: (value) => {
                    if (!value) {
                        onClose();
                    }
                },
            }}
            placement="right-end"
            fallbackAxisSideDirection="end"
        >
            <Popover.Trigger>{children}</Popover.Trigger>
            <Popover.Content minWidth={"400px"} minHeight={"250px"} overflow={"visible"} p={0}>
                <Flex
                    onClick={(event) => {
                        event.stopPropagation();
                    }}
                    flexGrow={1}
                    width={"100%"}
                    flexDirection="column"
                    data-testid="extended-zone-popover"
                >
                    <Flex
                        flexGrow={1}
                        borderBottom={onDelete ? "1px solid" : undefined}
                        flexDirection={"column"}
                        borderBottomColor={onDelete ? "grey.light" : undefined}
                        style={{gap: 10}}
                        p={4}
                    >
                        <Flex flexDirection={"row"} width={"100%"} justifyContent={"stretch"}>
                            <Flex flexGrow={1} flexDirection={"column"}>
                                <Select<{value: LocalZoneType; label: string}, false>
                                    data-testid="tariff-grid-zone-type-select"
                                    value={{
                                        value: localZoneType,
                                        label: zoneTypeDisplayDict[localZoneType],
                                    }}
                                    isClearable={false}
                                    isSearchable={false}
                                    onChange={(option) => {
                                        if (option === null) {
                                            return;
                                        }
                                        setLocalZoneType(option.value);
                                    }}
                                    label={t("tariffGrids.zoneType")}
                                    options={Object.entries(zoneTypeDisplayDict).map(
                                        ([key, translation]) => ({
                                            value: key as LocalZoneType,
                                            label: translation,
                                        })
                                    )}
                                />
                            </Flex>
                            {localZoneType === "TARIFF_GRID_AREA_ID" && (
                                <Flex flexGrow={1} flexDirection={"column"} marginLeft={4}>
                                    <TariffGridCountrySelect
                                        value={country}
                                        onChange={setCountry}
                                        isClearable={false}
                                    />
                                </Flex>
                            )}
                        </Flex>
                        {localZoneType === "COUNTRY" && (
                            <SelectCountry
                                key={placeCountryKey}
                                data-testid="tariff-grid-country-select"
                                value={placeCountry}
                                onChange={setPlaceCountry}
                                label={t("common.country")}
                                isClearable={false}
                                autoFocus={true}
                            />
                        )}
                        {localZoneType === "ADDRESS" && (
                            <AddressSelect
                                key={addressKey}
                                data-testid={"tariff-grid-zone-address-select"}
                                label={t("tariffGrid.address")}
                                categories={[]}
                                value={address}
                                onChange={(address) =>
                                    setAddress(
                                        address === undefined
                                            ? undefined
                                            : {
                                                  id: address.pk,
                                                  name: address.name ?? "",
                                                  ...address,
                                              }
                                    )
                                }
                                isClearable={true}
                                disableExtractedInfo={true}
                                autoFocus={true}
                                styles={{
                                    menuPortal: (base) => ({
                                        ...base,
                                        zIndex: theme.zIndices.topbar,
                                    }),
                                }}
                            />
                        )}
                        {localZoneType === "TARIFF_GRID_AREA_ID" && (
                            <ZoneSelect
                                key={zoneId}
                                country={country}
                                zoneId={zoneId ?? undefined}
                                onChange={setZoneId}
                            />
                        )}
                        {localZoneType === "CITY_OR_POSTCODE" && (
                            <TariffGridPlaceSelect
                                key={
                                    place &&
                                    `${place.city}-${place?.postcode_prefix}-${place.country}`
                                }
                                place={place}
                                onChange={setPlace}
                            />
                        )}
                        <Flex flexGrow={1}></Flex>
                        {error && <Text color="red.default">{error}</Text>}
                        <Flex flexDirection={"row"} justifyContent={"end"}>
                            <Button
                                data-testid="popover-validate-button"
                                type="button"
                                variant={"primary"}
                                onClick={(event) => {
                                    event.stopPropagation();
                                    handleSubmit();
                                }}
                                disabled={currentTariffGridZone === null || error !== undefined}
                            >
                                {t("common.validate")}
                            </Button>
                        </Flex>
                    </Flex>
                    {onDelete && (
                        <Flex p={2}>
                            <IconButton
                                name={"bin"}
                                label={t("common.delete")}
                                onClick={onDelete}
                                data-testid="popover-delete-button"
                            />
                        </Flex>
                    )}
                </Flex>
            </Popover.Content>
        </Popover>
    );
};

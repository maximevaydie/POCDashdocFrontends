import {t} from "@dashdoc/web-core";
import {
    Box,
    Flex,
    Link,
    Text,
    Select,
    TextInput,
    SelectOption,
    LoadingWheel,
} from "@dashdoc/web-ui";
import {Trailer, Vehicle, FleetItem} from "dashdoc-utils";
import capitalize from "lodash.capitalize";
import React, {useCallback, useEffect, useMemo, useState} from "react";
import {useHistory} from "react-router";

import {
    destroyTelematicVehicleLink,
    fetchTelematicLinkList,
    fetchTelematicVehicleLink,
    TelematicVehicleLink,
    updateOrCreateTelematicVehicleLink,
} from "app/redux/actions";

type TelematicVehicleLinkForForm = Pick<TelematicVehicleLink, "vendor_id" | "vendor_name">;

export const useTelematicFleetForm = (
    fleet: Vehicle | Trailer | undefined,
    fleetCategory: FleetItem["type"] | undefined,
    onTelematicLinkChange: (link: TelematicVehicleLinkForForm) => void
) => {
    const vehicleEligibleForTelematic = fleetCategory === "vehicle";

    const [telematicVehicle, setTelematicVehicle] = useState(
        fleetCategory == "vehicle" ? (fleet as Vehicle)?.telematic_vehicle : undefined
    );

    const [telematicVendors, setTelematicVendors] = useState<string[] | "loading">("loading");
    const [initialTelematicLink, setInitialTelematicLink] = useState<
        TelematicVehicleLinkForForm | "loading"
    >("loading");

    const submitTelematic = useCallback(
        async (vehiclePk: number, link: TelematicVehicleLinkForForm) => {
            if (vehicleEligibleForTelematic && link.vendor_name && link.vendor_id) {
                const data = {
                    vehicle: {pk: vehiclePk},
                    vendor_name: link.vendor_name,
                    vendor_id: link.vendor_id,
                };
                await updateOrCreateTelematicVehicleLink(data, telematicVehicle);
            } else if (
                initialTelematicLink !== "loading" &&
                initialTelematicLink.vendor_name &&
                !link.vendor_name
            ) {
                await destroyTelematicVehicleLink(telematicVehicle);
            }
        },
        [initialTelematicLink, telematicVehicle, vehicleEligibleForTelematic]
    );

    const fetchTelematicsLinks = async () => {
        const links_response = await fetchTelematicLinkList();
        setTelematicVendors(links_response.map((value) => value.vendor_name));
    };

    const fetchVehicleTelematicLink = async () => {
        if (telematicVehicle) {
            // Get telematic vehicle for this vehicle if any
            try {
                const telematicLink = await fetchTelematicVehicleLink(telematicVehicle);
                setInitialTelematicLink(telematicLink);
                onTelematicLinkChange(telematicLink);
            } catch (error) {
                // If the error is a 404; ignore it and let
                // the user create a new telematic vehicle.
                // This can happen if it has been deleted from
                // the backend but redux has not refreshed.
                if (error.status == 404) {
                    // This will make the form behave as POST
                    setTelematicVehicle(undefined);
                } else {
                    throw error;
                }
            }
        }
    };

    // On Mount
    useEffect(() => {
        if (vehicleEligibleForTelematic) {
            fetchTelematicsLinks();
            fetchVehicleTelematicLink();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {
        submitTelematic,
        telematicVendors,
        vehicleEligibleForTelematic,
    };
};

export type TelematicFleetFormProps = {
    telematicVendors: string[] | "loading";
    vendorNameError?: string;
    vendorIdError?: string;
    vendorName: string;
    vendorId: string;
    setVendorName: (vendorName: string) => void;
    setVendorId: (vendorId: string) => void;
};

export default function TelematicFleetForm({
    telematicVendors,
    vendorNameError,
    vendorIdError,
    vendorName,
    vendorId,
    setVendorName,
    setVendorId,
}: TelematicFleetFormProps) {
    const history = useHistory();

    const vendorChoices = useMemo(() => {
        return telematicVendors === "loading"
            ? []
            : telematicVendors.map((name) => {
                  return {
                      value: name,
                      label: capitalize(name),
                  };
              });
    }, [telematicVendors]);

    if (telematicVendors === "loading") {
        return <LoadingWheel noMargin={true} />;
    }

    if (telematicVendors.length === 0) {
        return (
            <Text variant="subcaption">
                {t("telematic.noConnector")}
                <Link onClick={() => history.push(`/app/settings/telematic/`)} ml={1}>
                    {t("common.gotosettings")}
                </Link>
            </Text>
        );
    }

    return (
        <Flex my={4}>
            <Box width="50%">
                <Select
                    label={t("telematic.selectVehicleTelematicVendor")}
                    error={vendorNameError}
                    name="telematic_vendor_name"
                    options={vendorChoices}
                    value={
                        vendorName
                            ? {
                                  value: vendorName,
                                  label: capitalize(vendorName),
                              }
                            : undefined
                    }
                    onChange={(option: SelectOption<string>) => {
                        let value = option?.value ?? "";
                        setVendorName(value);
                        if (value === "") {
                            setVendorId("");
                        }
                    }}
                />
            </Box>
            <Box width="50%" ml={4}>
                <TextInput
                    label={t("telematic.vehicleTelematicID")}
                    onChange={setVendorId}
                    error={vendorIdError}
                    value={vendorId}
                />
            </Box>
        </Flex>
    );
}

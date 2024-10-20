import {getConnectedCompany, updateCompanySettings} from "@dashdoc/web-common";
import {Logger, t} from "@dashdoc/web-core";
import {Box, Button, ModeDescription, ModeTypeSelector, Text, toast} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import React, {useMemo, useState} from "react";

import {useDispatch, useSelector} from "app/redux/hooks";

import {DataBrokerHelp} from "./DataBrokerHelp";
import {DataBroker} from "./types";

export function UpdateDataBrokerAction() {
    const company = useSelector(getConnectedCompany);
    const [isSaving, setIsSaving, setIsSaved] = useToggle();
    const dispatch = useDispatch();

    let storedDataBroker: DataBroker = "mobile";
    if (company?.settings?.geofencing_tracking) {
        storedDataBroker = "geofencing";
    }
    const [dataBroker, setDataBroker] = useState(storedDataBroker);

    const dataBrokers: ModeDescription<DataBroker>[] = useMemo(
        () => [
            {
                value: "mobile",
                label: t("common.viaMobileApp"),
                icon: "mobilePhone",
            },
            {
                value: "geofencing",
                label: t("common.viaTelematicData"),
                icon: "telematicConnection",
            },
        ],
        []
    );

    return (
        <Box data-testid={`data-broker-${storedDataBroker}`}>
            <Text variant="h2" mt={4} mb={2}>
                {t("common.updateStatuses")}
            </Text>
            <ModeTypeSelector
                modeList={dataBrokers}
                currentMode={dataBroker}
                disabled={isSaving}
                setCurrentMode={setDataBroker}
            />
            <Box mt={4}>
                <DataBrokerHelp dataBroker={dataBroker} />
            </Box>
            <Button
                ml={"auto"}
                my={4}
                onClick={handleSave}
                data-testid="update-data-broker-button"
                disabled={isSaving}
            >
                {t("common.save")}
            </Button>
        </Box>
    );

    async function handleSave() {
        if (!company) {
            Logger.error("Can't submit here telematics settings update without a company");
            toast.error(t("common.error"));
            return;
        }
        setIsSaving();
        const value = dataBroker === "geofencing";
        await dispatch(
            updateCompanySettings({
                companyId: company.pk,
                settings: {
                    geofencing_tracking: value,
                },
            })
        );
        setIsSaved();
    }
}

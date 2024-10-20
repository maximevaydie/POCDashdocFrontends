import {
    apiService,
    getConnectedCompany,
    getConnectedManagerId,
    useFeatureFlag,
    useTimezone,
    type ShipperInTransport,
} from "@dashdoc/web-common";
import {Address, Company, ConfirmationExtractedData} from "dashdoc-utils";
import pick from "lodash.pick";
import uniqBy from "lodash.uniqby";
import {useCallback, useEffect, useMemo, useState} from "react";

import {partnerService} from "app/features/address-book/partner.service";
import {
    getConfirmationExtractedActivities,
    getDefaultAddress,
    getDefaultShipper,
    getInitialActivityData,
    getInitialFormContext,
} from "app/features/transport/transport-form/transport-form-initial-values";
import {useCompaniesInConnectedGroupView} from "app/hooks/useCompaniesInConnectedGroupView";
import {useSelector} from "app/redux/hooks";

import {getFormValuesFromTransport} from "../mappings";
import {getContextFromTransport} from "../transport-form-context";

import type {
    ShipperAndContacts,
    TransportFormValues,
} from "app/features/transport/transport-form/transport-form.types";
import type {Transport} from "app/types/transport";

type Props = {
    initialValues: {
        initialShipper?: ShipperInTransport;
        initialShipperAddress?: Address;
    };
    originalTransport: Transport | undefined;
    confirmationExtractedData: ConfirmationExtractedData;
    isOrder: boolean;
    isCreatingTemplate: boolean;
    isComplexMode: boolean;
    isDuplicating: boolean;
    setLoading: (value: boolean) => void;
    setError: (value: string) => void;
};

export function useTransportInitialValues({
    initialValues,
    originalTransport,
    confirmationExtractedData,
    isOrder,
    isCreatingTemplate,
    isComplexMode,
    isDuplicating,
    setLoading,
    setError,
}: Props): TransportFormValues {
    const connectedCompany = useSelector(getConnectedCompany);
    const defaultRole = connectedCompany?.settings?.default_role;
    const companiesFromConnectedGroupView = useCompaniesInConnectedGroupView();
    const hasBetterCompanyRolesEnabled = useFeatureFlag("betterCompanyRoles");
    const primaryAddress: Address | undefined = useMemo(() => {
        if (!connectedCompany?.primary_address) {
            return undefined;
        }
        return {
            ...connectedCompany.primary_address,
            company: pick(connectedCompany, [
                "name",
                "pk",
                "is_verified",
                "settings",
                "siren",
                "trade_number",
                "vat_number",
            ]) as Company,
        };
    }, [connectedCompany]);
    const timezone = useTimezone();

    const [prefilledData, setPrefilledData] = useState<TransportFormValues | null>();
    const managerPk = useSelector(getConnectedManagerId);

    const formContext = useMemo(
        () =>
            originalTransport
                ? getContextFromTransport({
                      isDuplicating,
                      transport: originalTransport,
                      companyPk: connectedCompany!.pk,
                      isCreatingTemplate,
                      isComplexMode,
                  })
                : getInitialFormContext(isOrder, isCreatingTemplate, isDuplicating),
        [
            originalTransport,
            isDuplicating,
            connectedCompany,
            isCreatingTemplate,
            isComplexMode,
            isOrder,
        ]
    );

    const defaultShipperAddress = useMemo(() => {
        if (primaryAddress) {
            return getDefaultAddress("shipper", formContext.isOrder, primaryAddress, defaultRole);
        }
        return undefined;
    }, [primaryAddress, defaultRole, formContext.isOrder]);

    const defaultShipperInTransport = useMemo(() => {
        if (connectedCompany) {
            const shipper = partnerService.fromCompanyToShipperInTransport(connectedCompany);
            return getDefaultShipper(formContext.isOrder, shipper, defaultRole);
        }
        return undefined;
    }, [connectedCompany, defaultRole, formContext.isOrder]);

    const fillFormWithExistingTransport = useCallback(
        async (transport: Transport) => {
            let formValues = null;
            try {
                formValues = await getFormValuesFromTransport(
                    transport,
                    formContext,
                    connectedCompany,
                    companiesFromConnectedGroupView,
                    hasBetterCompanyRolesEnabled,
                    isComplexMode
                );

                if (formValues) {
                    setPrefilledData(formValues);
                }
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        },
        [
            companiesFromConnectedGroupView,
            connectedCompany,
            formContext,
            isComplexMode,
            setError,
            setLoading,
            hasBetterCompanyRolesEnabled,
        ]
    );

    const fillUsingDuplicatedTransportOrTemplate = useCallback(() => {
        let promises: Promise<any>[] = [];

        // Check for trucker to still exist for duplication
        // If the check fails, trucker is removed from the copy.

        // Retrieve all unique truckers pks
        const uniqueTruckersPks = uniqBy(originalTransport!.segments, "trucker.pk")
            .filter(Boolean)
            .map((segment) => segment.trucker?.pk)
            .filter(Boolean);
        // Retrieve trucker details for each pk
        uniqueTruckersPks.forEach((truckerPk) => {
            promises.push(apiService.get(`/manager-truckers/${truckerPk}/`, {apiVersion: "v4"}));
        });

        // Catch promise errors to be able to know what trucker doesn't exist anymore
        Promise.all(promises.map((promise) => promise.catch(Error))).then((results: any[]) => {
            results.forEach((result, index) => {
                // For each pk failed, browser through the transport's segment and remove the related trucker
                if (result instanceof Error) {
                    originalTransport!.segments.forEach((segment) => {
                        if (segment.trucker?.pk === uniqueTruckersPks[index]) {
                            // @ts-ignore
                            delete segment.trucker;
                        }
                    });
                }
            });
            fillFormWithExistingTransport(originalTransport!);
        });
    }, [originalTransport, fillFormWithExistingTransport]);

    useEffect(() => {
        if (originalTransport) {
            fillUsingDuplicatedTransportOrTemplate();
        } else {
            setPrefilledData(null);
        }
    }, [fillUsingDuplicatedTransportOrTemplate, originalTransport]);

    const confirmationExtractedShipperAddress =
        confirmationExtractedData.shipper_addresses.length === 1
            ? confirmationExtractedData.shipper_addresses[0]
            : undefined;

    const defaultLoading = useMemo(
        () => getInitialActivityData((managerPk ?? "").toString(), "loading"),
        [managerPk]
    );
    const defaultUnloading = useMemo(
        () => getInitialActivityData((managerPk ?? "").toString(), "unloading"),
        [managerPk]
    );

    const initialDelivery = useMemo(
        () => ({
            loadingUid: defaultLoading.uid,
            unloadingUid: defaultUnloading.uid,
            loads: [],
        }),
        [defaultLoading.uid, defaultUnloading.uid]
    );

    let confirmationExtractedLoadings = useMemo(
        () =>
            getConfirmationExtractedActivities(
                confirmationExtractedData,
                "loading",
                defaultLoading,
                managerPk,
                0,
                timezone
            ),
        [confirmationExtractedData, defaultLoading, managerPk, timezone]
    );
    const confirmationExtractedUnloadings = useMemo(
        () =>
            getConfirmationExtractedActivities(
                confirmationExtractedData,
                "unloading",
                defaultUnloading,
                managerPk,
                confirmationExtractedLoadings.length,
                timezone
            ),
        [confirmationExtractedData, defaultUnloading, managerPk, timezone]
    );

    if (prefilledData) {
        return prefilledData;
    }

    if (confirmationExtractedLoadings.length > 1 && confirmationExtractedUnloadings.length > 1) {
        // creation form does not handle multiple loadings and unloadings
        // so in that case we only select one loading
        confirmationExtractedLoadings = [confirmationExtractedLoadings[0]];
    }

    let initialShipper: ShipperInTransport | undefined = initialValues.initialShipper;
    if (!initialShipper) {
        if (defaultShipperAddress) {
            initialShipper = defaultShipperInTransport;
        } else {
            //TODO: Do we need to do something related to the extracted data?
        }
    }

    let initialShipperAddress: Address | undefined = initialValues.initialShipperAddress;
    if (!initialShipperAddress) {
        if (defaultShipperAddress) {
            initialShipperAddress = defaultShipperAddress;
        } else {
            //TODO: OriginalAddress is not compatible with Address
            initialShipperAddress = confirmationExtractedShipperAddress as any as Address;
        }
    }

    const shipper: ShipperAndContacts = {
        shipper: initialShipper,
        address: initialShipperAddress,
        contact: undefined,
        contacts: [],
        reference: "",
    };

    return {
        templateName: formContext.isTemplate ? "" : undefined,
        shipper,
        trips: [
            {
                activityUids: [defaultLoading.uid, defaultUnloading.uid],
                means: null,
            },
        ],
        deliveries: [initialDelivery],
        activities: {
            [defaultLoading.uid]: defaultLoading,
            [defaultUnloading.uid]: defaultUnloading,
        },
        orderedActivitiesUids: [],
        loadings: confirmationExtractedLoadings.length
            ? confirmationExtractedLoadings
            : [defaultLoading],
        unloadings: confirmationExtractedUnloadings.length
            ? confirmationExtractedUnloadings
            : [defaultUnloading],
        loads: [],
        supportExchanges: [],
        means: undefined,
        price: null,
        settings: {
            businessPrivacy: false,
            volumeDisplayUnit: "m3",
            transportOperationCategory: undefined,
        },
        instructions: "",
    };
}

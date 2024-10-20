import {
    AnalyticsEvent,
    analyticsService,
    apiService,
    companyService,
    getConnectedCompany,
    getConnectedManager,
    getErrorMessageFromServerError,
    HasFeatureFlag,
    HasNotFeatureFlag,
    useBaseUrl,
    useFeatureFlag,
    useTimezone,
    type ShipperInTransport,
} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {
    Box,
    Button,
    ButtonWithShortcut,
    Card,
    ConfirmationModal,
    ErrorMessage,
    Flex,
    FullHeightMinWidthScreen,
    Icon,
    LoadingWheel,
    TabTitle,
    Text,
    TextInput,
    toast,
} from "@dashdoc/web-ui";
import {
    APIVersion,
    Company,
    companyIsQualimat,
    ConfirmationExtractedData,
    isEmptyPricing,
    Tag,
    TrackDechetsApi,
    useToggle,
    type Address,
    type SimpleContact,
    type SlimCompany,
    type TransportMessagePost,
} from "dashdoc-utils";
import {FormikHelpers, FormikProvider, FormikTouched, useFormik, type FormikErrors} from "formik";
import isEmpty from "lodash.isempty";
import isNil from "lodash.isnil";
import React, {FunctionComponent, useCallback, useEffect, useMemo, useRef, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {useHistory, useLocation, useParams} from "react-router";
import createPersistedState from "use-persisted-state";

import {getTabTranslations} from "app/common/tabs";
import {TagSection} from "app/features/core/tags/TagSection";
import {fuelSurchargeService} from "app/features/pricing/fuel-surcharges/services/fuelSurcharge.service";
import {InvoiceItemSuggestionArguments} from "app/features/pricing/invoices/invoice-item/invoice-item-suggestion";
import {
    TariffGridApplicationInfo,
    TransportForTariffGridsMatching,
} from "app/features/pricing/tariff-grids/types";
import {AddressAndContactPickerDeprecated} from "app/features/transport/transport-form/address-and-contacts-picker/AddressAndContactPickerDeprecated";
import {AddressAndContactsPicker} from "app/features/transport/transport-form/address-and-contacts-picker/AddressAndContactsPicker";
import {ShipperAndContactsPicker} from "app/features/transport/transport-form/address-and-contacts-picker/ShipperAndContactsPicker";
import {TransportFormNotices} from "app/features/transport/transport-form/TransportFormNotices";
import useDebouncedCallback from "app/hooks/useDebouncedCallback";
import {useRefreshTransportLists} from "app/hooks/useRefreshTransportLists";
import {useCompaniesInConnectedGroupView} from "app/hooks/useCompaniesInConnectedGroupView";
import {useMatchingTariffGrids} from "app/hooks/useMatchingTariffGrids";
import {useSlimCompany} from "app/hooks/useSlimCompany";
import {
    fetchAddDocument,
    fetchAddTransport,
    fetchAddTransportTemplate,
    fetchUpdateTransportTemplate,
} from "app/redux/actions";
import {TariffGridLineForm, tariffGridMatchingService} from "app/services/invoicing";
import {
    confirmationExtractedDataService,
    DuplicationParams,
    massDuplicateTransport,
    transportRightService,
    transportViewerService,
} from "app/services/transport";
import {SidebarTabNames} from "app/types/constants";

import TransportDuplicationTypeModal from "../actions/TransportDuplicationTypeModal";
import {isEqualDeliveries} from "../load/load-form/load-form.helpers";

import {ActivitiesOverview} from "./activity/ActivitiesOverview";
import {ComplexSection} from "./complex-section/ComplexSection";
import {useTransportInitialValues} from "./hooks/useTransportInitialValues";
import {LoadsOverview} from "./loads/LoadsOverview";
import {getTransportOrTemplateFromFormValues} from "./mappings";
import {MeansFormPanel} from "./means/MeansFormPanel";
import {MeansOverview} from "./means/MeansOverview";
import {PriceFormPanel} from "./price/PriceFormPanel";
import {PriceOverview} from "./price/PriceOverview";
import {ReferenceField} from "./ReferenceField";
import {RightPanel} from "./RightPanel";
import {SupportExchangesOverview} from "./support-exchanges/SupportExchangeOverview";
import {
    getContextFromTransport,
    getFormContextUpdates,
    TransportFormContext,
} from "./transport-form-context";
import {getInitialFormContext, useInitialPriceData} from "./transport-form-initial-values";
import {
    updateLoadsSmartSuggestionsMap,
    useSmartSuggestAddresses,
} from "./transport-form-smart-suggestions";
import {
    AutoFilledMeansFields,
    CreateTransportResponse,
    FormLoad,
    TransportFormActivity,
    TransportFormContextData,
    TransportFormDeliveryOption,
    TransportFormMeans,
    TransportFormSupportExchange,
    TransportPost,
    TransportTemplatePost,
    TransportToCreateDeprecated,
    type ShipperAndContacts,
    type TransportFormValues,
} from "./transport-form.types";
import {getReadableErrors, getTransportValidationSchema} from "./transport-form.validation";
import {TransportFormEditingItem} from "./TransportFormEditionButtons";

import type {Transport, TransportWithCarrierPk} from "app/types/transport";

const GROUP_SIMILAR_ACTIVITIES_STORAGE_KEY = "transportForm.groupSimilarActivities";
const groupSimilarActivitiesState = createPersistedState(
    GROUP_SIMILAR_ACTIVITIES_STORAGE_KEY,
    sessionStorage
);

const trackDechetsApi = new TrackDechetsApi(apiService);

export const TEST_ID_PREFIX = "transport-form-";

export type TransportCreationFormProps = {
    isComplex: boolean;
    isOrder: boolean;
    isCreatingTemplate?: boolean;
    isDuplicating: boolean;
    submitType?: "edit" | "new";
    initialValues: {
        initialShipper?: ShipperInTransport;
        initialShipperAddress?: Address;
    };
};

export const getTransportShape = (
    loadings: TransportFormActivity[],
    unloadings: TransportFormActivity[]
): Transport["shape"] => {
    return loadings.length > 1 ? "grouping" : unloadings.length > 1 ? "ungrouping" : "simple";
};

function getTransportWithCarrierPk(
    means: TransportFormMeans | undefined,
    hasBetterCompanyRolesEnabled: boolean
): TransportWithCarrierPk | null {
    let transport: TransportWithCarrierPk | null = null;
    if (hasBetterCompanyRolesEnabled) {
        if (means?.carrier?.carrier) {
            transport = {carrier: means.carrier.carrier};
        }
    } else {
        if (means?.carrier?.address?.company.pk) {
            transport = {carrier: {pk: means.carrier.address.company.pk}};
        }
    }
    return transport;
}

/** Tells whether the company will be the carrier of the newly created transport*/
export function isCarrierOf(
    company: Company | null,
    means: TransportFormMeans | undefined,
    hasBetterCompanyRolesEnabled: boolean
): boolean {
    if (!means || !means.carrier) {
        if (company?.settings?.default_role === "carrier") {
            return true;
        }
        return false;
    }
    const transport = getTransportWithCarrierPk(means, hasBetterCompanyRolesEnabled);
    return transportViewerService.isCarrierOf(transport, company?.pk);
}

function isCarrierGroupOf(
    companyPks: number[],
    means: TransportFormMeans | undefined,
    hasBetterCompanyRolesEnabled: boolean
): boolean {
    if (!means || !means.carrier) {
        return false;
    }
    const transport = getTransportWithCarrierPk(means, hasBetterCompanyRolesEnabled);
    return transportViewerService.isCarrierGroupOf(transport, companyPks);
}

const defaultConfirmationExtractedData = {
    shipper_addresses: [],
    loading_addresses: [],
    unloading_addresses: [],
    codes: [],
    slots: [],
    document: "",
    document_name: "",
};

export const TransportForm: FunctionComponent<TransportCreationFormProps> = ({
    isComplex,
    isOrder,
    isCreatingTemplate = false,
    isDuplicating,
    submitType = "new",
    initialValues,
}) => {
    const history = useHistory();
    const location = useLocation();
    const dispatch = useDispatch();
    const tab = useMemo(() => {
        if (isCreatingTemplate) {
            return submitType === "new"
                ? SidebarTabNames.NEW_TEMPLATE
                : SidebarTabNames.TEMPLATE_EDITION;
        }
        if (isComplex) {
            return isOrder
                ? SidebarTabNames.NEW_ORDER_COMPLEX
                : SidebarTabNames.NEW_TRANSPORT_COMPLEX;
        }
        return isOrder ? SidebarTabNames.NEW_ORDER : SidebarTabNames.NEW_TRANSPORT;
    }, [isComplex, isCreatingTemplate, isOrder, submitType]);

    const manager = useSelector(getConnectedManager)!;
    const company = useSelector(getConnectedCompany);
    const companiesFromConnectedGroupView = useCompaniesInConnectedGroupView();
    const timezone = useTimezone();
    const [error, setError] = useState<string>();

    // EDITING SUBFORMS
    const [editingItem, setEditingItem] = useState<TransportFormEditingItem>({field: null});

    // TRANSPORT DATA INITIALIZATION
    const routeParams: {transportUid: string; transportTemplateUid: string} = useParams();
    const duplicateUid = routeParams.transportUid;
    const transportTemplateUid = routeParams.transportTemplateUid;
    const searchParams = new URLSearchParams(location.search);
    const confirmationUid = searchParams.get("confirmationUid");
    const [originalTransport, setOriginalTransport] = useState<Transport>();

    const [confirmationExtractedData, setConfirmationExtractedData] =
        useState<ConfirmationExtractedData>(defaultConfirmationExtractedData);
    const [tags, setTags] = useState<Tag[]>([]);
    const [isLoading, setLoading] = useState<boolean>(!!duplicateUid || !!transportTemplateUid);
    const [isfetchingExtractedData, setFetchingExtractedData] = useState<boolean>(
        confirmationUid !== null
    );
    const isReady = !isLoading && !isfetchingExtractedData;

    const [isReinitializeEnabled, enableReinitialize, disableReinitialize] = useToggle(true);
    useEffect(() => {
        if (isReady) {
            /**
             * Disable reinitialization when the data is ready
             */
            disableReinitialize();
        }
    }, [isReady, disableReinitialize]);

    useEffect(() => {
        if (!!duplicateUid || !!transportTemplateUid) {
            enableReinitialize();
        }
    }, [transportTemplateUid, duplicateUid, enableReinitialize]);

    const [isSubmitting, setSubmitting] = useState<boolean>(false);

    // FORM HEIGHT
    const [formHeight, setFormHeight] = useState(0);
    const headerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setFormHeight(headerRef.current?.clientHeight ?? 36);
    }, [tags]);

    // FORM CONTEXT
    const [groupSimilarActivities, setGroupSimilarActivities] = groupSimilarActivitiesState(true);
    const [formContext, setFormContext] = useState<TransportFormContextData>(
        getInitialFormContext(
            isOrder,
            isCreatingTemplate,
            isDuplicating,
            groupSimilarActivities,
            setGroupSimilarActivities
        )
    );

    const updateFormContext = useCallback((values: Partial<TransportFormContextData>) => {
        setFormContext((previousContext) => {
            return {...previousContext, ...values};
        });
    }, []);

    // EXTRACTED DATA FROM CONFIRMATION DOCUMENT
    useEffect(() => {
        const fetchConfirmationExtractedData = async (confirmationUid: string | null) => {
            try {
                if (confirmationUid) {
                    try {
                        const fetchedConfirmationExtractedData =
                            await apiService.ConfirmationDocuments.getExtractedData(
                                confirmationUid
                            );
                        setConfirmationExtractedData(fetchedConfirmationExtractedData);
                    } catch {
                        toast.error(t("common.error"));
                        setConfirmationExtractedData(defaultConfirmationExtractedData);
                    }
                } else {
                    setConfirmationExtractedData(defaultConfirmationExtractedData);
                }
            } finally {
                setFetchingExtractedData(false);
            }
        };

        fetchConfirmationExtractedData(confirmationUid);
    }, [confirmationUid]);

    const shipperAutoFocus =
        !isCreatingTemplate &&
        !(confirmationExtractedData.shipper_addresses.length === 1) &&
        !duplicateUid &&
        !transportTemplateUid;

    // DUPLICATION
    const [duplicateModalTransport, setDuplicateModalTransport] = useState<{
        transportNumber: number;
        transportUid: string;
    } | null>();

    const fillTransportFromTemplate = useCallback(async () => {
        try {
            const transport = (await apiService.get(
                `/transport-templates/${transportTemplateUid}/`,
                {
                    apiVersion: "web",
                }
            )) as Transport | null;

            if (!transport) {
                toast.error(t("common.error"));
                return;
            }

            updateFormContext(
                getContextFromTransport({
                    transport,
                    companyPk: company!.pk,
                    isComplexMode: isComplex,
                    isCreatingTemplate,
                    isDuplicating,
                })
            );
            setOriginalTransport(transport);
            setTags(transport?.tags || []);
        } catch {
            toast.error(t("common.error"));
        }
    }, [
        company,
        isComplex,
        isCreatingTemplate,
        isDuplicating,
        transportTemplateUid,
        updateFormContext,
    ]);

    const fillDuplicateTransport = useCallback(async () => {
        try {
            const transport = (await apiService.get(`/transports/${duplicateUid}/`, {
                apiVersion: "web",
            })) as Transport | null;

            if (!transport) {
                toast.error(t("common.error"));
                return;
            }

            updateFormContext(
                getContextFromTransport({
                    transport,
                    isDuplicating: true,
                    companyPk: company!.pk,
                    isComplexMode: isComplex,
                    isCreatingTemplate,
                })
            );
            setOriginalTransport(transport);
            setTags(transport?.tags || []);
        } catch {
            toast.error(t("common.error"));
        }
    }, [company, duplicateUid, isComplex, isCreatingTemplate, updateFormContext]);

    useEffect(() => {
        if (duplicateUid) {
            setLoading(true);
            fillDuplicateTransport();
        }
        if (transportTemplateUid) {
            setLoading(true);
            fillTransportFromTemplate();
        }
    }, [transportTemplateUid, duplicateUid, fillDuplicateTransport, fillTransportFromTemplate]);

    // SMART SUGGEST
    const [automaticMeansEnabled, setAutomaticMeansEnabled] = useState<boolean>(
        !transportTemplateUid && !duplicateUid
    );
    const [autoFilledMeansFields, setAutoFilledMeansFields] =
        useState<AutoFilledMeansFields | null>(null);
    const [lastAssociatedMeansRequestStatus, setLastAssociatedMeansRequestStatus] =
        useState<string>();
    const [predictiveMeansField, setPredictiveMeansField] = useState<
        "trucker" | "trailer" | "vehicle"
    >();

    const {
        automaticOriginAddresses,
        automaticDestinationAddresses,
        fillSuggestedAddresses,
        fillSuggestedOriginAddressesFromShipper,
    } = useSmartSuggestAddresses();

    const transportListRefresher = useRefreshTransportLists();

    const getSubmitFunction = useCallback(
        (
            apiVersion: APIVersion
        ): ((
            transport: TransportToCreateDeprecated | TransportPost | TransportTemplatePost
        ) => unknown) => {
            return (t: TransportToCreateDeprecated) => {
                if (isCreatingTemplate) {
                    if (submitType == "edit") {
                        return fetchUpdateTransportTemplate(t, transportTemplateUid, apiVersion);
                    } else {
                        return fetchAddTransportTemplate(t, apiVersion);
                    }
                } else {
                    return fetchAddTransport(t, apiVersion);
                }
            };
        },
        [isCreatingTemplate, submitType, transportTemplateUid]
    );

    const goToTransportDetails = useCallback(
        (transportUid: string, isOrder = false) => {
            history.block(() => {});
            window.scrollTo(0, 0);
            let transportsOrOrders = "transports";
            if (isOrder) {
                transportsOrOrders = "orders";
            }
            history.push(`/app/${transportsOrOrders}/${transportUid}/`);
            transportListRefresher(/*onlyCounters*/ true);
        },
        [history, transportListRefresher]
    );

    const baseUrl = useBaseUrl();
    const goToShipperTransportTemplates = useCallback(
        (shipperPk: number | undefined) => {
            if (!shipperPk) {
                return;
            }
            history.block(() => {});
            window.scrollTo(0, 0);
            history.push(
                `${companyService.getPartnerLink(baseUrl, shipperPk)}?tab=shipper-template`
            );
        },
        [history, baseUrl]
    );

    const addOrUpdateAnalytics = (
        transport: TransportToCreateDeprecated | TransportPost,
        key: string,
        value: string | boolean
    ) => {
        if (!transport) {
            throw "transport should not be null";
        }

        if (!transport.analytics) {
            transport.analytics = {};
        }

        transport.analytics[key] = value;
    };

    // Under this feature flag we enable multi-contacts for shipper and carrier.
    const hasRecipientsOrderEnabled = useFeatureFlag("recipientsOrder");
    const hasBetterCompanyRolesEnabled = useFeatureFlag("betterCompanyRoles");

    const handleSubmitTransport = useCallback(
        async (
            values: TransportFormValues,
            {setFieldError}: FormikHelpers<TransportFormValues>
        ): Promise<CreateTransportResponse | null> => {
            setSubmitting(true);
            const isCarrierOfTransport = isCarrierOf(
                company,
                values.means,
                hasBetterCompanyRolesEnabled
            );

            let transportPayload = null;
            try {
                transportPayload = await getTransportOrTemplateFromFormValues(
                    values,
                    formContext,
                    company,
                    hasRecipientsOrderEnabled,
                    hasBetterCompanyRolesEnabled,
                    isCarrierOfTransport,
                    companiesFromConnectedGroupView,
                    isComplex,
                    isCreatingTemplate
                );
            } catch (error) {
                setError(error.message);
                setSubmitting(false);
                return null;
            }

            if (!transportPayload) {
                setSubmitting(false);
                return null;
            }

            const {transportOrTemplate, sitesNeedingEta} = transportPayload;

            if (!isCreatingTemplate) {
                addOrUpdateAnalytics(
                    transportOrTemplate as TransportPost,
                    "has_price",
                    !isEmptyPricing(transportOrTemplate.quotation ?? null)
                );
            }

            let response:
                | (CreateTransportResponse & {
                      error?: object;
                  })
                | null = null;
            try {
                response = (await dispatch(
                    getSubmitFunction("web")(transportOrTemplate)
                )) as CreateTransportResponse;
            } catch (error) {
                const errorMessage = await getErrorMessageFromServerError(error);
                if (errorMessage === t("transportTemplates.errorMessages.duplicateName")) {
                    setFieldError(
                        "templateName",
                        t("transportTemplates.errorMessages.duplicateName")
                    );
                } else {
                    setError(errorMessage);
                }
                setSubmitting(false);
                return null;
            }

            if (response.error) {
                const errorMessage = await getErrorMessageFromServerError(response.error);
                setError(errorMessage);
                setSubmitting(false);
                return null;
            }

            analyticsService.sendEvent(AnalyticsEvent.managerCreatedTransport, {
                "company id": company?.pk,
                "is staff": manager?.user.is_staff,
                "field triggering prediction": predictiveMeansField
                    ? `${predictiveMeansField} field`
                    : "none",
                "transport uid": response.uid,
                "user kept trucker prediction": !!autoFilledMeansFields?.trucker,
                "user kept vehicle prediction": !!autoFilledMeansFields?.vehicle,
                "user kept trailer prediction": !!autoFilledMeansFields?.trailer,
                "is from duplication": !!duplicateUid,
                "minimum one mean of transport":
                    !!values.means?.trucker || !!values.means?.vehicle || !!values.means?.trailer,
                "means prediction request status": lastAssociatedMeansRequestStatus,
            });

            if (transportOrTemplate.quotation?.tariff_grid_line) {
                analyticsService.sendEvent(AnalyticsEvent.tariffGridAppliedToTransport, {
                    "company id": company?.pk,
                    "transport uid": response.uid,
                    "original uid of tariff grid":
                        transportOrTemplate.quotation.tariff_grid_line.tariff_grid_version_uid,
                });
            }

            if (sitesNeedingEta) {
                for (const siteUid of sitesNeedingEta) {
                    try {
                        await apiService.post(`/sites/${siteUid}/enable-eta/`);
                    } catch {
                        toast.error(t("eta.error.failedToEnable"));
                    }
                }
            }

            try {
                await apiService.patch(
                    `/transports/${response.uid}/tags/`,
                    {tags},
                    {
                        apiVersion: "v4",
                    }
                );
            } catch (error) {
                toast.error(t("error.failedToAddTags"));
            }

            const wasteManifest = values.settings.wasteManifest;

            if (wasteManifest) {
                try {
                    await trackDechetsApi.fetchCreateTrackDechets(wasteManifest, response.uid);
                } catch (error) {
                    toast.error(t("error.failedToAddWasteManifest"));
                }
            }

            if (confirmationUid) {
                // link transport to confirmation document
                try {
                    await apiService.ConfirmationDocuments.postSetTransport(confirmationUid, {
                        transport: response.uid,
                    });
                } catch {
                    toast.error(t("common.error"));
                }

                // create transport message from confirmation document
                try {
                    // create file from url
                    const fetchedDocument = await fetch(confirmationExtractedData.document);
                    const documentData = await fetchedDocument.blob();
                    const metadata = {
                        type: ".pdf",
                    };
                    const file = new File(
                        [documentData],
                        confirmationExtractedData.document_name,
                        metadata
                    );

                    // post transport message
                    const documentPayload: TransportMessagePost = {
                        document: file,
                        type: "document",
                        document_type: "confirmation",
                        document_title: confirmationExtractedData.document_name,
                        reference: "",
                        site: null,
                    };
                    await dispatch(fetchAddDocument(response.uid, documentPayload));
                } catch {
                    //do nothing
                }

                analyticsService.sendEvent(AnalyticsEvent.transportCreatedFromPdf, {
                    "company id": company?.pk,
                    "is staff": manager?.user.is_staff,
                    "transport uid": response.uid,
                    ...confirmationExtractedDataService.getTransportCreatedFromPdfAnalyticsEventData(
                        confirmationExtractedData,
                        values,
                        timezone,
                        hasBetterCompanyRolesEnabled
                    ),
                });
            }
            setSubmitting(false);
            return response;
        },
        [
            company,
            isCreatingTemplate,
            formContext,
            hasRecipientsOrderEnabled,
            companiesFromConnectedGroupView,
            isComplex,
            manager?.user.is_staff,
            predictiveMeansField,
            autoFilledMeansFields?.trucker,
            autoFilledMeansFields?.vehicle,
            autoFilledMeansFields?.trailer,
            duplicateUid,
            lastAssociatedMeansRequestStatus,
            tags,
            confirmationUid,
            dispatch,
            getSubmitFunction,
            confirmationExtractedData,
            timezone,
            hasBetterCompanyRolesEnabled,
        ]
    );

    const transportInitialValues = useTransportInitialValues({
        initialValues,
        originalTransport,
        confirmationExtractedData,
        isOrder,
        isCreatingTemplate,
        isComplexMode: isComplex,
        isDuplicating,
        setLoading,
        setError,
    });

    const formik = useFormik({
        initialValues: transportInitialValues,
        enableReinitialize: isReinitializeEnabled,
        validationSchema: getTransportValidationSchema(
            isCreatingTemplate,
            isComplex,
            hasBetterCompanyRolesEnabled
        ),
        onSubmit: handleSubmitTransport,
    });

    useEffect(() => {
        // update form context
        if (isReady && !isSubmitting) {
            const updates = getFormContextUpdates(
                formik.values,
                formContext,
                isComplex,
                groupSimilarActivities
            );
            if (!isEmpty(updates)) {
                updateFormContext(updates);
            }
        }
    }, [formik.values, groupSimilarActivities]);

    const shipperAddressPk = hasBetterCompanyRolesEnabled
        ? formik.values.shipper?.shipper?.administrative_address.pk
        : formik.values.shipper?.address
          ? (formik.values.shipper.address?.original ?? formik.values.shipper.address?.pk)
          : undefined;

    const shipperAddressName = hasBetterCompanyRolesEnabled
        ? formik.values.shipper?.shipper?.name
        : formik.values.shipper.address?.name;

    useEffect(() => {
        if (hasBetterCompanyRolesEnabled) {
            fillSuggestedOriginAddressesFromShipper(
                formik.values.shipper?.shipper?.pk,
                formik.values.shipper?.shipper?.name
            );
        } else {
            fillSuggestedAddresses("shipper_address", shipperAddressPk, shipperAddressName);
        }
    }, [
        hasBetterCompanyRolesEnabled,
        fillSuggestedAddresses,
        fillSuggestedOriginAddressesFromShipper,
        shipperAddressPk,
        shipperAddressName,
        formik.values.shipper?.shipper?.pk,
        formik.values.shipper?.shipper?.name,
    ]);

    useEffect(() => {
        // fill automaticDestinationAddresses in case of copy (will only be used for not complex transport)
        if (originalTransport) {
            for (const delivery of originalTransport.deliveries) {
                const address = delivery.origin.address;
                if (address?.original) {
                    fillSuggestedAddresses(
                        "origin_address",
                        address?.original,
                        address?.company ? address?.company.name : address?.name
                    );
                    break;
                }
            }
        }
    }, [originalTransport]);

    const carrierAndLoadsAreCompatibleRegardingQualimat = useCallback(() => {
        function qualimatInActions() {
            for (let load of formik.values.loads) {
                if (load?.category === "bulk_qualimat") {
                    return true;
                }
            }
            return false;
        }
        const qualimatInLoads = qualimatInActions();
        if (hasBetterCompanyRolesEnabled) {
            const carrier = formik.values.means?.carrier?.carrier;
            return !(carrier && !carrier.enforce_qualimat_standard && qualimatInLoads);
        } else {
            const company = formik.values.means?.carrier?.address?.company;
            return !(company && !companyIsQualimat(company as Company) && qualimatInLoads);
        }
        return true;
    }, [
        formik.values.loads,
        formik.values.means?.carrier?.address,
        formik.values.means?.carrier?.carrier,
        hasBetterCompanyRolesEnabled,
    ]);

    const hasDangerousLoads = isComplex
        ? formik.values.deliveries.some((delivery) =>
              delivery.loads.some((load) => load?.is_dangerous)
          )
        : formik.values.loads.some((load) => load?.is_dangerous);

    const initialShipperPk: number | undefined = hasBetterCompanyRolesEnabled
        ? initialValues.initialShipper?.pk
        : initialValues.initialShipperAddress?.company?.pk;

    const onCancel = useCallback(() => {
        if (isCreatingTemplate) {
            if (initialShipperPk) {
                goToShipperTransportTemplates(initialShipperPk);
            } else {
                // Only to robustify the code.
                // In this case, we don't have the shipper pk, we can't set an explicit redirection
                history.goBack();
            }
            return;
        }
        history.push("/app/transports/");
    }, [isCreatingTemplate, history, initialShipperPk, goToShipperTransportTemplates]);

    const confirmationBeforeLeaving = useMemo(() => {
        return {
            template: {
                edit: {
                    title: t("transportForm.leave.template.edit.title"),
                    message: t("transportForm.leave.template.edit.message"),
                    submitButton: t("common.leave"),
                },
                new: {
                    title: t("transportForm.leave.template.new.title"),
                    message: t("transportForm.leave.template.new.message"),
                    submitButton: t("common.deleteAndLeave"),
                },
            },
            transport: {
                title: t("transportForm.leave.transport.title"),
                message: t("transportForm.leave.transport.message"),
                submitButton: t("common.deleteAndLeave"),
            },
            order: {
                title: t("transportForm.leave.order.title"),
                message: t("transportForm.leave.order.message"),
                submitButton: t("common.deleteAndLeave"),
            },
        };
    }, []);
    const [shouldConfirmLeaving, setShouldConfirmLeaving] = useState(false);
    const [currentPath, setCurrentPath] = useState<any>();
    useEffect(() => {
        history.block((prompt) => {
            if (
                formik.dirty &&
                location.pathname + location.search !== prompt.pathname + prompt.search &&
                !prompt.pathname.includes("/app/transports/new-from-template/")
            ) {
                setCurrentPath(prompt);
                setShouldConfirmLeaving(true);
            } else {
                history.block(() => {});
                history.push(prompt);
            }
            return false;
        });
        return () => {
            history.block(() => {});
        };
    }, [history, location, formik?.dirty]);

    const confirmLeave = useCallback(async () => {
        history.block(() => {});
        history.push(currentPath);
        setShouldConfirmLeaving(false);
    }, [currentPath, history]);

    const cancelLeave = useCallback(async () => {
        setShouldConfirmLeaving(false);
    }, []);

    const confirmationBeforeLeavingLabels = useMemo(() => {
        if (isOrder) {
            return confirmationBeforeLeaving.order;
        }
        if (isCreatingTemplate) {
            return confirmationBeforeLeaving.template[submitType];
        }
        return confirmationBeforeLeaving.transport;
    }, [isOrder, isCreatingTemplate, submitType, confirmationBeforeLeaving]);

    const isCarrierOfTransport = isCarrierOf(
        company,
        formik.values.means,
        hasBetterCompanyRolesEnabled
    );
    const transportCarrier: SlimCompany | undefined = isCarrierOfTransport
        ? (company ?? undefined)
        : hasBetterCompanyRolesEnabled
          ? (formik.values.means?.carrier?.carrier ?? undefined)
          : //TODO: Partial<Company> is not compatible with SlimCompany
            (formik.values.means?.carrier?.address?.company as SlimCompany | undefined);

    const requestedVehicle = formik.values.means?.requestedVehicle;
    const isCarrierGroupOfTransport = isCarrierGroupOf(
        companiesFromConnectedGroupView,
        formik.values.means,
        hasBetterCompanyRolesEnabled
    );
    const isOwnerOfCurrentFuelSurchargeAgreement =
        fuelSurchargeService.isOwnerOfPricingFormFuelSurchargeAgreement(
            formik.values.price?.quotation,
            company
        );

    const onSubmitAndRedirect = useDebouncedCallback(
        async () => {
            try {
                const transport = (await formik.submitForm()) as CreateTransportResponse | null;
                if (!transport) {
                    return;
                }

                if (isCreatingTemplate) {
                    if (hasBetterCompanyRolesEnabled) {
                        goToShipperTransportTemplates(formik.values.shipper?.shipper?.pk);
                    } else {
                        goToShipperTransportTemplates(formik.values.shipper?.address?.company?.pk);
                    }
                    return;
                }
                const isOrder = !isCarrierOfTransport;
                goToTransportDetails(transport.uid, isOrder);
            } catch {
                toast.error(t("common.error"));
            }
        },
        300,
        [
            formik,
            goToShipperTransportTemplates,
            goToTransportDetails,
            confirmationUid,
            isCarrierOfTransport,
            hasBetterCompanyRolesEnabled,
        ]
    );

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const onDuplicate = useDebouncedCallback(
        async () => {
            try {
                const transport = (await formik.submitForm()) as CreateTransportResponse | null;
                if (transport) {
                    history.block(() => {});
                    setDuplicateModalTransport({
                        transportUid: transport.uid,
                        transportNumber: transport.sequential_id,
                    });
                }
            } catch {
                toast.error(t("common.error"));
            }
        },
        300,
        [formik, history]
    );

    const handleCloseDuplicationModal = (cancelled: boolean) => {
        if (cancelled && duplicateModalTransport) {
            goToTransportDetails(duplicateModalTransport.transportUid);
        }
        setDuplicateModalTransport(null);
    };

    /**
     * Handles the closure of the modal
     * Both called on modal close or submit
     * @param {DuplicationParams} [params] - Params for duplication API
     */
    const handleMassDuplicateModalClose = async (params?: DuplicationParams) => {
        let response = null;

        if (!duplicateModalTransport) {
            return response;
        }

        if (params) {
            response = await massDuplicateTransport(duplicateModalTransport.transportUid, params);
        }
        goToTransportDetails(duplicateModalTransport.transportUid);
        return response;
    };

    const deliveries: TransportFormDeliveryOption[] = useMemo(() => {
        return formik.values.loadings
            .map((loadingActivity: TransportFormActivity, loadingIndex: number) => {
                return formik.values.unloadings.map(
                    (unloadingActivity: TransportFormActivity, unloadingIndex: number) => {
                        return {
                            loadingActivity: {
                                ...loadingActivity,
                                index: loadingIndex,
                            },
                            unloadingActivity: {
                                ...unloadingActivity,
                                index: unloadingIndex,
                            },
                        };
                    }
                );
            })
            .flat();
    }, [formik.values.loadings, formik.values.unloadings]);

    // SECTION - Tariff grids
    const hasFuelSurchargesAndTariffGridsManagementEnabled = useFeatureFlag(
        "fuelSurchargesAndTariffGridsManagement"
    );

    const carrierPk: number | null = hasBetterCompanyRolesEnabled
        ? (formik.values.means?.carrier?.carrier?.pk ?? null)
        : (formik.values.means?.carrier?.address?.company?.pk ?? null);
    const transportWithCarrierPk: TransportWithCarrierPk = {
        carrier: carrierPk ? {pk: carrierPk} : null,
    };
    const canCreateCustomerToInvoice = transportRightService.canCreateCustomerToInvoice(
        transportWithCarrierPk,
        company?.pk,
        companiesFromConnectedGroupView
    );
    const canEditCustomerToInvoice = isCarrierOfTransport || canCreateCustomerToInvoice;

    const shipperPk: number | undefined = hasBetterCompanyRolesEnabled
        ? (formik.values.shipper?.shipper?.pk ?? undefined)
        : (formik.values.shipper?.address?.company?.pk ?? undefined);
    const invoiceItemSuggestionArguments: InvoiceItemSuggestionArguments = useMemo(
        () => ({
            shipperId: shipperPk,
        }),
        [shipperPk]
    );

    /**Stores the current transport parameters needed to determine matching tariff grids */
    const matchingGridArguments: TransportForTariffGridsMatching | null = useMemo(() => {
        if (!hasFuelSurchargesAndTariffGridsManagementEnabled) {
            return null;
        }

        // TODO: Partial<Company> is not compatible with SlimCompany
        const shipper: SlimCompany | undefined = hasBetterCompanyRolesEnabled
            ? formik.values.shipper?.shipper
            : (formik.values.shipper?.address?.company as SlimCompany | undefined);

        return tariffGridMatchingService.getMatchingGridArgumentsForTransportCreation(
            isCarrierOfTransport ? "PRICING" : "QUOTATION",
            shipper,
            transportCarrier,
            formik.values.price?.invoicingAddress?.company?.pk,
            deliveries,
            formik.values.loads,
            timezone,
            requestedVehicle
        );
    }, [
        timezone,
        transportCarrier,
        isCarrierOfTransport,
        hasFuelSurchargesAndTariffGridsManagementEnabled,
        hasBetterCompanyRolesEnabled,
        formik.values.shipper?.shipper,
        formik.values.shipper?.address?.company,
        formik.values.price?.invoicingAddress?.company,
        formik.values.loads,
        deliveries,
        requestedVehicle,
    ]);

    /**Stores the matching tariff grids for the current transport parameters */
    const matchingTariffGrids = useMatchingTariffGrids(matchingGridArguments);

    const shipperSlimCompany = useSlimCompany(
        hasBetterCompanyRolesEnabled
            ? formik.values.shipper?.shipper
            : //TODO: Partial<Company> is not compatible with Company
              (formik.values.shipper?.address?.company as any as Company | undefined)
    );
    const initialPriceData = useInitialPriceData(canEditCustomerToInvoice, shipperSlimCompany);

    /** The main function that handle automatic updates of a tariff grid.
     * It contains the core business logic of frontend autoapplication of tariff grids.
     *
     * Note that we need to handle three possible current tariff grid states:
     * 1. [**UNSPECIFIED**] No tariff grid is currently specified. This is the case if:
     *     - The tariff grid value of the current quotation is `undefined`
     * 2. [**REQUIRED NULL**] It is requested that the current transport has no tariff grid. This is the case if:
     *     - The tariff grid value of the current quotation is `null`
     * 3. [**SPECIFIED**] A tariff grid is currently specified. This is the case if:
     *     - The tariff grid value of the current quotation is a valid tariff grid type.
     */
    const updateTariffGrids = (
        hasFuelSurchargesAndTariffGridsManagementEnabled: boolean,
        matchingTariffGrids: TariffGridApplicationInfo[],
        currentTariffGridLine: TariffGridLineForm | undefined | null,
        setTariffGridLine: (tariffGridLine: TariffGridLineForm | undefined | null) => unknown
    ) => {
        if (!hasFuelSurchargesAndTariffGridsManagementEnabled) {
            return;
        }
        if (currentTariffGridLine === null) {
            return;
        }

        // Process matches
        if (matchingTariffGrids.length === 0) {
            setTariffGridLine(undefined);
            return;
        }
        if (matchingTariffGrids.length === 1) {
            // Do not auto-apply a grid if there's another pricing line
            const lines = formik.values.price?.quotation?.lines;
            if (lines !== undefined && lines.length > 0) {
                setTariffGridLine(currentTariffGridLine); // re-apply existing line, see #18186
                return;
            }

            // Copy the is_gas_indexed value from the current tariff grid line, if any.
            // Otherwise, the default should be true.
            const tariffGridLineForm = tariffGridMatchingService.gridApplicationInfoToGridLineForm(
                matchingTariffGrids[0]
            );
            tariffGridLineForm.is_gas_indexed = currentTariffGridLine?.is_gas_indexed ?? true;

            setTariffGridLine(tariffGridLineForm);
            return;
        }

        // Let's see if the current tariff grid is still matching (and if so get the new application infos)
        if (currentTariffGridLine === undefined) {
            return;
        }
        const currentTariffGridUid = currentTariffGridLine.tariff_grid_version_uid;
        const currentTariffGridMatchingInfos = matchingTariffGrids.find(
            (matchingTariffGrid) =>
                matchingTariffGrid.tariff_grid_version_uid === currentTariffGridUid
        );
        if (currentTariffGridMatchingInfos === undefined) {
            setTariffGridLine(undefined);
            return;
        }
        const newTariffGridLineForm = tariffGridMatchingService.gridApplicationInfoToGridLineForm(
            currentTariffGridMatchingInfos
        );

        // Copy the is_gas_indexed value from the current tariff grid line
        newTariffGridLineForm.is_gas_indexed = currentTariffGridLine.is_gas_indexed;
        setTariffGridLine(newTariffGridLineForm);
    };

    /** Sets the tariff grid line in the form.
     *
     * Handles what to do if the form price of quotation is undefined */
    const setTariffGridLine = (tariffGridLine: TariffGridLineForm | undefined | null) => {
        if (tariffGridLine === undefined) {
            if (formik.values.price?.quotation?.tariff_grid_line === undefined) {
                return;
            }
            formik.setFieldValue("price.quotation.tariff_grid_line", undefined);
            return;
        }
        if (isNil(formik.values.price)) {
            // In this case we have to rebuild a whole price object
            const price = initialPriceData;
            if (isNil(price.quotation)) {
                return; // this should not happen if the correct FF are enable so we don't do anything
            }
            price.quotation.tariff_grid_line = tariffGridLine;
            formik.setFieldValue("price", price);
            return;
        }
        if (isNil(formik.values.price.quotation)) {
            // In this case we have to rebuild a whole quotation object
            const quotation = initialPriceData.quotation;
            if (isNil(quotation)) {
                return; // this should not happen if the correct FF are enable so we don't do anything
            }
            quotation.tariff_grid_line = tariffGridLine;
            formik.setFieldValue("price.quotation", quotation);
            return;
        }
        formik.setFieldValue("price.quotation.tariff_grid_line", tariffGridLine);
    };

    //ANCHOR - The frontend auto matching grid mechanism
    useEffect(() => {
        updateTariffGrids(
            hasFuelSurchargesAndTariffGridsManagementEnabled,
            matchingTariffGrids,
            formik.values.price?.quotation?.tariff_grid_line,
            setTariffGridLine
        );
    }, [hasFuelSurchargesAndTariffGridsManagementEnabled, matchingTariffGrids]);

    //!SECTION

    const activities: TransportFormActivity[] = useMemo(() => {
        return isComplex
            ? Object.values(formik.values.activities)
            : [...formik.values.loadings, ...formik.values.unloadings];
    }, [formik.values.activities, formik.values.loadings, formik.values.unloadings, isComplex]);

    useEffect(() => {
        // Delete loads linked to a deleted delivery
        let updatedLoads = formik.values.loads.map((load: FormLoad) => ({
            ...load,
            delivery: deliveries.find((delivery: TransportFormDeliveryOption) =>
                isEqualDeliveries(delivery, load.delivery)
            ),
        }));
        updatedLoads = updatedLoads.filter((load: FormLoad) => load.delivery !== undefined);
        formik.setFieldValue("loads", updatedLoads);

        if (deliveries.length > 1 && formik.values.settings.businessPrivacy) {
            formik.setFieldValue("settings.businessPrivacy", false);
            toast.warning(t("transportForm.businessPrivacyDeactivatedWarning"));
        }
    }, [deliveries]);

    useEffect(() => {
        // Delete support exchanges linked to deleted activities
        const updatedSupportExchange = formik.values.supportExchanges.filter(
            (supportExchange: TransportFormSupportExchange) =>
                activities.some(
                    (activity: TransportFormActivity) =>
                        supportExchange.activity.uid === activity.uid
                )
        );
        formik.setFieldValue("supportExchanges", updatedSupportExchange);

        // fetch and populate loads smart suggestions
        async function populateLoadsSmartSuggestions() {
            const updatedLoadsSmartSuggestionsMap = await updateLoadsSmartSuggestionsMap(
                activities,
                formContext.loadsSmartSuggestionsMap
            );
            if (
                updatedLoadsSmartSuggestionsMap?.size !== formContext.loadsSmartSuggestionsMap.size
            ) {
                updateFormContext({loadsSmartSuggestionsMap: updatedLoadsSmartSuggestionsMap});
            }
        }
        populateLoadsSmartSuggestions();
    }, [activities]);

    let hasPrice = false;
    if (formik.values.price?.quotation) {
        hasPrice = !isEmptyPricing(formik.values.price?.quotation);
    }

    let hasPurchaseCosts = false;
    if (formik.values.price?.purchaseCosts) {
        hasPurchaseCosts = !isEmptyPricing(formik.values.price?.purchaseCosts);
    }

    if (!companyService.isCompanyInfoFilled(company)) {
        return (
            <Card
                m="auto"
                p={5}
                maxWidth="600px"
                width="100%"
                display="flex"
                justifyContent="center"
                alignItems="center"
                flexDirection="column"
                data-testid="new-form-no-address"
            >
                <Text mb={4}>
                    <Icon name="warning" color="yellow.default" mr={1} />
                    {t("transportsForm.missingCompanyAddress")}
                </Text>
                <Button
                    variant="primary"
                    onClick={() => history.push("/app/settings/company/")}
                    data-testid="go-to-company-address"
                >
                    {t("transportsForm.enterCompanyAddress")}
                </Button>
            </Card>
        );
    }

    const getSubmitLabel = () => {
        if (submitType === "edit") {
            return t("common.save");
        }
        if (isOrder) {
            return t("transportForm.createOrder");
        }
        if (isCreatingTemplate) {
            return t("transportForm.createTemplate");
        }

        // Keep only formik.values.means when reverting https://github.com/dashdoc/dashdoc/pull/18236
        const means = formik.values?.trips[0]?.means || formik.values?.means;

        const sendToTrucker = !!means?.sendToTrucker;
        const isTrucker = !!means?.trucker;
        return isTrucker && sendToTrucker
            ? t("transportForm.createTransportAndSendMission")
            : t("transportForm.createTransport");
    };

    return (
        <TransportFormContext.Provider value={formContext}>
            <FullHeightMinWidthScreen>
                <Box
                    maxWidth="1600px"
                    width="100%"
                    px={3}
                    height="calc(100% - 64px)"
                    marginX="auto"
                    mb={3}
                >
                    <Flex style={{gap: "16px"}} alignItems="center" ref={headerRef}>
                        <TabTitle title={getTabTranslations(tab)} />
                        <TagSection
                            tags={tags}
                            onAdd={(tag) => setTags([...tags, tag])}
                            onDelete={(tag) =>
                                setTags(
                                    tags.filter((t) => {
                                        const key = tag?.pk ? "pk" : "name";
                                        return t[key] !== tag[key];
                                    })
                                )
                            }
                        />
                    </Flex>
                    {(!isReady || isSubmitting) && (
                        <Box
                            position="absolute"
                            top={0}
                            bottom={0}
                            right={0}
                            left={0}
                            zIndex="level2"
                            backgroundColor="neutral.lighterTransparentBlack"
                            data-testid={`${TEST_ID_PREFIX}loading-wheel`}
                        >
                            <LoadingWheel />
                        </Box>
                    )}
                    <FormikProvider value={formik}>
                        <Flex mt={3} maxHeight={`calc(100% - ${formHeight + 20}px)`} height="100%">
                            <Card
                                flex={3}
                                mr={3}
                                p={5}
                                overflow={editingItem.field ? "clip" : "auto"}
                            >
                                <TransportFormNotices
                                    cannotVerifyQualimatCertification={
                                        !carrierAndLoadsAreCompatibleRegardingQualimat()
                                    }
                                    hasBusinessPrivacy={formik.values.settings.businessPrivacy}
                                    hasDangerousLoads={hasDangerousLoads}
                                />

                                {isCreatingTemplate && (
                                    <Box mb={4}>
                                        <Text variant="h1" mb={2}>
                                            {t("common.template")}
                                        </Text>
                                        <TextInput
                                            value={formik.values.templateName ?? ""}
                                            onChange={(value) =>
                                                formik.setFieldValue("templateName", value)
                                            }
                                            onBlur={() => formik.setFieldTouched("templateName")}
                                            label={t("transportTemplates.templateNameLabel")}
                                            data-testid={`${TEST_ID_PREFIX}template-name-textfield`}
                                            error={
                                                formik.touched.templateName &&
                                                (formik.errors.templateName as string)
                                            }
                                            required
                                            autoFocus={true}
                                        />
                                    </Box>
                                )}
                                <Text variant="h1" mb={2}>
                                    {t("common.shipper")}
                                </Text>
                                {/* SHIPPER FORM */}
                                <HasFeatureFlag flagName="betterCompanyRoles">
                                    <ShipperAndContactsPicker
                                        direction="row"
                                        shipper={formik.values.shipper?.shipper ?? null}
                                        onShipperChange={(value) => {
                                            formik.setFieldValue("shipper.shipper", value);
                                            if (value) {
                                                setTimeout(() =>
                                                    formik.setFieldError(
                                                        "shipper.shipper",
                                                        undefined
                                                    )
                                                );
                                            }
                                        }}
                                        shipperError={
                                            (
                                                formik.touched.shipper as
                                                    | FormikTouched<ShipperAndContacts>
                                                    | undefined
                                            )?.shipper
                                                ? getReadableErrors(
                                                      formik.errors
                                                          .shipper as FormikErrors<ShipperAndContacts>
                                                  )
                                                : undefined
                                        }
                                        contactsError={
                                            (
                                                formik.touched.shipper as
                                                    | FormikTouched<ShipperAndContacts>
                                                    | undefined
                                            )?.contacts
                                                ? getReadableErrors(
                                                      formik.errors
                                                          .shipper as FormikErrors<ShipperAndContacts>
                                                  )
                                                : undefined
                                        }
                                        onTouchedContacts={() =>
                                            formik.setFieldTouched("shipper.contacts")
                                        }
                                        shipperDisabled={isOrder}
                                        isRequired={true}
                                        key={`shipper extracted data ${confirmationExtractedData.shipper_addresses[0]?.pk}`} //extracted data part is needed to recompute select options when extracted shipper address is loaded
                                        autoFocus={shipperAutoFocus}
                                        contacts={formik.values.shipper?.contacts || []}
                                        onContactsChange={(contacts: SimpleContact[]) => {
                                            formik.setFieldValue("shipper.contacts", contacts);
                                        }}
                                    />
                                </HasFeatureFlag>
                                <HasNotFeatureFlag flagName="betterCompanyRoles">
                                    <HasFeatureFlag flagName="recipientsOrder">
                                        <AddressAndContactsPicker
                                            field="shipper"
                                            address={formik.values.shipper.address ?? null}
                                            onAddressChange={(value) => {
                                                formik.setFieldValue("shipper.address", value);
                                                if (value) {
                                                    setTimeout(() =>
                                                        formik.setFieldError(
                                                            "shipper.address",
                                                            undefined
                                                        )
                                                    );
                                                }
                                            }}
                                            addressRequiredError={
                                                formik.touched.shipper?.address
                                                    ? getReadableErrors(
                                                          formik.errors.shipper?.address
                                                      )
                                                    : undefined
                                            }
                                            contactsError={
                                                formik.touched.shipper?.contacts
                                                    ? getReadableErrors(
                                                          formik.errors.shipper?.contacts
                                                      )
                                                    : undefined
                                            }
                                            onTouchedField={(field) =>
                                                formik.setFieldTouched(`shipper.${field}`)
                                            }
                                            isAddressDisabled={isOrder}
                                            isRequired={true}
                                            key={`shipper_address extracted data ${confirmationExtractedData.shipper_addresses[0]?.pk}`} //extracted data part is needed to recompute select options when extracted shipper address is loaded
                                            autoFocus={shipperAutoFocus}
                                            autoSelectContactIfOnlyOne={
                                                !duplicateUid && !transportTemplateUid
                                            }
                                            contacts={formik.values.shipper?.contacts || null}
                                            onContactsChange={(contacts: SimpleContact[]) => {
                                                formik.setFieldValue("shipper.contacts", contacts);
                                            }}
                                            confirmationExtractedAddresses={
                                                confirmationExtractedData.shipper_addresses
                                            }
                                            displayTooltip
                                        />
                                    </HasFeatureFlag>
                                    <HasNotFeatureFlag flagName="recipientsOrder">
                                        <AddressAndContactPickerDeprecated
                                            field="shipper"
                                            address={formik.values.shipper.address ?? null}
                                            contact={formik.values.shipper.contact ?? null}
                                            onAddressChange={(value) => {
                                                formik.setFieldValue("shipper.address", value);
                                                if (value) {
                                                    setTimeout(() =>
                                                        formik.setFieldError(
                                                            "shipper.address",
                                                            undefined
                                                        )
                                                    );
                                                }
                                            }}
                                            onContactChange={(value) =>
                                                formik.setFieldValue("shipper.contact", value)
                                            }
                                            addressRequiredError={
                                                formik.touched.shipper?.address
                                                    ? getReadableErrors(
                                                          formik.errors.shipper?.address
                                                      )
                                                    : undefined
                                            }
                                            contactsError={
                                                formik.touched.shipper?.contacts
                                                    ? getReadableErrors(
                                                          formik.errors.shipper?.contacts
                                                      )
                                                    : undefined
                                            }
                                            onTouchedField={(field) =>
                                                formik.setFieldTouched(`shipper.${field}`)
                                            }
                                            isAddressDisabled={isOrder}
                                            isRequired={true}
                                            key={`shipper_address extracted data ${confirmationExtractedData.shipper_addresses[0]?.pk}`} //extracted data part is needed to recompute select options when extracted shipper address is loaded
                                            autoFocus={shipperAutoFocus}
                                            autoSelectContactIfOnlyOne={
                                                !duplicateUid && !transportTemplateUid
                                            }
                                            confirmationExtractedAddresses={
                                                confirmationExtractedData.shipper_addresses
                                            }
                                            displayTooltip
                                        />
                                    </HasNotFeatureFlag>
                                </HasNotFeatureFlag>
                                <ReferenceField
                                    field="shipper"
                                    confirmationExtractedCodes={confirmationExtractedData.codes}
                                    reference={formik.values.shipper?.reference ?? null}
                                    referenceCompanyPk={formik.values.shipper?.shipper?.pk ?? null}
                                    onChange={(value) =>
                                        formik.setFieldValue("shipper.reference", value)
                                    }
                                />

                                {/* LOADING/UNLOADING SITES */}
                                {!isComplex &&
                                    ["loadings", "unloadings"].map(
                                        (field: "loadings" | "unloadings") => (
                                            <ActivitiesOverview
                                                field={field}
                                                key={field}
                                                editingIndex={
                                                    editingItem.field === field
                                                        ? editingItem.index!
                                                        : null
                                                }
                                                setEditingIndex={(index: number | null | "new") =>
                                                    setEditingItem({
                                                        field: index === null ? null : field,
                                                        index: index,
                                                    })
                                                }
                                                fillSuggestedAddresses={fillSuggestedAddresses}
                                                suggestedAddresses={
                                                    field === "loadings"
                                                        ? automaticOriginAddresses
                                                        : automaticDestinationAddresses
                                                }
                                                confirmationExtractedAddresses={
                                                    field === "loadings"
                                                        ? confirmationExtractedData.loading_addresses
                                                        : confirmationExtractedData.unloading_addresses
                                                }
                                                confirmationExtractedCodes={
                                                    confirmationExtractedData.codes
                                                }
                                                confirmationExtractedSlots={
                                                    confirmationExtractedData.slots
                                                }
                                            />
                                        )
                                    )}
                                {/* LOADS */}
                                {!isComplex && (
                                    <LoadsOverview
                                        editingIndex={
                                            editingItem.field === "loads"
                                                ? editingItem.index!
                                                : null
                                        }
                                        setEditingIndex={(index: number | null | "new") =>
                                            setEditingItem({
                                                field: index === null ? null : "loads",
                                                index: index,
                                            })
                                        }
                                        deliveries={deliveries}
                                    />
                                )}
                                {/* SUPPORT EXCHANGES */}
                                {!isComplex && (
                                    <SupportExchangesOverview
                                        loadings={formik.values.loadings}
                                        unloadings={formik.values.unloadings}
                                        editingIndex={
                                            editingItem.field === "supportExchanges"
                                                ? editingItem.index!
                                                : null
                                        }
                                        setEditingIndex={(index: number | null | "new") =>
                                            setEditingItem({
                                                field: index === null ? null : "supportExchanges",
                                                index: index,
                                            })
                                        }
                                    />
                                )}

                                {!isComplex && (
                                    <Flex>
                                        {/* MEANS */}
                                        <Box width="40%">
                                            <MeansOverview
                                                means={formik.values.means ?? null}
                                                isEditing={editingItem.field === "means"}
                                                openEdition={() =>
                                                    setEditingItem({
                                                        field: "means",
                                                        index: null,
                                                    })
                                                }
                                            />
                                        </Box>
                                        {editingItem.field === "means" && (
                                            <MeansFormPanel
                                                onSubmit={(value: any) => {
                                                    formik.setFieldValue("means", value);
                                                }}
                                                onClose={() => setEditingItem({field: null})}
                                                automaticMeansEnabled={automaticMeansEnabled}
                                                setAutomaticMeansEnabled={setAutomaticMeansEnabled}
                                                autoFilledMeansFields={autoFilledMeansFields}
                                                setAutoFilledMeansFields={setAutoFilledMeansFields}
                                                setLastAssociatedMeansRequestStatus={
                                                    setLastAssociatedMeansRequestStatus
                                                }
                                                setPredictiveMeansField={setPredictiveMeansField}
                                                confirmationExtractedCodes={
                                                    confirmationExtractedData.codes
                                                }
                                            />
                                        )}

                                        {/* PRICE */}
                                        <Box width="60%" pl={4}>
                                            <PriceOverview
                                                deliveriesCount={deliveries.length}
                                                hasPrice={hasPrice}
                                                hasPurchaseCosts={hasPurchaseCosts}
                                                isEditing={editingItem.field === "price"}
                                                setEditing={(value: boolean) =>
                                                    setEditingItem({
                                                        field: value ? "price" : null,
                                                        index: null,
                                                    })
                                                }
                                            />
                                        </Box>
                                        {/*
                                        // ANCHOR[id=price-form-panel-use]
                                        */}
                                        {editingItem.field === "price" && (
                                            <PriceFormPanel
                                                shipper={shipperSlimCompany}
                                                onSubmit={(value) =>
                                                    formik.setFieldValue("price", value)
                                                }
                                                onClose={() => setEditingItem({field: null})}
                                                isCarrier={isCarrierOfTransport}
                                                isCarrierGroupOfTransport={
                                                    isCarrierGroupOfTransport
                                                }
                                                isOwnerOfCurrentFuelSurchargeAgreement={
                                                    isOwnerOfCurrentFuelSurchargeAgreement
                                                }
                                                canEditCustomerToInvoice={canEditCustomerToInvoice}
                                                matchingTariffGrids={matchingTariffGrids}
                                                matchingFuelSurchargeAgreement={null}
                                                invoiceItemSuggestionArguments={
                                                    invoiceItemSuggestionArguments
                                                }
                                            />
                                        )}
                                    </Flex>
                                )}
                                {isComplex && (
                                    <ComplexSection
                                        automaticMeansEnabled={automaticMeansEnabled}
                                        setAutomaticMeansEnabled={setAutomaticMeansEnabled}
                                        autoFilledMeansFields={autoFilledMeansFields}
                                        setAutoFilledMeansFields={setAutoFilledMeansFields}
                                        setLastAssociatedMeansRequestStatus={
                                            setLastAssociatedMeansRequestStatus
                                        }
                                        setPredictiveMeansField={setPredictiveMeansField}
                                        confirmationExtractedCodes={
                                            confirmationExtractedData.codes
                                        }
                                        isCarrier={isCarrierOfTransport}
                                        isCarrierGroupOfTransport={isCarrierGroupOfTransport}
                                        isOwnerOfCurrentFuelSurchargeAgreement={
                                            isOwnerOfCurrentFuelSurchargeAgreement
                                        }
                                        canEditCustomerToInvoice={canEditCustomerToInvoice}
                                        matchingTariffGrids={matchingTariffGrids}
                                        matchingFuelSurchargeAgreement={null}
                                        invoiceItemSuggestionArguments={
                                            invoiceItemSuggestionArguments
                                        }
                                        originAddressesSuggestedByShipper={
                                            automaticOriginAddresses
                                        }
                                    />
                                )}
                            </Card>
                            <Card
                                flex={2}
                                p={3}
                                boxShadow="medium"
                                bg="grey.white"
                                borderRadius={2}
                                minHeight="100%"
                            >
                                <RightPanel
                                    isComplex={isComplex}
                                    hasPrice={hasPrice}
                                    hasPurchaseCosts={hasPurchaseCosts}
                                    isOrder={isOrder}
                                    isCreatingTemplate={isCreatingTemplate}
                                    deliveries={deliveries}
                                    confirmationExtractedData={confirmationExtractedData}
                                    confirmationUid={confirmationUid}
                                    editingItem={editingItem}
                                    setEditingItem={setEditingItem}
                                />
                            </Card>
                        </Flex>
                    </FormikProvider>
                </Box>
                <Flex
                    justifyContent="flex-end"
                    p={3}
                    position="sticky"
                    bottom={0}
                    bg="grey.white"
                    boxShadow="medium"
                >
                    {error && <ErrorMessage error={error} />}

                    <ButtonWithShortcut
                        onClick={onCancel}
                        variant="plain"
                        mr={3}
                        shortcutKeyCodes={["Escape"]}
                        isShortcutDisabled={!!editingItem.field}
                        tooltipLabel="<i>escap</i>"
                        tooltipPlacement="top"
                    >
                        {t("common.cancel")}{" "}
                    </ButtonWithShortcut>

                    {!isCreatingTemplate && (
                        <ButtonWithShortcut
                            onClick={onDuplicate}
                            variant="secondary"
                            mr={3}
                            shortcutKeyCodes={["Control", "Shift", "Enter"]}
                            isShortcutDisabled={!!editingItem.field}
                            tooltipLabel="<i>ctrl + shift + enter</i>"
                            tooltipPlacement="top"
                            disabled={!isReady || isSubmitting || formik.isSubmitting}
                            data-testid="transport-form-save-and-duplicate-button"
                        >
                            {t("components.createAndDuplicate")}
                        </ButtonWithShortcut>
                    )}

                    <ButtonWithShortcut
                        onClick={onSubmitAndRedirect}
                        variant="primary"
                        shortcutKeyCodes={["Control", "Enter"]}
                        isShortcutDisabled={!!editingItem.field}
                        tooltipLabel="<i>ctrl + enter</i>"
                        data-testid={`${TEST_ID_PREFIX}submit-button`}
                        tooltipPlacement="top"
                        disabled={!isReady || isSubmitting || formik.isSubmitting}
                    >
                        {getSubmitLabel()}
                    </ButtonWithShortcut>
                </Flex>
                {duplicateModalTransport && (
                    <TransportDuplicationTypeModal
                        onClose={handleCloseDuplicationModal}
                        onSubmitMassDuplication={handleMassDuplicateModalClose}
                        transportNumber={duplicateModalTransport.transportNumber}
                        transportUid={duplicateModalTransport.transportUid}
                    />
                )}
                {shouldConfirmLeaving && (
                    <ConfirmationModal
                        title={confirmationBeforeLeavingLabels.title}
                        confirmationMessage={confirmationBeforeLeavingLabels.message}
                        onClose={cancelLeave}
                        mainButton={{
                            children: confirmationBeforeLeavingLabels.submitButton,
                            onClick: confirmLeave,
                            severity: "danger",
                        }}
                    />
                )}
            </FullHeightMinWidthScreen>
        </TransportFormContext.Provider>
    );
};

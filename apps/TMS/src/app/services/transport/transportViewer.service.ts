import type {Transport, TransportWithCarrierPk} from "app/types/transport";

/**
 * Test if the company (behind companyPk) is carrier of the given transport.
 */
function isCarrierOf(transport: TransportWithCarrierPk | null, companyPk: number | undefined) {
    if (transport !== null && transport.carrier) {
        return companyPk === transport.carrier.pk;
    }
    return false;
}

/**
 * Test if the carrier of the transport is part of the given companies (behind companyPks).
 *
 * Meant to be used along with the `useCompaniesInConnectedGroupView` hook:
 * ```ts
 * const companyPks = useCompaniesInConnectedGroupView();
 * const isCarrierGroup = transportViewerService.isCarrierGroupOf(transport, companyPks);
 * ```
 */
function isCarrierGroupOf(transport: TransportWithCarrierPk | null, companyPks: number[]) {
    return transport !== null && companyPks.some((companyPk) => isCarrierOf(transport, companyPk));
}

/**
 * Test if the company (behind companyPk) is shipper of the given transport.
 */
function isShipperOf(transport: Pick<Transport, "shipper"> | null, companyPk: number | undefined) {
    return transport !== null && transport.shipper?.pk === companyPk;
}

/**
 * Test if the shipper of the transport is part of the given companies (behind companyPks).
 *
 * Meant to be used along with the `useCompaniesInConnectedGroupView` hook:
 * ```ts
 * const companyPks = useCompaniesInConnectedGroupView();
 * const isShipperGroup = transportViewerService.isShipperGroupOf(transport, companyPks);
 * ```
 */
function isShipperGroupOf(transport: Pick<Transport, "shipper"> | null, companyPks: number[]) {
    return transport !== null && companyPks.some((companyPk) => isShipperOf(transport, companyPk));
}

/**
 * Test if the company (behind companyPk) is the creator of the given transport.
 */
function isCreatorOf(
    transport: Pick<Transport, "created_by" | "external_transport"> | null,
    companyPk: number | undefined
) {
    if (transport === null) {
        return false;
    }

    if ("external_transport" in transport && transport.external_transport !== null) {
        return companyPk === transport.external_transport?.external_transport_created_by;
    }

    return companyPk === transport.created_by.pk;
}

/**
 * Test if the creator of the transport is part of the given companies (behind companyPks).
 *
 * Meant to be used along with the `useCompaniesInConnectedGroupView` hook:
 * ```ts
 * const companyPks = useCompaniesInConnectedGroupView();
 * const isCreatorGroup = transportViewerService.isCreatorGroupOf(transport, companyPks);
 * ```
 */
function isCreatorGroupOf(
    transport: Pick<Transport, "created_by" | "external_transport"> | null,
    companyPks: number[]
) {
    return transport !== null && companyPks.some((companyPk) => isCreatorOf(transport, companyPk));
}

/**
 * Test if the company (behind companyPk) is the customer to invoice of the given transport.
 */
function isCustomerToInvoiceOf(
    transport: Pick<Transport, "customer_to_invoice"> | null,
    companyPk: number | undefined
) {
    return (
        transport !== null &&
        !!transport.customer_to_invoice &&
        companyPk === transport.customer_to_invoice.pk
    );
}

/**
 * Test if the customer to invoice of the transport is part of the given companies (behind companyPks).
 *
 * Meant to be used along with the `useCompaniesInConnectedGroupView` hook:
 * ```ts
 * const companyPks = useCompaniesInConnectedGroupView();
 * const isCustomerToInvoiceGroup = transportViewerService.isCustomerToInvoiceGroupOf(transport, companyPks);
 * ```
 */
function isCustomerToInvoiceGroupOf(
    transport: Pick<Transport, "customer_to_invoice"> | null,
    companyPks: number[]
) {
    return (
        transport !== null &&
        companyPks.some((companyPk) => isCustomerToInvoiceOf(transport, companyPk))
    );
}

/**
 * Test if the company (behind companyPk) can see private information of the given transport.
 * For now, tells if the company is the creator, the carrier or the shipper of the transport.
 */
function isPrivateViewerOf(
    transport:
        | (TransportWithCarrierPk &
              Pick<Transport, "shipper" | "created_by" | "external_transport">)
        | null,
    companyPk: number | undefined
) {
    const isCreator = transportViewerService.isCreatorOf(transport, companyPk);
    const isCarrier = transportViewerService.isCarrierOf(transport, companyPk);
    const isShipper = transportViewerService.isShipperOf(transport, companyPk);
    return isCarrier || isShipper || isCreator;
}

function isReadOnly(
    transport: TransportWithCarrierPk & Pick<Transport, "carrier_quotation_request">
) {
    return transport.carrier_quotation_request !== null && !transport.carrier;
}

/**
 * Test if the companies (behind companyPks) can see private information of the given transport.
 * For now, tells if the company is the creator group, the carrier group or the shipper group of the transport.
 */
function isPrivateViewerGroupOf(
    transport:
        | (TransportWithCarrierPk &
              Pick<Transport, "shipper" | "created_by" | "external_transport">)
        | null,
    companyPks: number[]
) {
    const isCreatorGroup = transportViewerService.isCreatorGroupOf(transport, companyPks);
    const isCarrierGroup = transportViewerService.isCarrierGroupOf(transport, companyPks);
    const isShipperGroup = transportViewerService.isShipperGroupOf(transport, companyPks);
    return isCarrierGroup || isShipperGroup || isCreatorGroup;
}

/**
 * Test if the carrier address is draft assigned or assigned
 */
function isCarrierDraftAssigned(
    transport:
        | (TransportWithCarrierPk &
              Pick<Transport, "carrier_assignation_status" | "carrier_draft_assigned">)
        | null
) {
    return (
        transport !== null &&
        transport.carrier_assignation_status === "draft_assigned" &&
        transport.carrier === null &&
        transport.carrier_draft_assigned !== null
    );
}

export const transportViewerService = {
    isCarrierOf,
    isCarrierGroupOf,
    isShipperOf,
    isShipperGroupOf,
    isCreatorOf,
    isCreatorGroupOf,
    isCustomerToInvoiceOf,
    isCustomerToInvoiceGroupOf,
    isPrivateViewerOf,
    isCarrierDraftAssigned,
    isPrivateViewerGroupOf,
    isReadOnly,
};

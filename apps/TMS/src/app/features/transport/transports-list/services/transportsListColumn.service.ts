/**
 * Returns an exception if no parent transport is found
 */
function getTransportMargin(transport: {
    parent_split_turnover: {
        subcontracting_cost: string | null;
        subcontracting_margin: string | null;
    } | null;
}) {
    if (
        transport.parent_split_turnover === null ||
        transport.parent_split_turnover.subcontracting_cost === null ||
        transport.parent_split_turnover.subcontracting_margin === null
    ) {
        return null;
    }

    const subcontractingCost = Number(transport.parent_split_turnover.subcontracting_cost);
    const margin = Number(transport.parent_split_turnover.subcontracting_margin);

    if (subcontractingCost === 0) {
        return null;
    }

    const percentage = margin / subcontractingCost;

    return {margin, percentage};
}

export const transportsListColumnService = {
    getTransportMargin,
};

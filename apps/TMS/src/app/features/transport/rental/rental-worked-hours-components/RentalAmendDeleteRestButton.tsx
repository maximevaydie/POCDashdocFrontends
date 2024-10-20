import {t} from "@dashdoc/web-core";
import {Box, IconButton, Text} from "@dashdoc/web-ui";
import React from "react";

import {AmendTransportWarningBanner} from "app/features/transport/amend-transport-warning-banner";
import {fetchAmendDeleteRest, fetchRetrieveTransport} from "app/redux/actions";
import {useDispatch} from "app/redux/hooks";

export const RentalAmendDeleteRestButton = ({
    restUid,
    deliveryUid,
    transportUid,
}: {
    restUid: string;
    deliveryUid: string;
    transportUid: string;
}) => {
    const dispatch = useDispatch();
    return (
        <IconButton
            name="delete"
            withConfirmation
            confirmationMessage={
                <Box>
                    <AmendTransportWarningBanner isRental />
                    <Text>{t("rental.amendRest.deleteConfirmation")}</Text>
                </Box>
            }
            modalProps={{secondaryButton: {}, mainButton: {children: t("common.delete")}}}
            onClick={amendDeleteRest}
            data-testid="amend-delete-rest"
        />
    );

    async function amendDeleteRest() {
        await dispatch(fetchAmendDeleteRest(deliveryUid, restUid));
        dispatch(fetchRetrieveTransport(transportUid));
    }
};

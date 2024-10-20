import {AdministrativeAddressTextWithName, type UpdatablePartner} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Box, ClickableAddRegion, ClickableUpdateRegion, Text} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import React from "react";

import {SelectCarrierModal} from "./SelectCarrierModal";

type Props = {
    carrier: UpdatablePartner | null;
    updateAllowed: boolean;
    isModifyingFinalInfo: boolean;
    isRental: boolean;
    icon?: string;
    iconColor?: string;
    label?: string;
    "data-testid"?: string;
    onUpdated: (carrierPk: number | null, sendToCarrier: boolean) => void;
};

export function UpdatableCarrier({
    carrier,
    updateAllowed,
    isModifyingFinalInfo,
    isRental,
    icon,
    iconColor,
    label,
    onUpdated,
    ...props
}: Props) {
    const PartnerComponent =
        updateAllowed && !carrier ? ClickableAddRegion : ClickableUpdateRegion;

    const [modalOpened, openModal, closeModal] = useToggle(false);

    return (
        <>
            <PartnerComponent
                clickable={updateAllowed}
                onClick={openModal}
                data-testid={props["data-testid"] + "-address"}
            >
                {label && (
                    <>
                        <Text as="span" variant="captionBold" pt={1}>
                            {icon && (
                                <i className={"fa fa-fw " + icon} style={{color: iconColor}} />
                            )}{" "}
                            {label}
                        </Text>
                        <br />
                    </>
                )}
                {carrier ? (
                    <AdministrativeAddressTextWithName partner={carrier} />
                ) : (
                    <Box as="span" color="grey.dark">
                        {t("components.addPartner")}
                    </Box>
                )}
            </PartnerComponent>
            {modalOpened && (
                <SelectCarrierModal
                    initialCarrier={carrier}
                    isModifyingFinalInfo={isModifyingFinalInfo}
                    isRental={isRental}
                    onSelected={onUpdated}
                    onClose={closeModal}
                />
            )}
        </>
    );
}

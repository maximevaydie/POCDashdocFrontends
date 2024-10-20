import {LogisticPoint} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Button, NoWrap} from "@dashdoc/web-ui";
import {CountryCode} from "dashdoc-utils";
import React, {FunctionComponent, useState} from "react";

import {SignatoriesModal} from "app/features/address/signatories/SignatoriesModal";

type Props = {
    logisticPoint: LogisticPoint;
    searchWords: string[];
};

export const AddressesListSignatoriesCell: FunctionComponent<Props> = ({logisticPoint}) => {
    const [showModal, setShowModal] = useState<boolean>(false);
    return (
        <NoWrap>
            <Button
                variant="plain"
                onClick={() => {
                    setShowModal((prev) => !prev);
                }}
                data-testid={`company-detail-edit-signatories-${logisticPoint.pk}`}
            >
                {t("signatories.signatories")}
            </Button>

            {showModal && (
                <SignatoriesModal
                    originalAddressId={logisticPoint.pk}
                    // @ts-ignore
                    addressName={logisticPoint.name}
                    country={logisticPoint.country as CountryCode}
                    onClose={() => setShowModal(false)}
                />
            )}
        </NoWrap>
    );
};

import {t} from "@dashdoc/web-core";
import {Button, IconButton} from "@dashdoc/web-ui";
import {Rest, useToggle} from "dashdoc-utils";
import React, {FunctionComponent, createContext, useContext} from "react";

import {RentalAmendRestModal} from "./AmendRestModal";

const OpenAmendRestContext = createContext<() => void>(() => {});

const AmendRestButtonWrapper: FunctionComponent<{
    rest?: Rest;
    deliveryUid: string;
    transportUid: string;
    startDate?: Date | null;
    children: React.ReactNode;
}> = ({rest, deliveryUid, transportUid, startDate, children}) => {
    const [isModalOpened, open, close] = useToggle(false);
    return (
        <OpenAmendRestContext.Provider value={open}>
            {children}
            {isModalOpened && (
                <RentalAmendRestModal
                    rest={rest}
                    deliveryUid={deliveryUid}
                    transportUid={transportUid}
                    onClose={close}
                    transportStartDate={startDate}
                />
            )}
        </OpenAmendRestContext.Provider>
    );
};

const AmendRentalRestButton = () => {
    const openModal = useContext(OpenAmendRestContext);
    return <IconButton name="edit" onClick={openModal} data-testid="amend-edit-rest" />;
};
export const AmendRentalRest = ({
    rest,
    deliveryUid,
    transportUid,
}: {
    rest: Rest;
    deliveryUid: string;
    transportUid: string;
}) => {
    return (
        <AmendRestButtonWrapper rest={rest} deliveryUid={deliveryUid} transportUid={transportUid}>
            <AmendRentalRestButton />
        </AmendRestButtonWrapper>
    );
};
const AmendByAddingRentalRestButton = () => {
    const openModal = useContext(OpenAmendRestContext);
    return (
        <Button variant="plain" onClick={openModal} data-testid="amend-add-rest">
            + {t("rental.addRest")}
        </Button>
    );
};
export const AmendByAddingRentalRest = ({
    deliveryUid,
    transportUid,
    startDate,
}: {
    deliveryUid: string;
    transportUid: string;
    startDate: Date | null;
}) => {
    return (
        <AmendRestButtonWrapper
            deliveryUid={deliveryUid}
            transportUid={transportUid}
            startDate={startDate}
        >
            <AmendByAddingRentalRestButton />
        </AmendRestButtonWrapper>
    );
};

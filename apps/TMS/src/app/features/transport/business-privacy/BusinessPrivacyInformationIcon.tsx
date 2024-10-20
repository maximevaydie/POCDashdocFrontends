import {Icon} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import React, {FunctionComponent} from "react";

import {BusinessPrivacyInformationModal} from "./BusinessPrivacyInformationModal";

export const BusinessPrivacyInformationIcon: FunctionComponent = () => {
    const [isOpen, open, close] = useToggle();

    return (
        <>
            <Icon name="questionCircle" onClick={open} css={{cursor: "pointer"}} />
            {isOpen && <BusinessPrivacyInformationModal onClose={close} />}
        </>
    );
};

import {webApi} from "@dashdoc/web-common";
import {LoadingWheel} from "@dashdoc/web-ui";
import React, {useEffect, useState} from "react";

import {CustomExtensionDetails} from "app/features/settings/api/CustomExtensionDetails";

import {ConnectorCategory, CustomExtension} from "./types";

export const AsyncExtensionsDetails = ({
    extensionUid,
    connectorCategory,
}: {
    extensionUid: string;
    connectorCategory: ConnectorCategory;
}) => {
    const [extension, setExtension] = useState<CustomExtension | undefined>(undefined);
    useEffect(() => {
        (async () => {
            const response = await webApi.fetchExtension({
                uid: extensionUid,
            });
            setExtension(response);
        })();
    }, [extensionUid]);

    if (!extension) {
        return <LoadingWheel small={false} />;
    }

    return <CustomExtensionDetails extension={extension} connectorCategory={connectorCategory} />;
};

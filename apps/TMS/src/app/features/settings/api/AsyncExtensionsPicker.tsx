import {webApi} from "@dashdoc/web-common";
import React, {useEffect, useState} from "react";
import {useHistory} from "react-router";

import {ExtensionCard} from "./ExtensionCard";
import {ConnectorCategory, CustomExtension} from "./types";

export const AsyncExtensionsPicker = ({
    connectorCategory,
}: {
    connectorCategory: ConnectorCategory;
}) => {
    const [extensions, setExtensions] = useState<CustomExtension[]>([]);
    const history = useHistory();

    useEffect(() => {
        (async () => {
            const response = await webApi.fetchExtensions({});
            setExtensions(response.results);
        })();
    }, [connectorCategory]);

    return (
        <>
            {extensions.map((extension) => (
                <ExtensionCard
                    key={extension.name}
                    mt={4}
                    status={extension.instantiated ? "connected" : "noConnector"}
                    onClick={() => history.push(extension.uid)}
                    name={extension.name}
                    description={extension.description}
                    iconUrl={extension.icon_url}
                    data-testid={extension.name}
                />
            ))}
        </>
    );
};

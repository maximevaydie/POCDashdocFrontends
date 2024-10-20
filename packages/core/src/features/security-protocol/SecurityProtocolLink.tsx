import {t} from "@dashdoc/web-core";
import {Icon, Link} from "@dashdoc/web-ui";
import React from "react";
import {SecurityProtocol} from "types/securityProtocol";

type Props = {
    securityProtocol: SecurityProtocol;
};

export function SecurityProtocolLink({securityProtocol}: Props) {
    return (
        <Link
            onClick={handleLink}
            flex={1}
            maxWidth={"fit-content"}
            css={{
                textOverflow: "'[...]'",
                whiteSpace: "nowrap",
                overflow: "hidden",
                display: "flex",
            }}
            mr={0}
        >
            <Icon name="fileLock" mr={2} />
            {securityProtocol.name || t("common.securityProtocol")}
        </Link>
    );

    function handleLink() {
        window.open(securityProtocol.file, "_blank");
    }
}

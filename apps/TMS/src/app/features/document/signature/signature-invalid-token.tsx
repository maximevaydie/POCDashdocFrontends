import {BuildConstants} from "@dashdoc/web-core";
import {t} from "@dashdoc/web-core";
import {theme} from "@dashdoc/web-ui";
import React from "react";

export function SignatureInvalidToken(): JSX.Element {
    return (
        <>
            <img src={`${BuildConstants.staticUrl}img/icons8-route-fermee-100.png`} />

            <div style={styles.title}>{t("signature.invalidTokenScreenTitle")}</div>

            <div style={styles.info}>{t("signature.invalidTokenScreenText")}</div>
        </>
    );
}

const styles: {[key: string]: React.CSSProperties} = {
    info: {
        textAlign: "center",
        color: theme.colors.grey.dark,
        marginBottom: "27px",
    },
    title: {
        textAlign: "center",
        color: theme.colors.grey.dark,
        fontSize: "24px",
        marginBottom: "40px",
        marginTop: "20px",
    },
};

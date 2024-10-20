import {BuildConstants} from "@dashdoc/web-core";
import {t} from "@dashdoc/web-core";
import {theme} from "@dashdoc/web-ui";
import React from "react";

export function SignatureBadUser(): JSX.Element {
    return (
        <>
            <div style={styles.logo}>
                <img src={`${BuildConstants.staticUrl}img/icons8-lien-brise-100.png`} />
            </div>

            <div style={styles.info}>{t("signature.badUserScreenText1")}</div>

            <div style={styles.info}>{t("signature.badUserScreenText2")}</div>
        </>
    );
}

const styles: {[key: string]: React.CSSProperties} = {
    info: {
        textAlign: "center",
        color: theme.colors.grey.dark,
        marginBottom: "27px",
    },
    logo: {
        marginBottom: "27px",
    },
};

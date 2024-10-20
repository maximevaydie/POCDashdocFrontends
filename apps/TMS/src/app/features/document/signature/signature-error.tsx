import {StaticImage} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Button, Icon, Text} from "@dashdoc/web-ui";
import React from "react";

export function SignatureError() {
    return (
        <>
            <StaticImage src="icons8-attention-100.png" />

            <Text variant="title">{t("signature.errorScreenTitle")}</Text>
            <Text>{t("signature.errorScreenText1")}</Text>
            <Text>{t("signature.errorScreenText2")}</Text>

            <Button
                onClick={() => {
                    document.location.reload();
                }}
                variant="primary"
                width="300px"
                mt={4}
            >
                <Icon name="officeFileStampAlternate" mr={2} />
                {t("signature.errorScreenTryAgain")}
            </Button>
        </>
    );
}

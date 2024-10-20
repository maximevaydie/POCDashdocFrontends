import {t} from "@dashdoc/web-core";
import {Button} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import React from "react";

import {LoginOnlyModal} from "./modals/LoginOnlyModal";

export function LoginAction() {
    const [show, setShow, setHide] = useToggle(false);

    return (
        <>
            <Button variant="secondary" onClick={setShow} width="100%">
                {t("common.login")}
            </Button>

            {show && <LoginOnlyModal onSubmit={setHide} onClose={setHide} />}
        </>
    );
}

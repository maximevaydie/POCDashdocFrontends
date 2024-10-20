import {isAuthenticated} from "@dashdoc/web-common";
import {Logger, t} from "@dashdoc/web-core";
import {Box, Callout, Icon, Text} from "@dashdoc/web-ui";
import {HorizontalLine} from "@dashdoc/web-ui";
import {
    CreateAccountForm,
    CreateAccountPayload,
} from "features/account/actions/forms/CreateAccountForm";
import {LoginForm, LoginPayload} from "features/account/actions/forms/LoginForm";
import {SlotTime} from "features/slot/actions/slot-booking/step/types";
import {useSiteTimezone} from "hooks/useSiteTimezone";
import React, {useState} from "react";
import {useSelector} from "react-redux";
import {tz} from "services/date";
import {Site} from "types";

type Props = {
    site: Site;
    selectedSlotTime: SlotTime;
    onCreateAccount: (payload: CreateAccountPayload) => void;
    onLogin: (payload: LoginPayload) => Promise<void>;
};

export function LoginOrCreateForm({site, selectedSlotTime, onCreateAccount, onLogin}: Props) {
    const isAuth = useSelector(isAuthenticated);
    const [state, setState] = useState<"create" | "login">("create");
    const timezone = useSiteTimezone();
    const date = tz.convert(selectedSlotTime.startTime, timezone);
    if (isAuth) {
        Logger.error("This form should not be displayed if we are already logged in.");
        return null;
    }
    let content;
    if (state === "create") {
        content = (
            <CreateAccountForm
                onSubmit={onCreateAccount}
                onLoginRedirect={() => setState("login")}
            />
        );
    } else {
        content = (
            <LoginForm onSubmit={onLogin} onCreateAccountRedirect={() => setState("create")} />
        );
    }
    return (
        <Box flexGrow={1}>
            <Box maxWidth="400px" margin="auto">
                <Text variant="h2">{t("flow.loginOrCreateForm.createAccountOrLogin")}</Text>
                <Callout mt={4} iconDisabled border="1px solid" borderColor="grey.light">
                    <Text>{tz.format(date, "PPPPp")}</Text>
                    <Text mt={2}>
                        <Icon name="address" mr={2} /> {site.name}
                    </Text>
                </Callout>
                <HorizontalLine mt={6} />
            </Box>
            {content}
        </Box>
    );
}

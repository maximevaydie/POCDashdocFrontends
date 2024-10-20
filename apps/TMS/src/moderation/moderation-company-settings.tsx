import {Logger} from "@dashdoc/web-core";
import {LoadingWheel, theme, toast, ToastContainer} from "@dashdoc/web-ui";
import {ThemeProvider} from "@emotion/react";
import Form from "@rjsf/core";
import {Company} from "dashdoc-utils";
import React, {useEffect, useState} from "react";
import ReactDOM from "react-dom/client";

import {
    CustomCheckbox,
    formatDataWithJSONSchema,
    FormStyle,
    Schema,
} from "moderation/components/settings/settingsFormInputs";

import {Api} from "./Api";

const SETTINGS_SCHEMA_URL = "/moderation/company-settings-schema/";
const COMPANY_DETAILS_URL = "/companies-admin/{id}/";
const COMPANY_ADMIN_URL = "/companies-admin/{id}/settings/";

const CompanySettingsForm = () => {
    const [schema, setSchema] = useState<Schema>();
    const [initialData, setInitialData] = useState<Company>();

    // @ts-ignore
    const companyId = document
        .getElementById("company-settings-form")
        .getAttribute("data-company-pk");

    useEffect(() => {
        Api.get(SETTINGS_SCHEMA_URL).then(setSchema);
        // @ts-ignore
        Api.get(COMPANY_DETAILS_URL.replace("{id}", companyId), {apiVersion: "web"}).then(
            setInitialData
        );
    }, [companyId]);

    if (!schema || !initialData) {
        return <LoadingWheel />;
    }

    return (
        <FormStyle>
            <Form
                schema={{title: "Company settings", ...schema}}
                uiSchema={{"ui:widget": "checkbox"}}
                widgets={{CheckboxWidget: CustomCheckbox}}
                formData={initialData.settings}
                onSubmit={async ({formData}: any) => {
                    formatDataWithJSONSchema(formData, schema);

                    try {
                        // @ts-ignore
                        await Api.patch(COMPANY_ADMIN_URL.replace("{id}", companyId), formData, {
                            apiVersion: "web",
                        });
                        toast.success("Settings saved");
                    } catch (e) {
                        Logger.error(e);
                        toast.error("Couldn't update settings");
                    }
                }}
            />
            <ToastContainer />
        </FormStyle>
    );
};

const dom = document.getElementById("company-settings-form");
if (dom) {
    const root = ReactDOM.createRoot(dom);
    root.render(
        <ThemeProvider theme={theme}>
            <CompanySettingsForm />
        </ThemeProvider>
    );
}

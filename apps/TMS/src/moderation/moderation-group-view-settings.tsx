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

const SETTINGS_SCHEMA_URL = "/moderation/group-view-settings-schema/";
const GROUP_VIEW_DETAILS_URL = "/group-views-admin/{id}/";
const GROUP_VIEW_ADMIN_URL = "/group-views-admin/{id}/settings/";

const GroupViewSettingsForm = () => {
    const [schema, setSchema] = useState<Schema>();
    const [initialData, setInitialData] = useState<Company>();

    // @ts-ignore
    const groupViewId = document
        .getElementById("group-view-settings-form")
        .getAttribute("data-group-view-id");

    useEffect(() => {
        Api.get(SETTINGS_SCHEMA_URL).then(setSchema);
        // @ts-ignore
        Api.get(GROUP_VIEW_DETAILS_URL.replace("{id}", groupViewId), {
            basePath: "moderation",
            apiVersion: null,
        }).then(setInitialData);
    }, [groupViewId]);

    if (!schema || !initialData) {
        return <LoadingWheel />;
    }

    return (
        <FormStyle>
            <Form
                schema={schema}
                uiSchema={{"ui:widget": "checkbox"}}
                widgets={{CheckboxWidget: CustomCheckbox}}
                formData={initialData.settings}
                onSubmit={async ({formData}: any) => {
                    formatDataWithJSONSchema(formData, schema);

                    try {
                        // @ts-ignore
                        await Api.patch(
                            GROUP_VIEW_ADMIN_URL.replace("{id}", groupViewId ?? ""),
                            formData,
                            {
                                apiVersion: null,
                                basePath: "moderation",
                            }
                        );
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

const dom = document.getElementById("group-view-settings-form");
if (dom) {
    const root = ReactDOM.createRoot(dom);
    root.render(
        <ThemeProvider theme={theme}>
            <GroupViewSettingsForm />
        </ThemeProvider>
    );
}

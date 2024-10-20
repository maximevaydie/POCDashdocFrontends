import {t} from "@dashdoc/web-core";
import {Link, Modal, Box, Select, TextInput} from "@dashdoc/web-ui";
import {FormGroup} from "@dashdoc/web-ui";
import {TransportStatusCategory} from "dashdoc-utils";
import {Form, Formik, FormikErrors, FormikProps} from "formik";
import React, {FunctionComponent} from "react";

import {Connector, ConnectorParameters} from "./settings-api";

// value -> label
const StatusList: Record<string, string> = {
    trip_created: "trip_created",
    trip_updated: "trip_updated",
    trip_deleted: "trip_deleted",
    amended: "amended",
    created: "created",
    updated: "updated",
    confirmed: "confirmed",
    declined: "declined",
    "delivery_load.amended": "delivery_load.amended",
    cancelled: "cancelled",
    assigned: "assigned",
    unassigned: "unassigned",
    sent_to_trucker: "sent_to_trucker",
    acknowledged: "acknowledged",
    on_the_way: "on_the_way",
    rounds_started: "rounds_started",
    round_added_v2: "round_added_v2",
    round_edited: "round_edited",
    round_deleted: "round_deleted",
    round_added: "(Deprecated) round_added",
    rounds_complete: "rounds_complete",
    truck_wash: "truck_wash",
    checklist_filled: "checklist_filled",
    on_loading_site: "on_loading_site",
    loading_complete: "loading_complete",
    event: "telematic event",
    departed: "departed",
    bulking_break_started: "bulking_break_started",
    bulking_break_complete: "bulking_break_complete",
    on_unloading_site: "on_unloading_site",
    unloading_complete: "unloading_complete",
    done: "done",
    verified: "verified",
    invoiced: "invoiced",
    paid: "paid",
    deleted: "deleted",
    restored: "restored",
    break_time: "break_time",
    handling_started: "handling_started",
    loading_plan_completed: "loading_plan_completed",
    transport_eta_updated: "transport_eta_updated",
    "document.added": "document.added",
};

const VersionList: Record<"v3" | "v4", string> = {
    v3: "(Deprecated) v3",
    v4: "v4",
};

type AddEditWebhookLinkFormProps = {
    name: string;
    url: string;
    authorization?: string;
    subscriptions: string[];
    version: "v3" | "v4";
};

type AddEditWebhookLinkModalProps = {
    connector?: Connector;
    onClose: () => void;
    onSubmit: (data: Connector, id?: number) => void;
};

export const AddEditWebhookLinkModal: FunctionComponent<AddEditWebhookLinkModalProps> = (
    props
) => {
    const validateValues = (values: AddEditWebhookLinkFormProps) => {
        let errors: FormikErrors<AddEditWebhookLinkFormProps> = {};

        if (!values.name) {
            errors.name = t("common.mandatoryField");
        }
        if (!values.subscriptions.length) {
            errors.subscriptions = t("common.mandatoryField");
        }
        if (!values.url) {
            errors.url = t("common.mandatoryField");
        }
        return errors;
    };

    const handleSubmit = (values: AddEditWebhookLinkFormProps) => {
        const newParameters: ConnectorParameters = {
            sending_on_hold: false,
            subscriptions: values.subscriptions.map(
                // TODO: TransportStatusCategory is not the correct for ConnectorParameters.subscriptions
                // for example `trip_created` is not a TransportStatusCategory
                (item) => item as TransportStatusCategory
            ),
            url: values.url,
            version: values.version,
            name: values.name,
            // @ts-ignore
            authorization: values.authorization,
        };
        const newConnector: Connector = {parameters: newParameters, enabled: true};
        props.onSubmit(newConnector, props.connector?.pk);
        props.onClose();
    };

    return (
        <Modal
            id="add-webhook-link-modal"
            title={props.connector ? t("settings.editWebhook") : t("settings.addWebhook")}
            mainButton={{
                children: props.connector ? t("common.save") : t("common.add"),
                type: "submit",
                form: "add-webhook-link-modal-form",
            }}
            onClose={props.onClose}
        >
            <Formik
                validateOnChange={false}
                validateOnBlur={false}
                initialValues={
                    props.connector
                        ? {
                              name: props.connector.parameters.name,
                              url: props.connector.parameters.url,
                              authorization: props.connector.parameters.authorization,
                              subscriptions: props.connector.parameters.subscriptions,
                              version: props.connector.parameters.version,
                          }
                        : ({
                              name: "",
                              url: "",
                              authorization: "",
                              subscriptions: [],
                              version: "v4",
                          } as AddEditWebhookLinkFormProps)
                }
                validate={validateValues}
                onSubmit={handleSubmit}
            >
                {(formikProps: FormikProps<AddEditWebhookLinkFormProps>) => (
                    <Form id="add-webhook-link-modal-form">
                        <FormGroup>
                            <TextInput
                                required
                                type="text"
                                label={t("common.name")}
                                error={formikProps.errors.name}
                                data-testid="add-webhook-link-modal-name"
                                value={formikProps.values.name}
                                onChange={(name: string) =>
                                    formikProps.setFieldValue("name", name)
                                }
                            />
                        </FormGroup>
                        <FormGroup>
                            <TextInput
                                required
                                type="text"
                                label={"Url"}
                                error={formikProps.errors.url}
                                data-testid="add-webhook-link-modal-url"
                                value={formikProps.values.url}
                                onChange={(url: string) => formikProps.setFieldValue("url", url)}
                            />
                        </FormGroup>
                        <FormGroup>
                            <TextInput
                                type="text"
                                label={t("common.authorizations")}
                                error={formikProps.errors.authorization}
                                data-testid="add-webhook-link-modal-authorizations"
                                // @ts-ignore
                                value={formikProps.values.authorization}
                                onChange={(authorization: string) =>
                                    formikProps.setFieldValue("authorization", authorization)
                                }
                            />
                        </FormGroup>
                        <FormGroup>
                            <Select<{value: string; label: string}, true>
                                required
                                label={t("components.events")}
                                error={formikProps.errors.subscriptions as string}
                                data-testid="add-webhook-link-modal-subscriptions"
                                isMulti={true}
                                value={
                                    formikProps.values.subscriptions.length
                                        ? formikProps.values.subscriptions.map((value) => ({
                                              value: value,
                                              label: StatusList[value],
                                          }))
                                        : null
                                }
                                onChange={(values) => {
                                    formikProps.setFieldValue(
                                        "subscriptions",
                                        values.map((v) => v.value)
                                    );
                                }}
                                closeMenuOnSelect={false}
                                options={Object.entries(StatusList).map(([value, label]) => ({
                                    value,
                                    label,
                                }))}
                            />
                        </FormGroup>
                        <FormGroup>
                            <Select<{value: "v3" | "v4"; label: string}, false>
                                required
                                label={t("components.webhook_version")}
                                error={formikProps.errors.version as string}
                                data-testid="add-webhook-link-modal-version"
                                value={
                                    formikProps.values.version
                                        ? {
                                              value: formikProps.values.version,
                                              label: VersionList[formikProps.values.version],
                                          }
                                        : null
                                }
                                onChange={(version) => {
                                    formikProps.setFieldValue("version", version?.value);
                                }}
                                closeMenuOnSelect={false}
                                options={Object.entries(VersionList).map(
                                    ([value, label]: ["v3" | "v4", string]) => ({
                                        value,
                                        label,
                                    })
                                )}
                                isClearable={false}
                            />
                        </FormGroup>
                    </Form>
                )}
            </Formik>
            <Box>
                <Link
                    href="https://developer.dashdoc.com/docs/webhooks/webhooks-v2"
                    target="_blank"
                    rel="noopener"
                >
                    {t("settings.webhookDocumentationLink")}
                </Link>
            </Box>
        </Modal>
    );
};

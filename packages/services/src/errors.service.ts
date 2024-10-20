import {Logger, t} from "@dashdoc/web-core";

function getStringValue(codeJson: any): string | null {
    if (typeof codeJson === "string") {
        return codeJson;
    }

    for (let key of Object.keys(codeJson)) {
        const value = codeJson[key];
        if (typeof value === "object") {
            return getStringValue(codeJson[key]);
        } else if (typeof value === "string") {
            return value;
        }
    }
    return null;
}

export function getMessageFromErrorCode(code: string): string | null {
    const ERROR_CODES: {[key: string]: string} = {
        origin_date_after_destination_date: t("errors.origin_date_after_destination_date"),
        trade_number_already_exists: t("errors.trade_number_already_exists"),
        remote_id_already_exists: t("errors.remote_id_already_exists"),
        max_length: t("errors.max_length"),
        blank: t("errors.field_cannot_be_empty"),
        multiple_rounds_different_load_categories: t(
            "errors.multiple_rounds_different_load_categories"
        ),
        user_already_manager_other_company: t("errors.user_already_manager_other_company"),
        user_already_manager_same_company: t("errors.user_already_manager_same_company"),
        duplicate_transport_template_name: t("transportTemplates.errorMessages.duplicateName"),
        duplicate_trucker_email: t("errors.duplicate_trucker_email"),
        unique_address: t("errors.duplicate_address"),
        cannot_update_carrier_ongoing_transport: t(
            "errors.cannot_update_carrier_ongoing_transport"
        ),
        cannot_mark_undone_wrong_role: t("errors.cannot_mark_undone_wrong_role"),
        cannot_mark_undone_transport_verified_or_amended: t(
            "errors.cannot_mark_undone_transport_verified_or_amended"
        ),
        cannot_mark_undone_activity_not_done: t("errors.cannot_mark_undone_activity_not_done"),
        cannot_mark_undone_next_activity_done: t("errors.cannot_mark_undone_next_activity_done"),
        cannot_mark_undone_break_resume_not_done: t(
            "errors.cannot_mark_undone_break_resume_not_done"
        ),
        started_trip_cannot_be_assigned: t("errors.started_trip_cannot_be_assigned"),
        cannot_cancel_on_site_wrong_role: t("errors.cannot_cancel_on_site_wrong_role"),
        cannot_cancel_on_site_transport_verified_or_amended: t(
            "errors.cannot_cancel_on_site_transport_verified_or_amended"
        ),
        cannot_update_multiple_rounds: t("errors.cannot_update_multiple_rounds"),
        slot_too_far_past: t("errors.slot_too_far_past"),
        slot_too_far_future: t("errors.slot_too_far_future"),
        cannot_make_company_debtor_of_draft_invoice_non_invoiceable: t(
            "errors.cannot_make_company_debtor_of_draft_invoice_non_invoiceable"
        ),
        company_does_not_exist_or_not_visible: t("errors.notFound"),
        cannot_credit_an_already_fully_credited_invoice: t(
            "errors.cannot_credit_an_already_fully_credited_invoice"
        ),
        invoice_should_be_at_least_finalized_to_be_credited: t(
            "errors.invoice_should_be_at_least_finalized_to_be_credited"
        ),
        cannot_credit_non_dashdoc_invoice: t("errors.cannot_credit_non_dashdoc_invoice"),
        invalid_invoice_uid: t("errors.invalid_invoice"),
        invalid_credit_note_uid: t("errors.invalid_credit_note"),
        cannot_finalize_non_draft_credit_note: t("errors.cannot_finalize_non_draft_credit_note"),
        invoicing_date_before_last_invoicing_date_outside_dashdoc: t(
            "errors.invoicing_date_before_last_invoicing_date_outside_dashdoc"
        ),
        invoicing_date_before_first_invoice: t("errors.invoicing_date_before_first_invoice"),
        cannot_mark_paid_non_finalized_credit_note: t(
            "errors.cannot_mark_paid_non_finalized_credit_note"
        ),
        cannot_mark_finalized_credit_note_as_not_paid: t(
            "errors.cannot_mark_finalized_credit_note_as_not_paid"
        ),
        invoicing_settings_mandatory: t("errors.invoicing_settings_mandatory"),
        negative_credit_note_total: t("errors.negative_credit_note_total"),
        email_in_use: t("errors.email_in_use"),
        email_already_exists_you_can_login: t("errors.email_already_exists_you_can_login"),
        password_too_short: t("errors.password_too_short"),
        password_too_similar: t("errors.password_too_similar"),
        password_too_common: t("errors.password_too_common"),
        password_entirely_numeric: t("common.passwordOnlyDigitsError"),
        invalid_opening_hours: t("errors.invalid_opening_hours"),
        slot_not_available: t("errors.slot_not_available"),
        not_within_booking_window: t("errors.slot_start_not_within_booking_window"),
        slot_not_in_the_future: t("errors.slot_not_in_the_future"),
        notice_period_error: t("errors.slot_notice_period_error"),
        security_protocol_not_accepted: t("common.securityProtocol.mandatory"),
        missing_custom_field: t("common.slot_custom_fields_out_of_sync"),
        invalid_custom_fields_json: t("common.invalid_format"),
        missing_active_subscription: t("errors.waste_shipment.missing_active_subscription"),
        creator_must_be_waste_actor: t("errors.waste_shipment.creator_must_be_waste_actor"),
        big_query_unavailable_in_this_env: t("errors.big_query_unavailable_in_this_env"),
        invalid_slot_transition_timestamp: t("errors.invalid_slot_transition_timestamp"),
        non_invoiceable_customer_to_invoice: t("errors.non_invoiceable_customer_to_invoice"),
        invalid_customer_to_invoice: t("errors.invalid_customer_to_invoice"),
        total_weight_must_be_equal_to_one: t("errors.total_weight_must_be_equal_to_one"),
        missing_coordinates: t("errors.optimization.missing_coordinates"),
        missing_deliveries: t("errors.optimization.missing_deliveries"),
        missing_loads: t("errors.optimization.missing_loads"),
        missing_linear_meters: t("errors.optimization.missing_linear_meters"),
        overload: t("errors.optimization.overloadWithoutParameters"),
        missing_distance: t("errors.optimization.missing_distance"),
        no_solution_found: t("errors.optimization.no_solution_found"),
    };
    const errorMessage = ERROR_CODES[code];
    if (errorMessage !== undefined) {
        return errorMessage;
    }
    return null;
}

function getMessageFromError(errorJson: any): string | null {
    /* Error JSON usually look something like:
     * {
     *     remote_id: {
     *         detail: "There is already a transport with the remote_id 12345",
     *         code: "invalid",
     *     }
     * }
     */

    // First we try to find a specific error code for which we have
    // a user friendly error message.
    if (errorJson.code) {
        const code = getStringValue(errorJson.code);
        // @ts-ignore
        const message = getMessageFromErrorCode(code);
        if (message !== null) {
            return message;
        }
    }

    // If that's not the case, then we try to find an error message
    // directly from the server.
    if (errorJson.detail) {
        const message = getStringValue(errorJson.detail);
        if (message !== null) {
            return message;
        }
    }

    // We iterate other the different fields with an error and stop at soon as
    // we find a error message
    for (let key of Object.keys(errorJson)) {
        const message = getMessageFromError(errorJson[key]);
        if (message !== null) {
            return message;
        }
    }

    return null;
}

/**
 * MADE WITH ERRORS RETURNED FROM POST ON /api/companies/
 * WITH FORMIK ERROR HANDLING IN MIND
 * PLEASE CORRECT THIS FUNCTION IF NEEDED
 */
export async function getErrorMessagesFromServerError(responseError: any) {
    function recursiveErrorMessageGetter(
        responseError: any,
        errorMessages: any = {},
        parentKey = ""
    ) {
        for (let key of Object.keys(responseError)) {
            if (responseError[key].code) {
                if (!Array.isArray(responseError[key].code)) {
                    errorMessages[`${parentKey}${key}`] =
                        getMessageFromErrorCode(responseError[key].code) ||
                        responseError[key].detail;
                } else {
                    // Case with multiple errors for one field
                    const messages: string[] = [];
                    for (const code of responseError[key].code) {
                        const stringCode = getStringValue(code);
                        if (stringCode !== null) {
                            const message = getMessageFromErrorCode(stringCode);
                            if (message !== null) {
                                messages.push(message);
                            }
                        }
                    }
                    if (messages.length > 0) {
                        errorMessages[`${parentKey}${key}`] = messages.join("\n");
                    } else {
                        errorMessages[`${parentKey}${key}`] = Array.isArray(
                            responseError[key].detail
                        )
                            ? responseError[key].detail.join("\n")
                            : responseError[key].detail;
                    }
                }
            } else {
                recursiveErrorMessageGetter(
                    responseError[key],
                    errorMessages,
                    `${parentKey}${key}.`
                );
            }
        }
        return errorMessages;
    }
    try {
        const responseJson = (responseError.json && (await responseError.json())) || responseError;
        return recursiveErrorMessageGetter(responseJson);
    } catch (err) {
        Logger.warn(err);
        return t("common.error");
    }
}

export async function getErrorMessageFromServerError(
    responseError: any,
    genericErrorMessage: string = t("common.error")
) {
    try {
        const clone = responseError.clone();
        const errorJson = await clone.json();
        const errorMessage = getMessageFromError(errorJson);
        if (errorMessage) {
            return errorMessage;
        }
    } catch (err) {
        Logger.warn(err);
    }

    // if we can't find a specific error message, we return a generic one
    switch (responseError.status) {
        case 403: {
            return t("errors.forbidden");
        }
        case 404: {
            return t("errors.notFound");
        }
        default: {
            return genericErrorMessage;
        }
    }
}

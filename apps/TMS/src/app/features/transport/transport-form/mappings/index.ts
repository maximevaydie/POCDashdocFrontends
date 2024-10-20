import {Company} from "dashdoc-utils";

import {TransportFormContextData, type TransportFormValues} from "../transport-form.types";

import {getTransportOrTemplatePayloadFromComplexFormValues} from "./form-values-to-transport/complexFormValuesToTransportPayload";
import {getTransportOrTemplatePayloadFromSimpleFormValues} from "./form-values-to-transport/simpleFormValuesToTransportPayload";
import {getComplexFormValuesFromTransport} from "./transport-to-form-values/transportToComplexFormValues";
import {getSimpleFormValuesFromTransport} from "./transport-to-form-values/transportToSimpleFormValues";

import type {Transport} from "app/types/transport";

export {getLoadDataFromForm} from "./form-values-to-transport/shared";
export {
    getFormLoad,
    getLoadDeliveryOptions,
} from "./transport-to-form-values/shared";

export async function getTransportOrTemplateFromFormValues(
    values: TransportFormValues,
    context: TransportFormContextData,
    company: Company | null,
    recipientsOrderEnabled: boolean,
    hasBetterCompanyRoles: boolean,
    isCarrier: boolean,
    companiesFromConnectedGroupView: number[],
    isComplexFormMode: boolean,
    isCreatingTemplate: boolean
) {
    return isComplexFormMode
        ? getTransportOrTemplatePayloadFromComplexFormValues(
              values,
              context,
              company,
              isCarrier,
              hasBetterCompanyRoles,
              companiesFromConnectedGroupView,
              recipientsOrderEnabled,
              isCreatingTemplate
          )
        : getTransportOrTemplatePayloadFromSimpleFormValues(
              values,
              context,
              company,
              isCarrier,
              hasBetterCompanyRoles,
              companiesFromConnectedGroupView,
              recipientsOrderEnabled,
              isCreatingTemplate
          );
}

export async function getFormValuesFromTransport(
    transport: Transport,
    formContext: TransportFormContextData,
    company: Company | null,
    companiesPksFromConnectedGroupView: Array<number>,
    hasBetterCompanyRolesEnabled: boolean,
    isComplexFormMode: boolean
) {
    return isComplexFormMode
        ? getComplexFormValuesFromTransport(
              transport,
              formContext,
              company,
              companiesPksFromConnectedGroupView,
              hasBetterCompanyRolesEnabled
          )
        : getSimpleFormValuesFromTransport(
              transport,
              formContext,
              company,
              companiesPksFromConnectedGroupView,
              hasBetterCompanyRolesEnabled
          );
}

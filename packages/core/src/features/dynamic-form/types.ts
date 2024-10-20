import {ApiModels} from "../../index";

export type DynamicParameterSpec =
    | ApiModels.DynamicForm.ParameterSpecString
    | ApiModels.DynamicForm.ParameterSpecId
    | ApiModels.DynamicForm.ParameterSpecUid;

export type DynamicFormSpec = ApiModels.DynamicForm.Spec;

export type DynamicParametersSection = {
    name: string;
    description: string;
    parameters: DynamicParameterSpec[];
};

/**
 * The more useful representation of a dynamic form spec to be fed to the react component `DynamicFormComponent`.
 */
export type DynamicForm = {
    sections: DynamicParametersSection[];
};

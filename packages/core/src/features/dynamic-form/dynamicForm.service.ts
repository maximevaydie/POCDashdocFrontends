import {DynamicForm, DynamicFormSpec, DynamicParametersSection} from "./types";

function initialize(spec: DynamicFormSpec): DynamicForm {
    const sectionsByName = new Map<string, DynamicParametersSection>();

    for (const sectionSpec of spec.sections ?? []) {
        sectionsByName.set(sectionSpec.name, {
            name: sectionSpec.name,
            description: sectionSpec.description,
            parameters: [],
        });
    }

    for (const parameterSpec of spec.parameters) {
        const sectionName = parameterSpec.section_name || "";

        if (!sectionsByName.has(sectionName)) {
            sectionsByName.set(sectionName, {
                name: sectionName,
                description: "",
                parameters: [],
            });
        }
        sectionsByName.get(sectionName)!.parameters.push(parameterSpec);
    }

    return {
        sections: Array.from(sectionsByName.values()),
    };
}

export const dynamicFormService = {
    initialize,
};

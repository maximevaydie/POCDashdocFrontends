import {ErrorMessage} from "@dashdoc/web-ui";
import React from "react";
import {useMemo} from "react";
import {FormProvider} from "react-hook-form";

import {dynamicFormService} from "./dynamicForm.service";
import {DynamicFormSectionComponent} from "./DynamicFormSectionComponent";
import {UseDynamicFormReturn} from "./hooks/useDynamicForm";
import {DynamicFormSpec, DynamicParametersSection} from "./types";

type Props = {
    form: UseDynamicFormReturn;
    dynamicFormSpec: DynamicFormSpec;
    readOnly: boolean;
};

export function DynamicFormComponent({form, dynamicFormSpec, readOnly}: Props) {
    const dynamicForm = useMemo(
        () => dynamicFormService.initialize(dynamicFormSpec),
        [dynamicFormSpec]
    );

    return (
        <form>
            <FormProvider {...form}>
                {dynamicForm.sections.map((section: DynamicParametersSection) => (
                    <DynamicFormSectionComponent
                        key={section.name}
                        section={section}
                        readOnly={readOnly}
                    />
                ))}

                {form.formState.errors?.root?.message && (
                    <ErrorMessage error={form.formState.errors.root.message} />
                )}
            </FormProvider>
        </form>
    );
}

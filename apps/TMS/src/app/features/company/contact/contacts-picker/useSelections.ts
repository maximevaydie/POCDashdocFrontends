import {guid} from "@dashdoc/core";
import {useCallback, useState} from "react";
import cloneDeep from "rfdc/default";

import {ContactSelection, type CarrierIdAndContactUid} from "./types";

/**
 * TODO: to remove with betterCompanyRoles FF
 * @deprecated
 */
export function useSelections(onChange: (requestReceivers: CarrierIdAndContactUid[]) => void) {
    type SelectionType = ContactSelection;
    const [selections, setSelections] = useState<SelectionType[]>([
        {key: guid(), company: null, contacts: []},
    ]);

    const handleChange = useCallback(
        (newSelections: ContactSelection[]) => {
            // keep from https://github.com/dashdoc/dashdoc/pull/11148#discussion_r1794973643
            const result: CarrierIdAndContactUid[] = newSelections.map(({company, contacts}) => ({
                carrier_id: company ? company.pk : null,
                contact_uid: company && contacts.length > 0 ? contacts[0].uid : null,
            }));
            onChange(result);
        },
        [onChange]
    );

    const onDelete = useCallback(
        (index: number) => {
            setSelections((prev) => {
                const result = cloneDeep(prev);
                result.splice(index, 1);
                if (result.length <= 0) {
                    // always at least one PartialReceiver in the array
                    result.push({key: guid(), company: null, contacts: []});
                }
                handleChange(result);
                return result;
            });
        },
        [handleChange]
    );

    const onUpdate = useCallback(
        (index: number, selection: SelectionType) => {
            setSelections((prev) => {
                const result = cloneDeep(prev);
                result[index] = {...selection};
                handleChange(result);
                return result;
            });
        },
        [handleChange]
    );

    const onAdd = useCallback(() => {
        setSelections((prev) => {
            const result = [...prev, {key: guid(), company: null, contacts: []}];
            handleChange(result);
            return result;
        });
    }, [handleChange]);

    return {
        selections,
        onDelete,
        onUpdate,
        onAdd,
    };
}

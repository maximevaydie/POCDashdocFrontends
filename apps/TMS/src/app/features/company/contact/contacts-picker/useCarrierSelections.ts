import {guid} from "@dashdoc/core";
import type {CarrierInListOutput, CarrierInTransport} from "@dashdoc/web-common";
import {useCallback, useState} from "react";
import cloneDeep from "rfdc/default";

import type {CarrierIdAndContactUid} from "./types";
import type {SimpleContact} from "dashdoc-utils";

type ContactSelection = {
    key: string;
    carrier: CarrierInTransport | CarrierInListOutput | null;
    contacts: SimpleContact[];
};

// TODO: should be collocated in rfq (only used in ContactsPicker)
export function useCarrierSelections(
    onChange: (requestReceivers: CarrierIdAndContactUid[]) => void
) {
    const [selections, setSelections] = useState<ContactSelection[]>([
        {key: guid(), carrier: null, contacts: []},
    ]);

    const handleChange = useCallback(
        (newSelections: ContactSelection[]) => {
            // keep from https://github.com/dashdoc/dashdoc/pull/11148#discussion_r1794973643
            const result: CarrierIdAndContactUid[] = newSelections.map(({carrier, contacts}) => ({
                carrier_id: carrier ? (carrier as CarrierInTransport).pk : null,
                contact_uid: carrier && contacts.length > 0 ? contacts[0].uid : null,
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
                    result.push({key: guid(), carrier: null, contacts: []});
                }
                handleChange(result);
                return result;
            });
        },
        [handleChange]
    );

    const onUpdate = useCallback(
        (
            index: number,
            carrier: CarrierInTransport | CarrierInListOutput | null,
            contacts: SimpleContact[]
        ) => {
            setSelections((prev) => {
                const result = cloneDeep(prev);
                result[index] = {key: result[index].key, carrier, contacts};
                handleChange(result);
                return result;
            });
        },
        [handleChange]
    );

    const onAdd = useCallback(() => {
        setSelections((prev) => {
            const result = [...prev, {key: guid(), carrier: null, contacts: []}];
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

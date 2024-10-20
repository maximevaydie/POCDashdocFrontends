import {generateUid} from "@dashdoc/core";
import {getConnectedCompany, getConnectedManager} from "@dashdoc/web-common";

import {useSelector} from "app/redux/hooks";

import {FormLoad, TransportFormDeliveryOption} from "../../transport-form/transport-form.types";

export default function useLoadInitialValues(
    initialDelivery: TransportFormDeliveryOption,
    loadPresetValues: {requires_washing?: boolean}
): FormLoad {
    const companyPreferredLoadCategory = useSelector(
        (state) => getConnectedCompany(state)?.settings?.preferred_load_category
    );

    const manager = useSelector(getConnectedManager);

    const category = companyPreferredLoadCategory || "pallets";

    return {
        uid: generateUid(manager?.pk.toString() ?? "0"),
        delivery: initialDelivery,
        category,
        otherCategory: "",
        adrUnCode: null,
        adrUnDescriptionByLanguage: {},
        quantity: null,
        complementary_information: "",
        description: "",
        containerNumberChecked: false,
        use_container_number: false,
        container_number: "",
        sealNumberChecked: false,
        use_container_seal_number: false,
        container_seal_number: "",
        idtf_number: "",
        legal_mentions: "",
        linear_meters: null,
        plannedReturnablePallets: "",
        steres: null,
        tare_weight: null,
        temperature: "",
        volume: null,
        weight: null,
        width: null,
        height: null,
        length: null,
        use_identifiers: false,
        identifiers: [],
        isMultipleRounds: false,
        is_dangerous: false,
        isMultipleCompartments: false,
        refrigerated: false,
        requiresWashing: loadPresetValues?.requires_washing || false,
    };
}

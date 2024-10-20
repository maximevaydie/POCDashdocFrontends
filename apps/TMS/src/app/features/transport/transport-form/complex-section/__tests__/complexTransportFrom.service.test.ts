import {complexTransportForm} from "app/features/transport/transport-form/complex-section/complexTransportForm.service";
import {TransportFormActivity} from "app/features/transport/transport-form/transport-form.types";
const address1 = {
    pk: 27504501,
    address: "Parc Airesse",
    postcode: "88300",
    city: "Neufchâteau",
    country: "FR",
    name: "Mélyss carrier",
    created_by: 786027,
    company: {
        pk: 786027,
        name: "Mélyss carrier",
        country: "FR",
        is_verified: false,
        trade_number: "12123121212",
        vat_number: "FR05121231212",
        has_loggable_managers: true,
        can_invite_to: false,
    },
    latitude: 48.3595,
    longitude: 5.70654,
    coords_validated: true,
};
const address2 = {
    pk: 40699493,
    address: "",
    postcode: "64600",
    city: "Anglet",
    country: "FR",
    name: "Wood Shape",
    created_by: 786027,
    company: null,
    latitude: 43.48187,
    longitude: -1.51469,
    coords_validated: false,
};
const address3 = {
    pk: 47593297,
    address: "",
    postcode: "44000",
    city: "Nantes",
    country: "FR",
    name: "New company",
    created_by: 786027,
    company: {
        pk: 1748253,
        name: "New company",
        country: "FR",
        is_verified: false,
        trade_number: "",
        vat_number: "",
        has_loggable_managers: false,
        can_invite_to: true,
    },
    latitude: 47.2239586,
    longitude: -1.5408058,
    coords_validated: false,
};
const address4 = {
    pk: 40699507,
    address: "",
    postcode: "64200",
    city: "Biarritz",
    country: "FR",
    name: "Electronic",
    created_by: 786027,
    company: null,
    latitude: 43.48285,
    longitude: -1.55882,
    coords_validated: true,
};
test("Complex Transport : getOrderedActivities with no similar activities", () => {
    const loadingA: TransportFormActivity = {
        uid: "171377511612271Ttm7nIn",
        type: "loading",
        address: address1,
        reference: "",
        truckerInstructions: "",
        instructions: "",
        etaTracking: false,
        isBookingNeeded: false,
        slots: [],
        hasSetAskedTimes: {
            hasSetAskedMinTime: false,
            hasSetAskedMaxTime: false,
        },
        contacts: [],
    };
    const unloadingA: TransportFormActivity = {
        uid: "171377511612271JaAbWQ9",
        type: "unloading",
        address: address2,
        reference: "",
        truckerInstructions: "",
        instructions: "",
        etaTracking: false,
        isBookingNeeded: false,
        slots: [],
        hasSetAskedTimes: {
            hasSetAskedMinTime: false,
            hasSetAskedMaxTime: false,
        },
        contacts: [],
    };

    const loadingB: TransportFormActivity = {
        uid: "171377553212271C14Bnud",
        type: "loading",
        address: address3,
        reference: "",
        truckerInstructions: "",
        instructions: "",
        etaTracking: false,
        isBookingNeeded: false,
        slots: [],
        hasSetAskedTimes: {
            hasSetAskedMinTime: false,
            hasSetAskedMaxTime: false,
        },
        contacts: [],
    };
    const unloadingB: TransportFormActivity = {
        uid: "171377553212271b7qwnvI",
        type: "unloading",
        address: address4,
        reference: "",
        truckerInstructions: "",
        instructions: "",
        etaTracking: false,
        isBookingNeeded: false,
        slots: [],
        hasSetAskedTimes: {
            hasSetAskedMinTime: false,
            hasSetAskedMaxTime: false,
        },
        contacts: [],
    };

    const activities: TransportFormActivity[] = [loadingA, unloadingA, loadingB, unloadingB];
    const orderedActivitiesUids: string[] = [];

    const result = complexTransportForm.getOrderedActivities(
        activities,
        orderedActivitiesUids,
        true
    );

    expect(result).toStrictEqual([loadingA, unloadingA, loadingB, unloadingB]);
});
test("Complex Transport : getOrderedActivities with similar loadings", () => {
    const loadingA: TransportFormActivity = {
        uid: "171377511612271Ttm7nIn",
        type: "loading",
        address: address1,
        reference: "",
        truckerInstructions: "",
        instructions: "",
        etaTracking: false,
        isBookingNeeded: false,
        slots: [],
        hasSetAskedTimes: {
            hasSetAskedMinTime: false,
            hasSetAskedMaxTime: false,
        },
        contacts: [],
    };
    const unloadingA: TransportFormActivity = {
        uid: "171377511612271JaAbWQ9",
        type: "unloading",
        address: address2,
        reference: "",
        truckerInstructions: "",
        instructions: "",
        etaTracking: false,
        isBookingNeeded: false,
        slots: [],
        hasSetAskedTimes: {
            hasSetAskedMinTime: false,
            hasSetAskedMaxTime: false,
        },
        contacts: [],
    };

    const loadingB: TransportFormActivity = {
        uid: "171377553212271C14Bnud",
        type: "loading",
        address: address1,
        reference: "",
        truckerInstructions: "",
        instructions: "",
        etaTracking: false,
        isBookingNeeded: false,
        slots: [],
        hasSetAskedTimes: {
            hasSetAskedMinTime: false,
            hasSetAskedMaxTime: false,
        },
        contacts: [],
    };
    const unloadingB: TransportFormActivity = {
        uid: "171377553212271b7qwnvI",
        type: "unloading",
        address: address4,
        reference: "",
        truckerInstructions: "",
        instructions: "",
        etaTracking: false,
        isBookingNeeded: false,
        slots: [],
        hasSetAskedTimes: {
            hasSetAskedMinTime: false,
            hasSetAskedMaxTime: false,
        },
        contacts: [],
    };

    const activities: TransportFormActivity[] = [loadingA, unloadingA, loadingB, unloadingB];
    const orderedActivitiesUids: string[] = [];

    const result = complexTransportForm.getOrderedActivities(
        activities,
        orderedActivitiesUids,
        true
    );

    expect(result).toStrictEqual([loadingA, loadingB, unloadingA, unloadingB]);
});

test("Complex Transport : getOrderedActivities with similar unloadings", () => {
    const loadingA: TransportFormActivity = {
        uid: "171377511612271Ttm7nIn",
        type: "loading",
        address: address1,
        reference: "",
        truckerInstructions: "",
        instructions: "",
        etaTracking: false,
        isBookingNeeded: false,
        slots: [],
        hasSetAskedTimes: {
            hasSetAskedMinTime: false,
            hasSetAskedMaxTime: false,
        },
        contacts: [],
    };
    const unloadingA: TransportFormActivity = {
        uid: "171377511612271JaAbWQ9",
        type: "unloading",
        address: address2,
        reference: "",
        truckerInstructions: "",
        instructions: "",
        etaTracking: false,
        isBookingNeeded: false,
        slots: [],
        hasSetAskedTimes: {
            hasSetAskedMinTime: false,
            hasSetAskedMaxTime: false,
        },
        contacts: [],
    };

    const loadingB: TransportFormActivity = {
        uid: "171377553212271C14Bnud",
        type: "loading",
        address: address3,
        reference: "",
        truckerInstructions: "",
        instructions: "",
        etaTracking: false,
        isBookingNeeded: false,
        slots: [],
        hasSetAskedTimes: {
            hasSetAskedMinTime: false,
            hasSetAskedMaxTime: false,
        },
        contacts: [],
    };
    const unloadingB: TransportFormActivity = {
        uid: "171377553212271b7qwnvI",
        type: "unloading",
        address: address2,
        reference: "",
        truckerInstructions: "",
        instructions: "",
        etaTracking: false,
        isBookingNeeded: false,
        slots: [],
        hasSetAskedTimes: {
            hasSetAskedMinTime: false,
            hasSetAskedMaxTime: false,
        },
        contacts: [],
    };

    const activities: TransportFormActivity[] = [loadingA, unloadingA, loadingB, unloadingB];
    const orderedActivitiesUids: string[] = [];

    const result = complexTransportForm.getOrderedActivities(
        activities,
        orderedActivitiesUids,
        true
    );

    expect(result).toStrictEqual([loadingA, loadingB, unloadingA, unloadingB]);
});
test("Complex Transport : getOrderedActivities with similar activities", () => {
    const loadingA: TransportFormActivity = {
        uid: "171377511612271Ttm7nIn",
        type: "loading",
        address: address1,
        reference: "",
        truckerInstructions: "",
        instructions: "",
        etaTracking: false,
        isBookingNeeded: false,
        slots: [],
        hasSetAskedTimes: {
            hasSetAskedMinTime: false,
            hasSetAskedMaxTime: false,
        },
        contacts: [],
    };
    const unloadingA: TransportFormActivity = {
        uid: "171377511612271JaAbWQ9",
        type: "unloading",
        address: address2,
        reference: "",
        truckerInstructions: "",
        instructions: "",
        etaTracking: false,
        isBookingNeeded: false,
        slots: [],
        hasSetAskedTimes: {
            hasSetAskedMinTime: false,
            hasSetAskedMaxTime: false,
        },
        contacts: [],
    };

    const loadingB: TransportFormActivity = {
        uid: "171377553212271C14Bnud",
        type: "loading",
        address: address3,
        reference: "",
        truckerInstructions: "",
        instructions: "",
        etaTracking: false,
        isBookingNeeded: false,
        slots: [],
        hasSetAskedTimes: {
            hasSetAskedMinTime: false,
            hasSetAskedMaxTime: false,
        },
        contacts: [],
    };
    const unloadingB: TransportFormActivity = {
        uid: "171377553212271b7qwnvI",
        type: "unloading",
        address: address2,
        reference: "",
        truckerInstructions: "",
        instructions: "",
        etaTracking: false,
        isBookingNeeded: false,
        slots: [],
        hasSetAskedTimes: {
            hasSetAskedMinTime: false,
            hasSetAskedMaxTime: false,
        },
        contacts: [],
    };
    const loadingC: TransportFormActivity = {
        uid: "171377553212271C14BnuA",
        type: "loading",
        address: address1,
        reference: "",
        truckerInstructions: "",
        instructions: "",
        etaTracking: false,
        isBookingNeeded: false,
        slots: [],
        hasSetAskedTimes: {
            hasSetAskedMinTime: false,
            hasSetAskedMaxTime: false,
        },
        contacts: [],
    };
    const unloadingC: TransportFormActivity = {
        uid: "171377553212271b7qwnvA",
        type: "unloading",
        address: address4,
        reference: "",
        truckerInstructions: "",
        instructions: "",
        etaTracking: false,
        isBookingNeeded: false,
        slots: [],
        hasSetAskedTimes: {
            hasSetAskedMinTime: false,
            hasSetAskedMaxTime: false,
        },
        contacts: [],
    };
    const loadingD: TransportFormActivity = {
        uid: "171377553212271C14BnuB",
        type: "loading",
        address: address4,
        reference: "",
        truckerInstructions: "",
        instructions: "",
        etaTracking: false,
        isBookingNeeded: false,
        slots: [],
        hasSetAskedTimes: {
            hasSetAskedMinTime: false,
            hasSetAskedMaxTime: false,
        },
        contacts: [],
    };
    const unloadingD: TransportFormActivity = {
        uid: "171377553212271b7qwnvB",
        type: "unloading",
        address: address2,
        reference: "",
        truckerInstructions: "",
        instructions: "",
        etaTracking: false,
        isBookingNeeded: false,
        slots: [],
        hasSetAskedTimes: {
            hasSetAskedMinTime: false,
            hasSetAskedMaxTime: false,
        },
        contacts: [],
    };

    const activities: TransportFormActivity[] = [
        loadingA,
        unloadingA,
        loadingB,
        unloadingB,
        loadingC,
        unloadingC,
        loadingD,
        unloadingD,
    ];
    const orderedActivitiesUids: string[] = [];

    const result = complexTransportForm.getOrderedActivities(
        activities,
        orderedActivitiesUids,
        true
    );

    expect(result).toStrictEqual([
        loadingA,
        loadingC,
        loadingB,
        loadingD,
        unloadingA,
        unloadingB,
        unloadingD,
        unloadingC,
    ]);
});

test("Complex Transport : getOrderedActivities with similar activities and partially fixed order", () => {
    const loadingA: TransportFormActivity = {
        uid: "171377511612271Ttm7nIn",
        type: "loading",
        address: address1,
        reference: "",
        truckerInstructions: "",
        instructions: "",
        etaTracking: false,
        isBookingNeeded: false,
        slots: [],
        hasSetAskedTimes: {
            hasSetAskedMinTime: false,
            hasSetAskedMaxTime: false,
        },
        contacts: [],
    };
    const unloadingA: TransportFormActivity = {
        uid: "171377511612271JaAbWQ9",
        type: "unloading",
        address: address2,
        reference: "",
        truckerInstructions: "",
        instructions: "",
        etaTracking: false,
        isBookingNeeded: false,
        slots: [],
        hasSetAskedTimes: {
            hasSetAskedMinTime: false,
            hasSetAskedMaxTime: false,
        },
        contacts: [],
    };

    const loadingB: TransportFormActivity = {
        uid: "171377553212271C14Bnud",
        type: "loading",
        address: address3,
        reference: "",
        truckerInstructions: "",
        instructions: "",
        etaTracking: false,
        isBookingNeeded: false,
        slots: [],
        hasSetAskedTimes: {
            hasSetAskedMinTime: false,
            hasSetAskedMaxTime: false,
        },
        contacts: [],
    };
    const unloadingB: TransportFormActivity = {
        uid: "171377553212271b7qwnvI",
        type: "unloading",
        address: address4,
        reference: "",
        truckerInstructions: "",
        instructions: "",
        etaTracking: false,
        isBookingNeeded: false,
        slots: [],
        hasSetAskedTimes: {
            hasSetAskedMinTime: false,
            hasSetAskedMaxTime: false,
        },
        contacts: [],
    };
    const loadingC: TransportFormActivity = {
        uid: "171377553212271C14BnuA",
        type: "loading",
        address: address1,
        reference: "",
        truckerInstructions: "",
        instructions: "",
        etaTracking: false,
        isBookingNeeded: false,
        slots: [],
        hasSetAskedTimes: {
            hasSetAskedMinTime: false,
            hasSetAskedMaxTime: false,
        },
        contacts: [],
    };
    const unloadingC: TransportFormActivity = {
        uid: "171377553212271b7qwnvA",
        type: "unloading",
        address: address4,
        reference: "",
        truckerInstructions: "",
        instructions: "",
        etaTracking: false,
        isBookingNeeded: false,
        slots: [],
        hasSetAskedTimes: {
            hasSetAskedMinTime: false,
            hasSetAskedMaxTime: false,
        },
        contacts: [],
    };

    // TODO: clean
    // const deliveries: TransportFormDelivery[] = [
    //     {
    //         loading: loadingA,
    //         unloading: unloadingA,
    //         loads: [],
    //     },
    //     {
    //         loading: loadingB,
    //         unloading: unloadingB,
    //         loads: [],
    //     },
    //     {
    //         loading: loadingC,
    //         unloading: unloadingC,
    //         loads: [],
    //     },
    // ];
    const activities: TransportFormActivity[] = [
        loadingB,
        loadingA,
        unloadingB,
        unloadingA,
        loadingC,
        unloadingC,
    ];
    const orderedActivitiesUids: string[] = [
        loadingB.uid as string,
        loadingA.uid as string,
        unloadingB.uid as string,
        unloadingA.uid as string,
    ];

    const result = complexTransportForm.getOrderedActivities(
        activities,
        orderedActivitiesUids,
        true
    );

    expect(result).toStrictEqual([
        loadingB,
        loadingA,
        loadingC,
        unloadingB,
        unloadingC,
        unloadingA,
    ]);
});

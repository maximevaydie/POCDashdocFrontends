import {guid} from "@dashdoc/core";
import {t} from "@dashdoc/web-core";
import {getLoadCategoryLabel} from "@dashdoc/web-core";
import {formatNumber, ActivityType, loadIsQuantifiable} from "dashdoc-utils";

import type {Load} from "app/types/transport";

const getLoadsByUid = (
    loads: Load[],
    loadType: "planned" | "real",
    otherLoadsByUid: {[key: string]: {[key: string]: Load}}
) => {
    return (loads || []).reduce(
        (loadsByUid: {[key: string]: {[key: string]: Load}}, load: Load) => {
            let uid = load.uid;
            if (!load.uid) {
                uid = guid();
            }
            if (!loadsByUid[uid]) {
                loadsByUid[uid] = {};
            }
            loadsByUid[uid][loadType] = load;
            return loadsByUid;
        },
        otherLoadsByUid
    );
};

export const getDeliveryPlannedAndRealLoads = (plannedLoads: Load[], realLoads: Load[]) => {
    const plannedLoadsByUid = getLoadsByUid(plannedLoads, "planned", {});
    const plannedAndRealLoadsByUid = getLoadsByUid(realLoads, "real", plannedLoadsByUid);
    let deliveryPlannedAndRealLoads = Object.keys(plannedAndRealLoadsByUid).map((uid) => {
        return plannedAndRealLoadsByUid[uid];
    });
    // Deal with loads with no uid for a simple case,
    // where there is only one planned and one real load and one or the two with no uid.
    // In this case we assume that they are matching load.
    // We know this case happens for rental created by trucker, where there can be only one load
    // and where the planned load has a uid but not the real load
    if (deliveryPlannedAndRealLoads.length == 2) {
        let uniquePlannedLoad;
        let uniqueRealLoad;
        if (
            deliveryPlannedAndRealLoads[0]["real"] === undefined &&
            deliveryPlannedAndRealLoads[1]["planned"] === undefined
        ) {
            uniquePlannedLoad = deliveryPlannedAndRealLoads[0]["planned"];
            uniqueRealLoad = deliveryPlannedAndRealLoads[1]["real"];
        } else if (
            deliveryPlannedAndRealLoads[0]["planned"] === undefined &&
            deliveryPlannedAndRealLoads[1]["real"] === undefined
        ) {
            uniquePlannedLoad = deliveryPlannedAndRealLoads[1]["planned"];
            uniqueRealLoad = deliveryPlannedAndRealLoads[0]["real"];
        }
        if (uniquePlannedLoad && uniqueRealLoad) {
            if (!uniquePlannedLoad.uid || !uniqueRealLoad.uid) {
                deliveryPlannedAndRealLoads = [
                    {
                        planned: uniquePlannedLoad,
                        real: uniqueRealLoad,
                    },
                ];
            }
        }
    }
    return deliveryPlannedAndRealLoads;
};

export const getLoadCategoryAndDescription = (load: Load) => {
    if (!load.category && !load.description) {
        return t("loadCategory.unknown");
    }

    const textParts = [];

    if (load.quantity && loadIsQuantifiable(load.category)) {
        textParts.push(formatNumber(load.quantity));
    }
    if (load.category) {
        if (load.quantity && loadIsQuantifiable(load.category)) {
            const quantifiedCategory = getLoadCategoryLabel(
                load.category,
                load.quantity
            ).toLocaleLowerCase();
            textParts[0] += ` ${quantifiedCategory}`;
        } else {
            textParts.push(getLoadCategoryLabel(load.category));
        }
    }
    if (load.description) {
        textParts.push(load.description);
    }
    return textParts.join(", ");
};

export const getLoadInformations = (load: Load) => {
    const textParts = [];
    if (load.container_number) {
        textParts.push(t("shipment.containerNumber", {containerNumber: load.container_number}));
    }
    if (load.container_seal_number) {
        textParts.push(t("shipment.sealNumber", {sealNumber: load.container_seal_number}));
    }
    if (load.complementary_information) {
        textParts.push(load.complementary_information);
    }
    if (load.category === "bulk_qualimat") {
        textParts.push(
            !load.idtf_number || load.idtf_number === "NO_IDTF"
                ? `(${t("shipmentCreateLoad.noIDTF")})`
                : `(IDTF ${load.idtf_number})`
        );
    }
    return textParts.join(", ");
};

export const getRealTitle = (activityType: ActivityType) => {
    switch (activityType) {
        case "loading":
            return t("activityLoads.origin");
        case "unloading":
            return t("activityLoads.destination");
        default:
            return t("activityLoads.real");
    }
};

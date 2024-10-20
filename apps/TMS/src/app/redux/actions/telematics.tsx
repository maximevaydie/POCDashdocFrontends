import {apiService} from "@dashdoc/web-common";
import {TelematicConnector} from "dashdoc-utils";

/* Telematic Vehicle API */
export interface TelematicVehicleLink {
    vendor_name: string;
    vendor_id: string;
    vehicle: {pk: number} | {license_plate: string};
}

export async function fetchTelematicVehicleLink(id: number): Promise<TelematicVehicleLink> {
    return await apiService.get(`/telematics/vehicle-links/${id}/`, {apiVersion: "v4"});
}

export async function fetchTelematicLinkList(): Promise<TelematicConnector[]> {
    return await apiService.get(`/telematics/links/`, {apiVersion: "v4"});
}

export async function updateOrCreateTelematicVehicleLink(
    data: TelematicVehicleLink,
    id?: number
) {
    if (id) {
        return await apiService.patch(`/telematics/vehicle-links/${id}/`, data, {
            apiVersion: "v4",
        });
    } else {
        return await apiService.post("/telematics/vehicle-links/", data, {
            apiVersion: "v4",
        });
    }
}

export async function destroyTelematicVehicleLink(id?: number) {
    return await apiService.delete(`/telematics/vehicle-links/${id}/`, {apiVersion: "v4"});
}

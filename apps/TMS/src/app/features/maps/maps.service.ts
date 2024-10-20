import {apiService} from "@dashdoc/web-common";
import {Logger} from "@dashdoc/web-core";
import {
    getTransportDateTimeRange,
    LastTruckPositionTrace,
    Trace,
    TransportAddress,
} from "dashdoc-utils";
import {addHours, subHours} from "date-fns";
import Leaflet from "leaflet";

import {DaySimulationAddress} from "app/features/optimization/day-simulation/day-simulation.types";

import type {Transport, TransportStatus} from "app/types/transport";

export const getLastTruckPosition = async (
    transport: Transport,
    connectedCompanyPk: number | undefined
): Promise<LastTruckPositionTrace | null> => {
    if (transport.carrier?.pk !== connectedCompanyPk) {
        // Only the carrier can see the truck position
        return null;
    }

    if (!transport.segments.find((s) => s.vehicle)) {
        // There is no vehicle to track
        return null;
    }

    try {
        const response = await apiService.get(
            `/transports/${transport.uid}/last-truck-position/`,
            {
                apiVersion: "v4",
            }
        );
        if (response) {
            return response;
        }
    } catch (e) {
        Logger.error("Error while fetching last truck position");
    }
    return null;
};

export const getTraces = async (
    transport: Transport,
    connectedCompanyPk: number | undefined
): Promise<Trace[]> => {
    if (transport.carrier?.pk !== connectedCompanyPk) {
        // Only the carrier can see the traces
        return [];
    }

    if (!transport.segments.find((s) => s.vehicle)) {
        // There is no vehicle to track
        return [];
    }

    const traces: Trace[] = [];
    const license_plates = [
        ...new Set(
            // @ts-ignore
            transport.segments.filter((s) => s.vehicle).map((s) => s.vehicle.license_plate)
        ),
    ];
    // TODO: compatibility with DD-utils
    const {lower, upper} = getTransportDateTimeRange(transport as any);
    const timeRange = [subHours(lower, 1).toISOString(), addHours(upper, 1).toISOString()];

    let page = 1;
    try {
        do {
            const response = await apiService.get(
                `/telematics/traces/?page=${page}&license_plate__in=${license_plates}&time__range=${timeRange}&page_size=100`,
                {
                    apiVersion: "v4",
                }
            );
            if (response?.results) {
                traces.push(...response.results);
            }
            // @ts-ignore
            page = response.next ? page + 1 : null;
        } while (page !== null);
    } catch (e) {
        Logger.error("Error while fetching traces");
    }
    return traces;
};

export const getEntityLatLng = <
    T extends TransportAddress | TransportStatus | Trace | DaySimulationAddress | null | undefined,
>(
    entity: T
): T extends Trace
    ? Leaflet.LatLng
    : T extends null | undefined
      ? null
      : Leaflet.LatLng | null => {
    return entity && entity.latitude && entity.longitude
        ? (new Leaflet.LatLng(entity.latitude, entity.longitude) as T extends Trace
              ? Leaflet.LatLng
              : T extends null | undefined
                ? null
                : Leaflet.LatLng | null)
        : (null as T extends Trace
              ? Leaflet.LatLng
              : T extends null | undefined
                ? null
                : Leaflet.LatLng | null);
};

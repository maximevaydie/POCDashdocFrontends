import {TariffGridVersion} from "app/features/pricing/tariff-grids/types";

export const hasVersionMultipleZones = (tariffGridVersion: TariffGridVersion) => {
    return (
        tariffGridVersion.line_headers.lines_type === "zones" &&
        new Set(tariffGridVersion.line_headers.zones.map(({zone_type}) => zone_type)).size > 1
    );
};

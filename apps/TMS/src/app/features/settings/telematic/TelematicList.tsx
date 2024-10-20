import {BuildConstants} from "@dashdoc/web-core";
import {t} from "@dashdoc/web-core";
import {TelematicConnector} from "dashdoc-utils";
import capitalize from "lodash.capitalize";
import React from "react";

import {DeleteTelematicAction} from "./actions/DeleteTelematicAction";

type Props = {
    onReload: () => void;
    telematics: TelematicConnector[];
};

export function TelematicList({telematics, onReload}: Props) {
    return (
        <>
            <table className="table table-hover shipments-table">
                <thead>
                    <tr>
                        <th>{t("settings.telematicVendor")}</th>
                        <th>{t("common.enabled")}</th>
                        <th>{t("settingsPlates.actions")}</th>
                    </tr>
                </thead>

                <tbody>
                    {telematics.map((telematic) => (
                        <tr key={telematic.id}>
                            <td>{capitalize(telematic.vendor_name)}</td>
                            <td>{telematic.enabled ? t("common.yes") : t("common.no")}</td>
                            <td>
                                <DeleteTelematicAction telematic={telematic} onDelete={onReload} />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {telematics.length == 0 && (
                <div className="no-shipment-list">
                    <h4 className="text-center">{t("settings.noTelematic")}</h4>
                    <div className="text-center">
                        <img src={`${BuildConstants.staticUrl}img/no-shipments.png`} />
                    </div>
                </div>
            )}
        </>
    );
}

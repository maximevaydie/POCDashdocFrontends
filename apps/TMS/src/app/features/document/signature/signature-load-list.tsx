import {getLoadText} from "@dashdoc/web-core";
import React from "react";

import {SignatureInfoCell} from "./signature-info-cell";

import type {Delivery} from "app/types/transport";

type Props = {
    deliveries: Delivery[];
};

export function SignatureLoadList({deliveries}: Props) {
    return (
        <>
            {deliveries.map((delivery: Delivery) =>
                delivery.loads.map((load) => (
                    <SignatureInfoCell key={load.uid} icon={"box"} title={getLoadText(load)} />
                ))
            )}
        </>
    );
}

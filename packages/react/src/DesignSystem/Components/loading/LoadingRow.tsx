import React from "react";

import {LoadingWheel} from "./LoadingWheel";

interface LoadingRowProps {
    colSpan: number;
    render?: () => React.ReactNode;
    "data-testid"?: string;
}

export function LoadingRow({
    colSpan,
    render,
    "data-testid": dataTestId = "loading-row",
}: LoadingRowProps) {
    return (
        <tr data-testid={dataTestId}>
            <td colSpan={colSpan}>
                {render ? render() : <LoadingWheel noMargin={true} small={true} />}
            </td>
        </tr>
    );
}

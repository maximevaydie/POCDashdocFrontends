import {Select, SimpleOption} from "@dashdoc/web-ui";
import {PricingMetricKey} from "dashdoc-utils";
import React, {FC, useMemo} from "react";

import {getMetricLabel, listOfMetrics} from "app/services/invoicing";

type PricingMetricSelectProps = {
    required?: boolean;
    label: string;
    value: SimpleOption<PricingMetricKey> | null;
    allowedMetrics?: PricingMetricKey[];
    dataTestId?: string;
    error?: string | boolean;
    customSort?: (a: SimpleOption<PricingMetricKey>, b: SimpleOption<PricingMetricKey>) => number;
    onChange: (pricingMetric: SimpleOption<PricingMetricKey> | null) => unknown;
};

/**
 * This component is used to select a pricing metric.
 *
 * @param required Whether the select is required.
 * @param label The label of the select.
 * @param value The selected pricing metric.
 * @param allowedMetrics The allowed metrics to be selected. If not provided, all metrics are allowed.
 * @param dataTestId The data test id of the select.
 * @param error If there is an error, the error message to display.
 * @param customSort A custom sort function to sort the metrics.
 * @param onChange The function to call when the selected pricing metric changes.
 */
export const PricingMetricSelect: FC<PricingMetricSelectProps> = ({
    required,
    label,
    value,
    allowedMetrics,
    dataTestId,
    error,
    customSort,
    onChange,
}) => {
    const options: SimpleOption<PricingMetricKey>[] = useMemo(() => {
        let result = listOfMetrics
            .filter((metric) => (allowedMetrics ? allowedMetrics.includes(metric) : true))
            .map((metric: PricingMetricKey) => {
                return {value: metric, label: getMetricLabel(metric, true) || metric};
            });

        if (customSort) {
            result = result.sort(customSort);
        }

        return result;
    }, [allowedMetrics]);

    return (
        <Select<SimpleOption<PricingMetricKey>, false>
            required={required}
            isClearable={false}
            label={label}
            data-testid={dataTestId}
            value={value}
            error={error}
            options={options}
            onChange={onChange}
        />
    );
};

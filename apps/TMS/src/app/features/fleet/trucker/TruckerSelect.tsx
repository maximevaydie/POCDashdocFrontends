import {apiService} from "@dashdoc/web-common";
import {queryService, t} from "@dashdoc/web-core";
import {
    AsyncCreatableSelect,
    AsyncSelect,
    AsyncSelectProps,
    Callout,
    DeprecatedIcon,
    Flex,
    SelectOption,
    Text,
    Icon as UIIcon,
} from "@dashdoc/web-ui";
import {css} from "@emotion/react";
import {SiteSlot, Trucker, type SlimCompanyForInvitation} from "dashdoc-utils";
import React, {FunctionComponent, useEffect, useState} from "react";

import {useExtendedView} from "app/hooks/useExtendedView";

import AddRentalTruckerModal from "./add-rental-trucker-modal";
import {TruckerModal} from "./trucker-modal/TruckerModal";

const searchTruckers = (
    input: string,
    rentalCarrierCompanyPk: number | null,
    extendedView: boolean
): Promise<Trucker[]> =>
    new Promise((resolve, reject) => {
        const query: {
            text: string;
            rental?: boolean;
            carrier?: number;
            extended_view?: boolean;
            hide_disabled: boolean;
        } = {
            text: input,
            hide_disabled: true,
        };
        if (rentalCarrierCompanyPk) {
            query.rental = true;
            query.carrier = rentalCarrierCompanyPk;
        }
        if (extendedView) {
            query.extended_view = extendedView;
        }

        apiService
            .get(`/manager-truckers/?${queryService.toQueryString(query)}`, {apiVersion: "v4"})
            .then((response) => {
                const options = response.results.map((trucker: Trucker) => {
                    return {value: trucker, label: trucker.display_name};
                });
                resolve(options);
            })
            .catch((error) => reject(error));
    });

export const TruckerSelectOption = (option: {
    value?: Trucker;
    label?: string;
    iconName?: string;
}) => (
    <>
        {option.iconName && (
            <DeprecatedIcon
                css={css`
                    font-size: 15px;
                `}
                name={option.iconName}
            />
        )}
        <Text display="inline-block" color="inherit">
            {/*
// @ts-ignore */}
            {option.label || option.value.display_name}
        </Text>
    </>
);

type TruckerSelectProps = Partial<
    AsyncSelectProps<SelectOption<Trucker | Partial<Trucker>>, false>
> & {
    tripUid?: string;
    dateRange?: SiteSlot;
    rentalCarrierCompany?: SlimCompanyForInvitation;
    onCreateTrucker?: (truckerName: string) => void;
    hideExtendedViewOptions?: boolean;
};

export function TruckerSelect({
    tripUid,
    dateRange,
    rentalCarrierCompany,
    onCreateTrucker,
    hideExtendedViewOptions,
    ...props
}: TruckerSelectProps) {
    const [hasAvailabilityConflict, setAvailabilityConflict] = useState(false);
    const {extendedView} = useExtendedView();
    const trucker = (props?.value as SelectOption<Trucker>)?.value;
    const truckerPk = trucker?.pk;

    useEffect(() => {
        if (truckerPk && (tripUid || dateRange)) {
            let payload;
            let unavailaibilityUrl = "has-unavailability";
            if (dateRange) {
                payload = {
                    start_date: dateRange.start,
                    end_date: dateRange.end,
                };
            } else if (tripUid) {
                payload = {trip_uid: tripUid};
                unavailaibilityUrl = "has-unavailability-during-trip";
            }
            apiService
                .post(`/manager-truckers/${truckerPk}/${unavailaibilityUrl}/`, payload, {
                    apiVersion: "web",
                })
                .then((res) => {
                    setAvailabilityConflict(res.conflict);
                })
                .catch(() => {
                    setAvailabilityConflict(false);
                });
        } else {
            setAvailabilityConflict(false);
        }
    }, [truckerPk, tripUid, dateRange]);

    const SelectComponent = onCreateTrucker ? AsyncCreatableSelect : AsyncSelect;
    const creatableProps = onCreateTrucker
        ? {
              formatCreateLabel: (value: string) => (
                  <Flex alignItems="center">
                      <UIIcon name="add" mr={1} color="inherit" />
                      <Text color="inherit">
                          {value
                              ? t("common.add") + " " + value
                              : t("transportsForm.addNewDriver")}
                      </Text>
                  </Flex>
              ),
              onCreateOption: onCreateTrucker,
              isValidNewOption: () => true,
          }
        : null;

    return (
        <>
            <SelectComponent
                placeholder={t("components.enterDriverPlaceholder")}
                loadOptions={(input: string) =>
                    searchTruckers(
                        input,
                        rentalCarrierCompany?.pk ?? null,
                        !hideExtendedViewOptions && extendedView
                    )
                }
                defaultOptions={true}
                formatOptionLabel={TruckerSelectOption}
                {...props}
                {...creatableProps}
            />

            {hasAvailabilityConflict && (
                <Callout mt={2} variant="warning" data-testid="conflict-availability-trucker">
                    <Text>{t("unavailability.truckerUnavailableOnPeriod")}</Text>
                </Callout>
            )}
        </>
    );
}

export const TruckerCreatableSelect: FunctionComponent<
    Omit<TruckerSelectProps, "onCreateTrucker">
> = (selectProps) => {
    // @ts-ignore
    const [addTruckerModalParam, setAddTruckerModalParam] = useState<string>(null);

    const handleNewTrucker = (trucker: Trucker) => {
        // @ts-ignore
        selectProps.onChange({value: trucker}, {action: "create-option"});
        // @ts-ignore
        setAddTruckerModalParam(null);
    };
    return (
        <>
            <TruckerSelect
                {...selectProps}
                onCreateTrucker={(truckerName) => setAddTruckerModalParam(truckerName)}
            />
            {addTruckerModalParam !== null && !selectProps.rentalCarrierCompany && (
                <TruckerModal
                    truckerFirstName={addTruckerModalParam}
                    // @ts-ignore
                    onClose={() => setAddTruckerModalParam(null)}
                    onSubmitTrucker={handleNewTrucker}
                />
            )}
            {addTruckerModalParam !== null && selectProps.rentalCarrierCompany && (
                <AddRentalTruckerModal
                    truckerFirstName={addTruckerModalParam}
                    // @ts-ignore
                    onClose={() => setAddTruckerModalParam(null)}
                    onSubmitTrucker={handleNewTrucker}
                    carrier={selectProps.rentalCarrierCompany}
                />
            )}
        </>
    );
};

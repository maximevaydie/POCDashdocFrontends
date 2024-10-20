import {NamedAddressLabel} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Box, ClickableAddRegion, ClickableUpdateRegion, Text} from "@dashdoc/web-ui";
import {AddressWithFullCompany, TransportAddress} from "dashdoc-utils";
import React from "react";

import {EditableReferenceList} from "app/features/address/reference/list/editable-reference-list";

interface UpdatableAddressBaseProps {
    address: TransportAddress | AddressWithFullCompany;
    addressUpdateAllowed: boolean;
    icon?: string;
    iconColor?: string;
    label?: string;
    onClick?: () => void;
    "data-testid"?: string;
}

export interface UpdatableAddressWithoutRefProps extends UpdatableAddressBaseProps {
    reference?: void;
    showReference: false;
}

export interface UpdatableAddressWithRefProps extends UpdatableAddressBaseProps {
    reference?: string;
    onEditReferenceClick?: (ref: string) => void;
    onViewReferenceClick?: (ref: string) => void;
    showReference?: boolean;
    refUpdateAllowed?: boolean;
}

type UpdatableAddressProps = UpdatableAddressWithoutRefProps | UpdatableAddressWithRefProps;

export function UpdatableAddress(props: UpdatableAddressProps) {
    const AddressComponent =
        props.addressUpdateAllowed && !props.address ? ClickableAddRegion : ClickableUpdateRegion;

    return (
        <div>
            <AddressComponent
                clickable={props.addressUpdateAllowed}
                onClick={props.onClick}
                data-testid={props["data-testid"] + "-address"}
            >
                {props.label && (
                    <>
                        <Text as="span" variant="captionBold" pt={1}>
                            {props.icon && (
                                <i
                                    className={"fa fa-fw " + props.icon}
                                    style={{color: props.iconColor}}
                                />
                            )}{" "}
                            {props.label}
                        </Text>
                        <br />
                    </>
                )}
                {props.address ? (
                    <NamedAddressLabel address={props.address} />
                ) : (
                    <Box as="span" color="grey.dark">
                        {t("components.addLogisticPoint")}
                    </Box>
                )}
            </AddressComponent>
            {props.showReference !== false && (props.refUpdateAllowed || props.reference) && (
                <EditableReferenceList
                    reference={props.reference}
                    label={t("components.ref")}
                    placeholder={t("components.addReference")}
                    updateAllowed={props.refUpdateAllowed ?? false}
                    onEditReferenceClick={props.onEditReferenceClick}
                    onViewReferenceClick={props.onViewReferenceClick}
                    data-testid={props["data-testid"]}
                />
            )}
        </div>
    );
}

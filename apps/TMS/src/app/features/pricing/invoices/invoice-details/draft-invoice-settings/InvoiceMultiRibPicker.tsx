import {t} from "@dashdoc/web-core";
import {Box, Select, SelectProps, theme} from "@dashdoc/web-ui";
import React from "react";

import {InvoiceBankInformation} from "app/taxation/invoicing/types/invoiceSettingsTypes";

type Props = Partial<SelectProps> & {
    bankInformationList: InvoiceBankInformation[];
};

export function InvoiceMultiRibPicker({bankInformationList, ...selectProps}: Props) {
    const selectOptions = [
        ...bankInformationList.map(({uid, name}) => ({
            value: uid,
            label: name,
            testId: `select-option-${name}`,
        })),
    ];

    if (bankInformationList.length === 0) {
        return null;
    }

    return (
        <Box maxWidth={300} mr={3}>
            <Select
                {...selectProps}
                isClearable={false}
                menuPortalTarget={document.body}
                styles={{
                    menuPortal: (base) => ({...base, zIndex: theme.zIndices.topbar}),
                }}
                label={t("invoice.appliedBankDetails")}
                options={selectOptions}
                data-testid={"invoice-bank-information-select"}
            />
        </Box>
    );
}

type LegacyProps = {
    bankInformation: Pick<InvoiceBankInformation, "uid" | "name"> | null;
    bankInformationList: InvoiceBankInformation[];
    onChange: (bankInformationUid: InvoiceBankInformation["uid"]) => void;
};

// @deprecated This component must be removed with the FF fuelSurchargeInInvoiceFooter
export function InvoiceMultiRibPickerLegacy({
    bankInformation,
    bankInformationList,
    onChange,
}: LegacyProps) {
    const selectValue = bankInformation
        ? {value: bankInformation.uid, label: bankInformation.name}
        : null;

    const selectOptions = [
        ...bankInformationList.map(({uid, name}) => ({
            value: uid,
            label: name,
            testId: `select-option-${name}`,
        })),
    ];

    if (bankInformationList.length === 0) {
        return null;
    }

    return (
        <Box minWidth={200} mr={3}>
            <Select
                isClearable={false}
                menuPortalTarget={document.body}
                styles={{
                    menuPortal: (base) => ({...base, zIndex: theme.zIndices.topbar}),
                }}
                label={t("invoice.appliedBankDetails")}
                value={selectValue}
                options={selectOptions}
                data-testid={"invoice-bank-information-select"}
                onChange={({value: bankInformationUid}: {value: string; label: string}) => {
                    onChange(bankInformationUid);
                }}
            />
        </Box>
    );
}

import {apiService} from "@dashdoc/web-common";
import {ResultValues} from "nuvo-react";
import React from "react";

import {fetchUpdateCompanyInvoicingData} from "app/redux/actions/companies";
import {fetchAddContact} from "app/redux/actions/contacts";
import {useDispatch} from "app/redux/hooks";

import {NuvoDataImporterButton} from "../../../common/nuvo-importer/NuvoDataImporterButton";
import {
    addressesModel,
    createEmptyReport,
    importAndFillReport,
    removeEmptyEntries,
    removeEmptyFieldInEntries,
} from "../../../common/nuvo-importer/nuvoImporter.service";

export const NuvoPartnerImporter = ({onImportDone}: {onImportDone: () => void}) => {
    const dispatch = useDispatch();

    return (
        <NuvoDataImporterButton
            importData={handleImportData}
            onImportDone={onImportDone}
            model={addressesModel}
            onEntryInit={(row) => {
                return {
                    coords_validated: {
                        value:
                            row.coords_validated !== undefined
                                ? row.coords_validated
                                : !!(row.latitude && row.longitude),
                    },
                };
            }}
        />
    );

    async function handleImportData(entries: ResultValues) {
        let lineNumber = 2; // first line is for header
        const newReport = createEmptyReport([
            "common.addresses",
            "common.contacts",
            "common.invoicesCount",
            "waste.import.wamCompanies",
        ]);
        const purgedEntries = removeEmptyFieldInEntries(removeEmptyEntries(entries));
        for (const address of purgedEntries) {
            await importAndFillReport(
                newReport,
                "common.addresses",
                async () => {
                    const createdPartner = await apiService.post(
                        "address-book/import-partner-with-address/",
                        {
                            name: address.company_name as string,
                            company: {
                                country: address.country as string,
                                name: address.company_name as string,
                                invoicing_remote_id: address.invoicing_remote_id as string,
                                siren: address.siren_number as string,
                                trade_number: address.trade_number as string,
                                vat_number: address.vat_number as string,
                                remote_id: address.company_remote_id as string,
                                notes: address.notes as string,
                            },
                            address: address.address as string,
                            city: address.city as string,
                            postcode: address.postcode as string,
                            country: address.country as string,
                            latitude: address.latitude as number,
                            longitude: address.longitude as number,
                            radius: null,
                            coords_validated: address.coords_validated as boolean,
                            is_shipper: address.is_shipper as boolean,
                            is_origin: address.is_origin as boolean,
                            is_destination: address.is_destination as boolean,
                            is_carrier: address.is_carrier as boolean,
                            flow_site: null,
                        },
                        {apiVersion: "web"}
                    );

                    if (address.is_organizer || address.is_processor || address.is_producer) {
                        await importAndFillReport(
                            newReport,
                            "waste.import.wamCompanies",
                            async () => {
                                await apiService.patch(
                                    `waste-companies/${createdPartner.pk}/`,
                                    {
                                        name: address.company_name,
                                        address: address.address,
                                        postcode: address.postcode,
                                        country: address.country,
                                        city: address.city,

                                        is_organizer: address.is_organizer,
                                        is_carrier: address.is_carrier,
                                        is_producer: address.is_producer,
                                        is_processor: address.is_processor,
                                        is_citizen: address.is_citizen,

                                        enterprise_number: address.enterprise_number,
                                        vat_number: address.vat_number,
                                        eori_number: address.eori_number,
                                        sea_ship: address.sea_ship,
                                        producer_establishment_unit_number:
                                            address.establishment_unit_number,
                                        processor_establishment_unit_number:
                                            address.establishment_unit_number,
                                    },
                                    {apiVersion: "web"}
                                );
                            },
                            `${createdPartner.name}`,
                            lineNumber
                        );
                    }
                    if (address.contact_email_address || address.contact_phone_number) {
                        await importAndFillReport(
                            newReport,
                            "common.contacts",
                            () =>
                                dispatch(
                                    fetchAddContact({
                                        company: {
                                            pk: createdPartner.pk,
                                        },
                                        last_name: address.contact_name ?? createdPartner.name,
                                        email: address.contact_email_address,
                                        phone_number: address.contact_phone_number,
                                    })
                                ),
                            `${createdPartner.name} - ${address.contact_name}`,
                            lineNumber
                        );
                    }
                    if (address.account_code || address.side_account_code) {
                        await importAndFillReport(
                            newReport,
                            "common.invoicesCount",
                            () =>
                                dispatch(
                                    fetchUpdateCompanyInvoicingData(createdPartner.pk, {
                                        company_id: createdPartner.pk,
                                        account_code: address.account_code,
                                        side_account_code: address.side_account_code,
                                    })
                                ),
                            `${address.company_name as string} - ${address.account_code} - ${
                                address.side_account_code
                            }`,
                            lineNumber
                        );
                    }
                },
                address.company_name as string,
                lineNumber
            );

            lineNumber++;
        }

        return newReport;
    }
};

import {
    aCompany,
    address1,
    address2,
    addressUnknown,
    primaryAddress,
} from "__mocks__/companyMocks";
import {Address, OriginalAddress, TransportAddressWithCompany} from "dashdoc-utils";

import {addressService} from "../address.service";

describe("canDeleteAddress", () => {
    test("with null", () => {
        // @ts-ignore
        expect(addressService.canDeleteAddress(null)).toStrictEqual([false, "common.error"]);
    });

    test("with undefined", () => {
        // @ts-ignore
        expect(addressService.canDeleteAddress(undefined)).toStrictEqual([false, "common.error"]);
    });

    test("with a company free address", () => {
        expect(addressService.canDeleteAddress(addressUnknown)).toStrictEqual([true]);
    });

    test("with a primary address", () => {
        expect(addressService.canDeleteAddress(primaryAddress, aCompany)).toStrictEqual([
            false,
            "components.addressDeletionUnavailable.primaryAddress",
        ]);
    });

    test("with a deletable address", () => {
        expect(addressService.canDeleteAddress(address1, aCompany)).toStrictEqual([true]);
        expect(addressService.canDeleteAddress(address2, aCompany)).toStrictEqual([true]);
    });

    test("with the only address of a company", () => {
        const aCompanyWithOneAddress = {...aCompany, addresses: [address1]};
        expect(addressService.canDeleteAddress(address1, aCompanyWithOneAddress)).toStrictEqual([
            false,
            "components.addressDeletionUnavailable.atLeastOneAddress",
        ]);
    });
});

describe("convertAddressToIOriginalAddress", () => {
    test("from Address to OriginalAddress", () => {
        // Given an address of type Address
        const address: Address = {
            pk: 60414129,
            name: "Transports Bergeron",
            address: "120 Chemin de Trémoulin, ZA les Plantées",
            city: "ST-MARCELLIN-EN-FOREZ",
            coords_validated: false,
            country: "FR",
            created: "2023-06-05T12:57:02.533743Z",
            instructions: "",
            is_carrier: true,
            is_destination: false,
            is_origin: false,
            is_shipper: true,
            latitude: null,
            longitude: null,
            original: 48485031,
            postcode: "42680",
            radius: 500,
            remote_id: "",
            company: {
                country: "FR",
                email: "contact@bergeron-transports.fr",
                is_verified: true,
                name: "BERGERON TRANSPORTS SAS",
                phone_number: "+33477500593",
                pk: 1768192,
                siren: "",
                trade_number: "33765646600022",
                vat_number: "FR59337656466",
                website: "",
                remote_id: "",
                invoicing_remote_id: "",
            },
            created_by: {
                pk: 1768192,
                name: "BERGERON TRANSPORTS SAS",
            },
            flow_site: null,
        };

        // When I convert it to OriginalAddress
        const result = addressService.convertAddressToIOriginalAddress(address);

        // Then it works
        expect(result).toStrictEqual({
            pk: 48485031,
            address: "120 Chemin de Trémoulin, ZA les Plantées",
            postcode: "42680",
            city: "ST-MARCELLIN-EN-FOREZ",
            country: "FR",
            name: "Transports Bergeron",
            created_by: 1768192,
            has_flow_site: false,
            latitude: null,
            longitude: null,
            coords_validated: false,
            company: {
                pk: 1768192,
                name: "BERGERON TRANSPORTS SAS",
                country: "FR",
                is_verified: true,
                has_loggable_managers: false,
                trade_number: "33765646600022",
                vat_number: "FR59337656466",
                can_invite_to: false,
            },
        });
    });

    test("from Address to TransportAddressWithCompany", () => {
        // Given an address of type TransportAddressWithCompany
        const address: TransportAddressWithCompany = {
            pk: 60455683,
            name: "LMTP",
            address: "8 rue du Puits Lacroix",
            city: "ST JEAN BONNEFONDS",
            postcode: "42650",
            country: "FR",
            latitude: 45.46790379999999,
            longitude: 4.4355104,
            radius: 500,
            coords_validated: false,
            is_carrier: false,
            is_shipper: true,
            is_origin: true,
            is_destination: true,
            created_by: 1768192,
            instructions: "",
            company: {
                pk: 2043225,
                name: "LMTP",
                country: "FR",
                settings_contract_html: "",
                settings_logo: null,
                settings_stamp: null,
                settings_print_mode: false,
                settings_special_agreements: "",
                settings_transport_order_observations: "",
                settings_constrain_reference_edition: false,
                settings_ignore_creator_constraint_in_signature_process: false,
                phone_number: "+33477481610",
            },
            original: 59659548,
            remote_id: "",
        };

        // When I convert it to OriginalAddress
        const result = addressService.convertAddressToIOriginalAddress(address);

        // Then it works
        expect(result).toStrictEqual({
            pk: 59659548,
            address: "8 rue du Puits Lacroix",
            postcode: "42650",
            city: "ST JEAN BONNEFONDS",
            country: "FR",
            name: "LMTP",
            created_by: 1768192,
            has_flow_site: false,
            latitude: 45.46790379999999,
            longitude: 4.4355104,
            coords_validated: false,
            company: {
                pk: 2043225,
                name: "LMTP",
                country: "FR",
                is_verified: false,
                has_loggable_managers: false,
                trade_number: "",
                vat_number: "",
                can_invite_to: false,
            },
        });
    });

    test("from OriginalAddress to OriginalAddress", () => {
        // Given an address of type OriginalAddress
        const address = {
            pk: 48485031,
            address: "120 Chemin de Trémoulin, ZA les Plantées",
            postcode: "42680",
            city: "ST-MARCELLIN-EN-FOREZ",
            country: "FR",
            name: "Transports Bergeron",
            created_by: 1768192,
            company: {
                pk: 1768192,
                name: "BERGERON TRANSPORTS SAS",
                country: "FR",
                is_verified: true,
                has_loggable_managers: false,
                trade_number: "78987339500030",
                vat_number: "FR19789873395",
                can_invite_to: true,
            },
        };

        // When I convert it to OriginalAddress
        const result = addressService.convertAddressToIOriginalAddress(
            address as OriginalAddress // we are testing that although the input object is a lie, we get a correct output
        );

        // Then it works I still got the same address object
        expect(result).toStrictEqual({
            pk: 48485031,
            address: "120 Chemin de Trémoulin, ZA les Plantées",
            postcode: "42680",
            city: "ST-MARCELLIN-EN-FOREZ",
            country: "FR",
            name: "Transports Bergeron",
            created_by: 1768192,
            has_flow_site: false,
            company: {
                pk: 1768192,
                name: "BERGERON TRANSPORTS SAS",
                country: "FR",
                is_verified: true,
                has_loggable_managers: false,
                trade_number: "78987339500030",
                vat_number: "FR19789873395",
                can_invite_to: true,
            },
            latitude: null,
            longitude: null,
            coords_validated: false,
        });
    });

    test("Convert copy to original", () => {
        // Given an address which is a copy
        const address: TransportAddressWithCompany = {
            pk: 60455683,
            name: "LMTP",
            address: "8 rue du Puits Lacroix",
            city: "ST JEAN BONNEFONDS",
            postcode: "42650",
            country: "FR",
            latitude: 45.46790379999999,
            longitude: 4.4355104,
            radius: 500,
            coords_validated: false,
            created_by: 1768192,
            company: {
                pk: 2043225,
                name: "LMTP",
                country: "FR",
            },
            original: 59659548,
        };
        expect(address.original).not.toBeNull();

        // When I convert it to OriginalAddress
        const result = addressService.convertAddressToIOriginalAddress(address);

        // Then the returned address object is not a copy anymore, it has the PK of the originl
        expect(result).not.toHaveProperty("original");
        expect(result.pk).toStrictEqual(address.original);
    });

    test("Indicate company.has_loggable_managers when it is possible", () => {
        // Given an address which has company.has_loggable_managers
        const address: Address = {
            pk: 59659548,
            name: "LMTP",
            address: "8 rue du Puits Lacroix",
            city: "ST JEAN BONNEFONDS",
            postcode: "42650",
            country: "FR",
            latitude: 45.46790379999999,
            longitude: 4.4355104,
            radius: 500,
            coords_validated: false,
            company: {
                pk: 2043225,
                name: "LMTP",
                country: "FR",
                has_loggable_managers: true,
            },
            flow_site: null,
        };
        expect(address.company.has_loggable_managers).toStrictEqual(true);

        // When I convert it to OriginalAddress
        const result = addressService.convertAddressToIOriginalAddress(address);

        // Then the returned address object indicates that the company has has_loggable_managers=true
        expect(result.company?.has_loggable_managers).toStrictEqual(true);
    });

    test("Convert created_by to PK when it is an object in the first place", () => {
        // Given an address with a 'created_by' as an object
        const address: Address = {
            pk: 59659548,
            name: "LMTP",
            address: "8 rue du Puits Lacroix",
            city: "ST JEAN BONNEFONDS",
            postcode: "42650",
            country: "FR",
            latitude: 45.46790379999999,
            longitude: 4.4355104,
            radius: 500,
            coords_validated: false,
            company: {
                pk: 2043225,
                name: "LMTP",
                country: "FR",
            },
            created_by: {
                pk: 1768192,
                name: "BERGERON TRANSPORTS SAS",
            },
            flow_site: null,
        };
        expect(typeof address.created_by).toStrictEqual("object");

        // When I convert it to OriginalAddress
        const result = addressService.convertAddressToIOriginalAddress(address);

        // Then the returned address 'created_by' is a PK
        expect(result.created_by).toStrictEqual(address.created_by?.pk);
    });

    test("Remove the remote_id", () => {
        // Given an address with a 'created_by' as an object
        const address: Address = {
            pk: 59659548,
            name: "LMTP",
            address: "8 rue du Puits Lacroix",
            city: "ST JEAN BONNEFONDS",
            postcode: "42650",
            country: "FR",
            latitude: 45.46790379999999,
            longitude: 4.4355104,
            radius: 500,
            coords_validated: false,
            company: {
                pk: 2043225,
                name: "LMTP",
                country: "FR",
            },
            remote_id: "ABC123",
            flow_site: null,
        };
        expect(address.remote_id).not.toBeNull();

        // When I convert it to OriginalAddress
        const result = addressService.convertAddressToIOriginalAddress(address);

        // Then the returned address has no longer a remote_id because the PK is a better identifier internaly to Dashdoc
        expect(result).not.toHaveProperty("remote_id");
    });
});

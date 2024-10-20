import {schema} from "normalizr";

export const companySchema = new schema.Entity("companies", {}, {idAttribute: "pk"});

export const partnerDetailsSchema = new schema.Entity("partnerDetails", {}, {idAttribute: "pk"});
export const partnersListSchema = new schema.Entity("partnersList", {}, {idAttribute: "pk"});

export const managerSchema = new schema.Entity(
    "managers",
    {
        current_company: companySchema,
    },
    {idAttribute: "pk"}
);

export const addressSchema = new schema.Entity("addresses", {}, {idAttribute: "pk"});

import {Meta} from "@storybook/react/types-6-0";
import React from "react";

import {PageVisitsView} from "./PageVisitsView";
import {PageVisitsResponse} from "./types";

export default {
    title: "app/features/transport/transport-details/PageVisitsView",
    component: PageVisitsView,
} as Meta;

const visits: PageVisitsResponse = [
    {
        id: 2,
        display_name: "Jane Doe",
        last_visited: "2023-08-02T12:00:00.000Z",
        email: "jane.doe@example.com",
        company_name: "Other Company",
        is_staff: false,
        profile_picture: "https://placekitten.com/100/100",
    },
    {
        id: 3,
        display_name: "Jean-Michel de La Rue",
        last_visited: "2022-08-01T14:00:00.000Z",
        email: "sam.smith@example.com",
        company_name: "Transports du Bout du Monde",
        is_staff: true,
        profile_picture: "",
    },
    {
        id: 4,
        display_name: "Emily Johnson",
        last_visited: "2021-08-02T10:00:00.000Z",
        email: "emily.johnson@example.com",
        company_name: "Finance Inc",
        is_staff: false,
        profile_picture: "https://placekitten.com/100/120",
    },
    {
        id: 5,
        display_name: "Chris Williams",
        last_visited: "2021-08-01T09:00:00.000Z",
        email: "chris.williams@example.com",
        company_name: "Design Co",
        is_staff: false,
        profile_picture: "https://placekitten.com/200/100",
    },
    {
        id: 6,
        display_name: "Laura Brown",
        last_visited: "2021-08-02T11:00:00.000Z",
        email: "laura.brown@example.com",
        company_name: "Creative Agency",
        is_staff: false,
        profile_picture: "https://placekitten.com/100/150",
    },
    {
        id: 7,
        display_name: "Mike Davis",
        last_visited: "2021-08-01T16:00:00.000Z",
        email: "mike.davis@example.com",
        company_name: "Software Ltd",
        is_staff: false,
        profile_picture: "",
    },
];

export const Default = () => <PageVisitsView visits={visits.slice(0, 4)} />;

export const WithMoreThanFive = () => <PageVisitsView visits={Array(4).fill(visits).flat()} />;

export const Empty = () => <PageVisitsView visits={[]} />;

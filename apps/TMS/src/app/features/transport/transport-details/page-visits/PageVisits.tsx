import {apiService} from "@dashdoc/web-common";
import React, {useEffect, useState} from "react";

import {PageVisitsView} from "./PageVisitsView";
import {PageVisitsResponse} from "./types";

import type {Transport} from "app/types/transport";

type Props = {
    transport: Transport;
};

export function PageVisits({transport}: Props) {
    const [visits, setVisits] = useState<PageVisitsResponse>([]);

    useEffect(() => {
        apiService
            .post(
                "/page-visits/update-and-retrieve/",
                {
                    object_id: transport.sequential_id,
                    object_type: "transport",
                },
                {apiVersion: "web"}
            )
            .then((response: PageVisitsResponse) => {
                setVisits(response);
            });
    }, [transport.sequential_id]);

    return <PageVisitsView visits={visits} />;
}

import {ErrorBoundary} from "@dashdoc/web-common";
import {ProgressByStepBar} from "@dashdoc/web-ui";
import React from "react";

import {getTransportStatusDisplay} from "app/services/transport";

import type {Transport} from "app/types/transport";

interface Props {
    transport: Transport;
}

export default class TransportProgressBarDetail extends React.PureComponent<Props> {
    private stages: {[stage: string]: {label: string; index: number; danger: boolean}} = {
        created: {
            label: getTransportStatusDisplay("created", undefined, false).text,
            index: 0,
            danger: false,
        },
        on_loading_site: {
            label: getTransportStatusDisplay("on_loading_site", undefined, false).text,
            index: 1,
            danger: false,
        },
        loading_complete: {
            label: getTransportStatusDisplay("loading_complete", undefined, false).text,
            index: 2,
            danger: false,
        },
        on_unloading_site: {
            label: getTransportStatusDisplay("on_unloading_site", undefined, false).text,
            index: 3,
            danger: false,
        },
        unloading_complete: {
            label: getTransportStatusDisplay("done", undefined, false).text,
            index: 4,
            danger: false,
        },
    };
    getStage = (status: string) => {
        if (!status) {
            return this.stages.created;
        }
        return this.stages[status];
    };

    getItems = (currentStage: {label: string; index: number; danger: boolean}) => {
        const BASE_STAGES = [
            {index: 0, label: getTransportStatusDisplay("created", undefined, false).text},
            {index: 1, label: getTransportStatusDisplay("on_loading_site", undefined, false).text},
            {
                index: 2,
                label: getTransportStatusDisplay("loading_complete", undefined, false).text,
            },
            {
                index: 3,
                label: getTransportStatusDisplay("on_unloading_site", undefined, false).text,
            },
            {index: 4, label: getTransportStatusDisplay("done", undefined, false).text},
        ];

        let items = BASE_STAGES.map((stage) => {
            return {
                label: stage.index === currentStage.index ? currentStage.label : stage.label,
                active: stage.index <= currentStage.index,
                danger: stage.index === currentStage.index ? currentStage.danger : false,
            };
        });

        return items;
    };

    render = () => {
        const stage = this.getStage(this.props.transport.public_tracking_status ?? "created");
        return (
            <ErrorBoundary>
                <ProgressByStepBar items={this.getItems(stage)} />
            </ErrorBoundary>
        );
    };
}

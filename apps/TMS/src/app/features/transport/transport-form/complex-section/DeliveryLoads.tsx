import {t} from "@dashdoc/web-core";
import {Flex, Text, ClickableFlex, Icon} from "@dashdoc/web-ui";
import {ErrorMessage} from "@dashdoc/web-ui";
import {useFormikContext} from "formik";
import React, {forwardRef, useContext, useEffect, useImperativeHandle, useRef} from "react";

import LoadFormPanel from "app/features/transport/load/load-form/LoadFormPanel";

import {TransportFormContext} from "../transport-form-context";
import {FormLoad, TransportFormDelivery, TransportFormValues} from "../transport-form.types";

import {LoadItem} from "./LoadItem";

interface DeliveryLoadsProps {
    delivery: TransportFormDelivery;
    deliveryIndex: number;
    loads: FormLoad[];
    onEdit: (loads: FormLoad[]) => void;
    error?: string;
}

export const DeliveryLoads = forwardRef(function DeliveryLoads(
    {delivery, deliveryIndex, loads, onEdit, error}: DeliveryLoadsProps,
    ref
) {
    const containerRef = useRef<HTMLDivElement>(null);

    const [editingIndex, setEditingIndex] = React.useState<number | "new" | null>(null);

    const {loadsSmartSuggestionsMap} = useContext(TransportFormContext);

    const {values} = useFormikContext<TransportFormValues>();

    const loading = values.activities[delivery.loadingUid];
    const unloading = values.activities[delivery.unloadingUid];

    useImperativeHandle(
        ref,
        () => ({
            addLoad: () => setEditingIndex("new"),
        }),
        []
    );

    useEffect(() => {
        if (error) {
            containerRef.current?.scrollIntoView({behavior: "smooth"});
        }
    }, [error]);

    return (
        <Flex
            flexDirection="column"
            borderTop="1px solid"
            borderColor="grey.light"
            padding={1}
            paddingTop={3}
            ref={containerRef}
        >
            <Text variant="captionBold">{t("common.loads")}</Text>

            <Flex flexDirection="column">
                {loads.map((load, index) => (
                    <LoadItem
                        key={load.uid}
                        index={index}
                        isLast={index === loads.length - 1}
                        load={load}
                        onEdit={() => setEditingIndex(index)}
                        onDelete={() => onEdit(loads.filter((_, i) => i !== index))}
                    />
                ))}
            </Flex>

            <ClickableFlex
                onClick={() => setEditingIndex("new")}
                alignSelf="flex-start"
                paddingY={2}
                data-testid={`transport-form-delivery-${deliveryIndex}-add-load-button`}
            >
                <Icon name="add" marginRight={1} fontSize={1} /> {t("transportsForm.addLoad")}
            </ClickableFlex>

            {error && <ErrorMessage error={error} />}

            {editingIndex != null && (
                <LoadFormPanel
                    onSubmit={(load) => {
                        editingIndex === "new"
                            ? onEdit([...loads, load])
                            : onEdit(loads.map((l, i) => (i === editingIndex ? load : l)));
                    }}
                    loadToEdit={editingIndex === "new" ? undefined : loads[editingIndex]}
                    onClose={() => setEditingIndex(null)}
                    deliveries={[
                        {
                            loadingActivity: loading,
                            unloadingActivity: unloading,
                        },
                    ]}
                    loadsSmartSuggestionsMap={loadsSmartSuggestionsMap}
                />
            )}
        </Flex>
    );
});

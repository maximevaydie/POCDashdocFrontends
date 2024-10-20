import {t} from "@dashdoc/web-core";
import {Flex, Text, Button, Icon} from "@dashdoc/web-ui";
import {useFormikContext} from "formik";
import React from "react";

import {SupportExchangesOverview} from "../support-exchanges/SupportExchangeOverview";
import {TransportFormValues} from "../transport-form.types";

export function SupportExchangesSection() {
    const {values} = useFormikContext<TransportFormValues>();
    const {supportExchanges, activities} = values;

    const loadings = Object.values(activities).filter((activity) => activity.type === "loading");
    const unloadings = Object.values(activities).filter(
        (activity) => activity.type === "unloading"
    );

    const [editingIndex, setEditingIndex] = React.useState<number | "new" | null>(null);

    return (
        <Flex flexDirection="column">
            <Text variant="h1" mr={3} marginBottom={2}>
                {t("common.supportExchanges")}
            </Text>

            <SupportExchangesOverview
                loadings={loadings}
                unloadings={unloadings}
                editingIndex={editingIndex}
                setEditingIndex={(index) => setEditingIndex(index)}
                hideTitle
            />

            <Button
                marginTop={supportExchanges.length ? 2 : 0}
                variant="plain"
                onClick={() => setEditingIndex("new")}
                alignSelf="flex-start"
            >
                <Icon name="add" marginRight={1} /> {t("transportsForm.addSupportExchange")}
            </Button>
        </Flex>
    );
}

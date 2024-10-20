import {t} from "@dashdoc/web-core";
import {Button, ErrorMessage, Flex, Input, Text, theme} from "@dashdoc/web-ui";
import React, {useState} from "react";
import {z} from "zod";

type Props = {
    query: {
        duration_on_site__gte?: string;
    };
    updateQuery: (query: {duration_on_site__gte?: string}) => void;
};

const durationSchema = z.number().int().positive();

export function DurationOnSiteInput({query, updateQuery}: Props) {
    const [input, setInput] = useState(query.duration_on_site__gte || "");
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = () => {
        const result = durationSchema.safeParse(Number(input));
        if (result.success) {
            updateQuery({duration_on_site__gte: result.data.toString()});
        } else {
            setError(t("common.invalidInput"));
        }
    };

    const handleInputChange = (value: string) => {
        setInput(value);
        setError(null);
    };

    return (
        <Flex flexDirection="column">
            <Flex
                px={3}
                py={1}
                flex={1}
                flexDirection="column"
                alignItems="left"
                borderBottom="1px solid"
                borderColor="grey.light"
            >
                <Text variant="h2">{t("filter.durationOnSite")}</Text>
                <Text variant="caption">{t("common.is")}</Text>
            </Flex>
            <Flex flex={1} alignItems="center" px={3} py={3} style={{gap: theme.space[3]}}>
                <Text>{t("common.greaterThanOrEqualTo")}</Text>
                <Input
                    data-testid="filter-duration-on-site-input"
                    width="100px"
                    textAlign="right"
                    value={input}
                    onChange={handleInputChange}
                />
                <Text>{t("common.units.minutes.short")}</Text>
            </Flex>
            {error && <ErrorMessage error={error} />}
            <Button
                data-testid="filter-duration-on-site-save-button"
                position="absolute"
                bottom={0}
                right={0}
                margin={3}
                onClick={handleSubmit}
            >
                {t("common.validate")}
            </Button>
        </Flex>
    );
}

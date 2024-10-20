import {t, TranslationKeys} from "@dashdoc/web-core";
import {Box, Card, ClickableFlex, Icon, Text} from "@dashdoc/web-ui";
import React from "react";

export const ImportedEntity = ({
    index,
    name,
    details,
}: {
    index: number;
    name: TranslationKeys;
    details: string[];
}) => {
    return (
        <>
            {details.length > 0 && (
                <Card mb={2}>
                    <ClickableFlex
                        id={`heading${index}`}
                        data-toggle="collapse"
                        data-target={`#collapse${index}`}
                        aria-expanded="false"
                        aria-controls={`#collapse${index}`}
                        justifyContent={"space-between"}
                        p={3}
                    >
                        <Text variant="captionBold">
                            <Icon
                                name={"checkCircle"}
                                color="green.default"
                                verticalAlign="text-top"
                                mr={2}
                            />
                            {t("component.importedEntities", {
                                count: details.length,
                                entityName: t(name, {smart_count: details.length}),
                            })}
                        </Text>
                        <Icon name={"arrowDown"} />
                    </ClickableFlex>

                    <Box
                        id={`collapse${index}`}
                        className="collapse"
                        aria-labelledby={`heading${index}`}
                        data-parent="#accordionExample"
                        p={3}
                    >
                        <ul>
                            {details.map((detail, detailIndex) => (
                                <li key={`item-${index}-${detailIndex}`}>{detail}</li>
                            ))}
                        </ul>
                    </Box>
                </Card>
            )}
        </>
    );
};

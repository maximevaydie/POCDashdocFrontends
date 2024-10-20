import {t} from "@dashdoc/web-core";
import {Box, Card, Icon, Text} from "@dashdoc/web-ui";
import React from "react";

import {ImportedEntity} from "./ImportedEntity";
import {NotImportedEntity} from "./NotImportedEntity";
import {ImportReportType} from "./type";

export const ImportReport = ({importedEntities, notImportedEntities}: ImportReportType) => {
    const hasNotImportedEntities = notImportedEntities.some(
        (notImportedEntity) => notImportedEntity.details.length > 0
    );
    return (
        <>
            <Box className="accordion" id="accordionExample">
                {importedEntities.map((importedEntity, index) => (
                    <ImportedEntity key={index} index={index} {...importedEntity} />
                ))}
            </Box>
            {hasNotImportedEntities && (
                <Card backgroundColor="red.ultralight" p={3}>
                    <Text variant="captionBold" mb={3}>
                        <Icon
                            name="removeCircle"
                            color="red.default"
                            verticalAlign="text-top"
                            mr={2}
                        />
                        {t("component.notImportedEntities")}
                    </Text>
                    <ul>
                        {notImportedEntities.map((notImportedEntity, index) => (
                            <NotImportedEntity key={index} index={index} {...notImportedEntity} />
                        ))}
                    </ul>
                    <Text variant="subcaption" mt={6}>
                        <Icon name="warning" verticalAlign="text-top" mr={2} />
                        {t("component.reportNumberingDivergence")}
                    </Text>
                </Card>
            )}
        </>
    );
};

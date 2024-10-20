import {t} from "@dashdoc/web-core";
import {Box, Button, Flex, Icon} from "@dashdoc/web-ui";
import React, {FC} from "react";

import {InvoiceItemCatalogCreationModal} from "./InvoiceItemCatalogCreationModal";

/**
 * A button that opens a modal to create a new dashdoc invoice item.
 */
export const InvoiceItemCatalogCreateAction: FC<{
    creationCallback: () => unknown;
}> = ({creationCallback}) => {
    const [isModalOpen, setIsModalOpen] = React.useState(false);

    return (
        <>
            <Button
                variant={"primary"}
                data-testid={"invoice-item-catalog-create-action"}
                onClick={() => {
                    setIsModalOpen(true);
                }}
            >
                <Flex flexDirection={"row"} alignItems={"center"}>
                    <Icon name={"add"} pt={1} mr={2} />
                    <Box>{t("invoiceTemplateCatalog.addAnInvoiceItem")}</Box>
                </Flex>
            </Button>
            {isModalOpen && (
                <InvoiceItemCatalogCreationModal
                    onClose={() => setIsModalOpen(false)}
                    creationCallback={creationCallback}
                />
            )}
        </>
    );
};

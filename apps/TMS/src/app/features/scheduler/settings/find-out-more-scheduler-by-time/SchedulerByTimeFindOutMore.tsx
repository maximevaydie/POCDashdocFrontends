import {t} from "@dashdoc/web-core";
import {Box, Button, Flex, Modal, Text} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import React from "react";
import {useHistory} from "react-router";

import {FindOutMoreSchedulerByTimeImage} from "./FindOutMoreSchedulerByTimeImage";

export function SchedulerByTimeFindOutMore({fromSettings}: {fromSettings?: boolean}) {
    const history = useHistory();
    const [isOpened, open, close] = useToggle(false);

    return (
        <>
            <Button variant="plain" onClick={open}>
                {t("common.findOutMore")}
            </Button>
            {isOpened && (
                <Modal
                    title={t("schedulerByTime.findOutMore.title")}
                    mainButton={{
                        children: fromSettings ? t("common.close") : t("scheduler.goToSettings"),
                        onClick: () =>
                            fromSettings ? close() : history.push("/app/settings/scheduler"),
                    }}
                    onClose={close}
                >
                    <Flex alignItems="center">
                        <Box>
                            <Text as="li" mb={1}>
                                {t("schedulerByTime.onBoarding.step1.main")}
                            </Text>
                            <Text as="li" mb={1}>
                                {t("schedulerByTime.onBoarding.step1.1")}
                            </Text>
                            <Text as="li" mb={1}>
                                {t("schedulerByTime.findOutMore.3")}
                            </Text>
                            <Text as="li" mb={1}>
                                {t("schedulerByTime.findOutMore.4")}
                            </Text>
                            <Text as="li" mb={1}>
                                {t("schedulerByTime.findOutMore.5")}
                            </Text>
                        </Box>
                        <FindOutMoreSchedulerByTimeImage />
                    </Flex>
                </Modal>
            )}
        </>
    );
}

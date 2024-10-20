import {urlService} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Button, Flex, Icon, Modal, TextInput, toast} from "@dashdoc/web-ui";
import {copyToClipboard, useToggle} from "dashdoc-utils";
import React from "react";
import {useParams} from "react-router";
import {useSelector} from "redux/hooks";
import {selectSite} from "redux/reducers/flow/site.slice";

export function ShareSiteAction() {
    const {slug} = useParams<{slug: string}>();
    const site = useSelector(selectSite);
    const [isManualCopy, setManualCopy, unsetManualCopy] = useToggle();

    const url = urlService.getFlowSiteUrl(slug);
    return (
        <>
            <Button
                variant="secondary"
                onClick={handleAction}
                width="100%"
                data-testid="share-site-button"
                disabled={site === null}
            >
                <Icon name="link" mr={2} />
                {t("flow.sidebar.shareSiteLink")}
            </Button>

            {/* When we can't copy with copyToClipboard, we display a modal with the link to copy */}
            {isManualCopy && <ManualCopy url={url} onClose={unsetManualCopy} />}
        </>
    );

    function handleAction() {
        copyToClipboard(
            url,
            () => toast.success(t("common.linkCopied")),
            () => {
                setManualCopy();
            }
        );
    }
}

function ManualCopy({url, onClose}: {url: string; onClose: () => void}) {
    return (
        <Modal
            title={t("flow.sidebar.shareSiteLink")}
            id="copy-link-modal"
            onClose={onClose}
            mainButton={null}
            secondaryButton={{"data-testid": "close-modal", children: t("common.close")}}
        >
            <Flex flex={1}>
                <TextInput
                    data-testid="share-link-button"
                    label={t("common.copyLink")}
                    containerProps={{flex: 1, marginRight: "8px"}}
                    value={url}
                    onChange={() => {}}
                    onClick={(event) => {
                        if (
                            "select" in event.target &&
                            typeof event.target.select === "function"
                        ) {
                            event.target.select();
                        }
                    }}
                    autoFocus
                    onFocus={(event) => event.target.select()}
                ></TextInput>
            </Flex>
        </Modal>
    );
}

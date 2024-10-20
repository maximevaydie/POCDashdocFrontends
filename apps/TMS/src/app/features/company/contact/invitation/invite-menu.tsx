import {PartnerContactOutput, getContactInvitationStatus} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Button, Flex, Modal, TextInput, toast} from "@dashdoc/web-ui";
import {copyToClipboard, Contact, useToggle} from "dashdoc-utils";
import React, {useCallback} from "react";

import {fetchInviteContact, fetchRetrieveContact} from "app/redux/actions/contacts";
import {useDispatch} from "app/redux/hooks";

type InviteContactModalProps = {
    inviteStatus: string;
    invitationLink: string;
    sendViaDashdoc: () => void;
    onClose: () => void;
};

function InviteContactModal({
    inviteStatus,
    invitationLink,
    sendViaDashdoc,
    onClose,
}: InviteContactModalProps) {
    const copyInvitationLink = () => {
        copyToClipboard(
            invitationLink,
            () => toast.success(t("common.linkCopied")),
            () => toast.error(t("common.linkCopyFailed"))
        );
    };

    return (
        <Modal
            title={t("components.inviteContact")}
            id="invite-contact-modal"
            onClose={onClose}
            mainButton={{
                onClick: sendViaDashdoc,
                "data-testid": "send-invite-via-dashdoc",
                children: inviteStatus,
            }}
            secondaryButton={{"data-testid": "close-modal", children: t("common.close")}}
        >
            <Flex flex={1}>
                <TextInput
                    data-testid="invitation-link-button"
                    label={t("components.invitationLink")}
                    disabled
                    containerProps={{flex: 1, marginRight: "8px"}}
                    value={invitationLink}
                    onChange={() => {}}
                    onFocus={(event) => event.target.select()}
                ></TextInput>
                <Button
                    ml={2}
                    variant="plain"
                    data-testid="copy-invitation-link"
                    onClick={copyInvitationLink}
                >
                    {t("common.copyLink")}
                </Button>
            </Flex>
        </Modal>
    );
}

type InviteButtonProps = {
    contact: Contact | PartnerContactOutput;
    onEditContact: () => void;
    inviteStatus: string;
};

export default function InviteButton({inviteStatus, contact, onEditContact}: InviteButtonProps) {
    const [isModalOpen, openModal, closeModal] = useToggle();

    const contactInvitationStatus = getContactInvitationStatus(contact);

    const contactHasEmail = () => {
        if (!contact.email) {
            const editContact = confirm(t("components.cantActivateContact"));
            if (editContact) {
                onEditContact();
            }
            return false;
        }
        return true;
    };

    const dispatch: (action: any) => Promise<any> = useDispatch();
    const sendViaDashdoc = useCallback(() => {
        dispatch(fetchInviteContact(contact.uid))
            .then(() => {
                return dispatch(fetchRetrieveContact(contact.uid));
            })
            .then(() => {
                closeModal();
            })
            .catch(() => {
                toast.error(t("common.error"));
            });
    }, [dispatch, contact]);

    const handleInviteButtonClicked = useCallback(() => {
        const contact_has_email = contactHasEmail();
        if (contact_has_email) {
            if (contactInvitationStatus !== "invited") {
                return sendViaDashdoc();
            } else {
                return openModal();
            }
        }
    }, [contact.email, contactInvitationStatus]);

    return (
        <Flex ml={2}>
            {contactInvitationStatus !== "registered" && (
                <Button
                    variant={contactInvitationStatus === "invited" ? "plain" : "secondary"}
                    size="small"
                    onClick={handleInviteButtonClicked}
                    data-testid={`invite-contact-${contact.last_name}`}
                >
                    {inviteStatus}
                </Button>
            )}
            {isModalOpen && (
                <InviteContactModal
                    inviteStatus={inviteStatus}
                    // @ts-ignore
                    invitationLink={contact.invitation_link}
                    sendViaDashdoc={sendViaDashdoc}
                    onClose={closeModal}
                ></InviteContactModal>
            )}
        </Flex>
    );
}

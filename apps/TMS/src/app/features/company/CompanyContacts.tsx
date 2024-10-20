import {
    contactIsInvitable,
    getContactInvitationStatus,
    PartnerContactOutput,
    PartnerDetailOutput,
    useFeatureFlag,
    fetchPartner,
} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Box, Callout, Flex, Icon, IconButton, Text, TooltipWrapper, theme} from "@dashdoc/web-ui";
import {css} from "@emotion/react";
import {Company, Contact, useToggle} from "dashdoc-utils";
import React, {ComponentProps} from "react";
import {useLocation} from "react-router";

import {useSlimCompany} from "app/hooks/useSlimCompany";
import {fetchDeleteContact, fetchRetrieveContact} from "app/redux/actions";
import {useDispatch} from "app/redux/hooks";

import {AddContactModal, getJobsSelectOptions} from "./contact/AddContactModal";
import {InvitationBadge} from "./contact/invitation/invitation-badge";
import InviteButton from "./contact/invitation/invite-menu";

type Props = {
    company: Company | PartnerDetailOutput;
};

export function CompanyContacts({company}: Props) {
    const contacts = company.contacts;
    const location = useLocation();
    const isHighlighted = location.search.includes(`highlight_contacts=true`);
    return (
        <div className="row">
            <div
                className="col-md-12"
                css={
                    isHighlighted &&
                    css`
                        background: ${theme.colors.yellow.light};
                        animation: fadeOut 0.8s forwards;
                        animation-delay: 2s;

                        @keyframes fadeOut {
                            from {
                                background: ${theme.colors.yellow.light};
                            }
                            to {
                                background: transparent;
                            }
                        }
                    `
                }
            >
                {contacts &&
                    contacts.map((contact) => (
                        <AContact company={company} contact={contact} key={contact.uid} />
                    ))}
                {(!contacts || contacts.length === 0) && <NoContact company={company} />}
            </div>
        </div>
    );
}

function AContact({
    contact,
    company,
}: {
    contact: Contact | PartnerContactOutput;
    company: Company | PartnerDetailOutput;
}) {
    const [isEditModalOpen, openEditModal, closeEditModal] = useToggle();
    const dispatch = useDispatch();
    const location = useLocation();
    const isSelected = location.search.includes(`contact_uid=${contact.uid}`);
    const options = getJobsSelectOptions();
    const jobLabels = contact.jobs
        ?.map((job) => options.find((option) => option.value === job)?.label)
        .filter((jobLabel) => jobLabel)
        .join(", ");

    const hasBetterCompanyRolesEnabled = useFeatureFlag("betterCompanyRoles");

    const contactInvitationStatus = getContactInvitationStatus(contact);
    const slimCompany = useSlimCompany(company);

    return (
        <>
            <Flex
                flexDirection="row"
                mb={4}
                css={
                    isSelected &&
                    css`
                        margin: 5px -5px;
                        padding: 5px;
                        border-radius: 3px;
                        background: ${theme.colors.yellow.light};
                        animation: fadeOut 0.8s forwards;
                        animation-delay: 2s;

                        @keyframes fadeOut {
                            from {
                                background: ${theme.colors.yellow.light};
                            }
                            to {
                                background: transparent;
                            }
                        }
                    `
                }
                key={contact.uid}
            >
                <Flex flex={1} flexDirection={"column"}>
                    <Flex flexDirection={"column"} data-testid={`contact-${contact.last_name}`}>
                        <Flex justifyContent="space-between" alignItems="baseline">
                            <Flex alignItems="baseline">
                                <Text variant="h2" mr={2}>
                                    {getContactName()}
                                </Text>
                                <InvitationBadge invitationStatus={contactInvitationStatus} />
                            </Flex>
                            <Flex alignItems="center" flexShrink={0}>
                                {contactIsInvitable(contact, company) && (
                                    <InviteButton
                                        inviteStatus={
                                            contactInvitationStatus === "invited"
                                                ? t("components.resendInvitation")
                                                : t("components.inviteToDashdoc")
                                        }
                                        contact={contact}
                                        onEditContact={openEditModal}
                                    />
                                )}

                                <Box>
                                    <IconButton
                                        name="edit"
                                        title={t("common.edit")}
                                        className="btn btn-default btn-xs"
                                        onClick={openEditModal}
                                        data-testid={`contact-edit-${contact.last_name}`}
                                    />
                                </Box>
                                <Box>
                                    <IconButton
                                        name="delete"
                                        title={t("common.delete")}
                                        className="btn btn-default btn-xs"
                                        data-testid={`contact-delete-${contact.last_name}`}
                                        onClick={handleDeleteContact}
                                    />
                                </Box>
                            </Flex>
                        </Flex>
                    </Flex>
                    <Flex flexDirection={"column"}>
                        <ContactInfo icon="envelope">
                            {contact.email ? (
                                <a href={`mailto:${contact.email}`}>{contact.email}</a>
                            ) : (
                                t("common.unspecified")
                            )}
                        </ContactInfo>
                        <ContactInfo icon="phone">
                            {contact.phone_number || t("common.unspecified")}
                        </ContactInfo>
                        {jobLabels && (
                            <ContactInfo
                                icon="acknowledged"
                                dataTestId={`contact-jobs-${contact.last_name}`}
                            >
                                {jobLabels}
                            </ContactInfo>
                        )}
                        <TooltipWrapper content={t("components.remoteIdTooltip")}>
                            <ContactInfo icon="link">
                                {contact.remote_id || t("common.unspecified")}
                            </ContactInfo>
                        </TooltipWrapper>
                    </Flex>
                </Flex>
            </Flex>

            {isEditModalOpen && (
                <AddContactModal
                    company={slimCompany}
                    contact={contact as Contact}
                    onClose={handleContactEdited}
                />
            )}
        </>
    );

    function getContactName() {
        if (contact.first_name || contact.last_name) {
            return `${contact.first_name} ${contact.last_name}`;
        }
        return t("common.unknownName");
    }

    async function handleContactEdited() {
        closeEditModal();
        if (hasBetterCompanyRolesEnabled) {
            await dispatch(fetchPartner(company.pk));
        } else {
            await dispatch(fetchRetrieveContact(contact.uid));
        }
    }

    function handleDeleteContact() {
        const yes = confirm(
            contactInvitationStatus === "registered" && company.can_invite_to
                ? t("components.confirmDeleteContactManager", {
                      carrierName: contact.company.name,
                  })
                : t("components.confirmDeleteContact")
        );
        if (!yes) {
            return;
        }
        dispatch(fetchDeleteContact(contact.uid));
    }
}

function NoContact({company}: {company: Company | PartnerDetailOutput}) {
    return (
        <Callout>
            {t(
                company.can_invite_to
                    ? "components.noContactCompany"
                    : "components.noContactsSelfManagedCompany",
                {company: company.name}
            )}
        </Callout>
    );
}

function ContactInfo({
    icon,
    children,
    dataTestId,
}: {
    icon: ComponentProps<typeof Icon>["name"];
    children: React.ReactNode;
    dataTestId?: string;
}) {
    return (
        <Text variant="captionBold" data-testid={dataTestId}>
            <Icon mr={1} name={icon} />
            {children}
        </Text>
    );
}

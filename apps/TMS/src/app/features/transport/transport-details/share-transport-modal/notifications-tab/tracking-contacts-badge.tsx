import {Badge, Flex, IconButton, BadgeProps, Text} from "@dashdoc/web-ui";
import {SimpleContact} from "dashdoc-utils";
import React, {FunctionComponent} from "react";

type ContactBadgeProps = BadgeProps & {
    contact: SimpleContact;
    onDelete: ((...args: unknown[]) => void) | null;
};

const ContactBadge: FunctionComponent<ContactBadgeProps> = ({contact, onDelete, ...props}) => (
    <Badge as={Flex} alignItems="center" ml={2} mb={2} paddingX={0} pl={3} pr={1} {...props}>
        <Text whiteSpace="pre-wrap" overflowWrap="break-word">
            {contact.first_name} {contact.last_name} ({contact.email})
        </Text>
        {onDelete && <IconButton name="close" onClick={onDelete} fontSize={0} ml={2} />}
    </Badge>
);

export default ContactBadge;

import {t} from "@dashdoc/web-core";
import {Flex, Box, Text} from "@dashdoc/web-ui";
import {UserAvatar} from "@dashdoc/web-ui";
import {TooltipWrapper} from "@dashdoc/web-ui";
import {formatDateDistance} from "dashdoc-utils";
import React from "react";

import {PageVisitsResponse} from "./types";

type Props = {
    visits: PageVisitsResponse;
};

export function PageVisitsView({visits}: Props) {
    const badges = visits.slice(0, 5);
    const overflowing = visits.slice(5);
    return (
        <Flex alignItems="center">
            {badges.map((visit, index) => (
                <Box key={index} zIndex={100 - index} mr={"-2px"}>
                    <TooltipWrapper
                        content={
                            <Box>
                                <Flex alignItems="center">
                                    <UserAvatar
                                        name={visit.display_name}
                                        picture={visit.profile_picture}
                                    />
                                    <Box ml={2}>
                                        <Flex>
                                            <Text>{visit.display_name}</Text>
                                            <Text ml={2} color="grey.dark">
                                                {visit.company_name}
                                            </Text>
                                        </Flex>
                                        <Text color="grey.dark">{visit.email}</Text>
                                    </Box>
                                </Flex>

                                <Text variant="caption" color="grey.dark" mt={2} ml={60}>
                                    {t("pageVisits.viewedThisPage", {
                                        when: formatDateDistance(visit.last_visited),
                                    })}
                                </Text>
                                {visit.is_staff && (
                                    <Text variant="caption" color="yellow.dark" mt={2} ml={60}>
                                        {t("pageVisits.onlyVisibleToStaff")}
                                    </Text>
                                )}
                            </Box>
                        }
                        boxProps={{display: "flex"}}
                    >
                        <UserAvatar
                            size="small"
                            name={visit.display_name}
                            picture={visit.profile_picture}
                        />
                    </TooltipWrapper>
                </Box>
            ))}
            <Box ml={2}>
                {overflowing.length > 0 && (
                    <TooltipWrapper
                        placement="bottom"
                        content={
                            <Box>
                                {overflowing.map((visit) => (
                                    <Flex key={visit.id} alignItems="center" mb={2}>
                                        <UserAvatar
                                            size="xsmall"
                                            name={visit.display_name}
                                            picture={visit.profile_picture}
                                        />
                                        <Text ml={2} mr={2}>
                                            {visit.display_name}
                                        </Text>
                                        <Text mr={2} color="grey.dark">
                                            {visit.email}
                                        </Text>
                                        <Text variant="caption">
                                            {formatDateDistance(visit.last_visited)}
                                        </Text>
                                    </Flex>
                                ))}
                            </Box>
                        }
                    >
                        <Text fontWeight="bold" color="grey.dark">
                            {/* eslint-disable-line react/jsx-no-literals */}+{overflowing.length}
                        </Text>
                    </TooltipWrapper>
                )}
            </Box>
        </Flex>
    );
}

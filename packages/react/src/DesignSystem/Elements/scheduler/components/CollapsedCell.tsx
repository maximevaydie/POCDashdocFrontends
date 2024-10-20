import {areIntervalsOverlapping} from "date-fns";
import React from "react";

import {Flex} from "../../layout/Flex";
import {COLLAPSED_TIME_WIDTH} from "../gridStyles";
import {SchedulerCard} from "../scheduler.types";

type Props = {
    start: Date;
    end: Date;
    cards: SchedulerCard[] | undefined;
};
export function CollapsedCell({start, end, cards}: Props) {
    const numberOfCardsInside =
        cards?.filter((card) =>
            areIntervalsOverlapping({start, end}, {start: card.startDate, end: card.endDate})
        ).length ?? 0;
    return (
        <Flex
            marginLeft={"-1px"}
            zIndex={"level1"}
            position="relative"
            width={`${COLLAPSED_TIME_WIDTH + 1}px`}
            backgroundColor={numberOfCardsInside === 0 ? "grey.ultralight" : "yellow.ultralight"}
            borderBottom={"1px solid"}
            borderColor={"grey.light"}
        >
            <Flex
                height="100%"
                width="100%"
                alignItems="center"
                justifyContent="center"
                borderLeft={"2px solid"}
                borderRight={"2px solid"}
                borderColor={numberOfCardsInside === 0 ? "grey.default" : "yellow.default"}
            >
                {numberOfCardsInside > 0 && (
                    <Flex
                        borderRadius="50%"
                        backgroundColor="yellow.default"
                        width="18px"
                        height="18px"
                        alignItems="center"
                        justifyContent="center"
                        fontSize={0}
                        data-testid="alert-hidden-card"
                    >
                        {numberOfCardsInside}
                    </Flex>
                )}
            </Flex>
        </Flex>
    );
}

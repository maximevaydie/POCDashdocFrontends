import {Flex, Text, useResourceOffset} from "@dashdoc/web-ui";
import {Tag} from "@dashdoc/web-ui";
import {Tag as TagData} from "dashdoc-utils";
import React, {useLayoutEffect, useRef, useState} from "react";

interface TagsProps {
    tags: Array<TagData>;
    hideText: boolean;
    stickyContent?: boolean;
}

export function Tags({tags, hideText, stickyContent}: TagsProps) {
    const [visibleTagCount, setVisibleTagCount] = useState<number>(tags.length);
    const containerRef = useRef<HTMLDivElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        // Reset visible tag count to total tags as starting point
        setVisibleTagCount(tags.length);

        if (containerRef.current && wrapperRef.current) {
            let totalWidth = 0;
            let visibleCount = 0;

            const children = Array.from(wrapperRef.current.children).filter(
                (child) => child.tagName.toLowerCase() === "div"
            ) as HTMLDivElement[];

            const containerWidth = containerRef.current.offsetWidth;

            const availableWidth = containerWidth - (children.length - 1) * 4 - 12; // 4px is the gap between tags

            for (const child of children) {
                const tagWidth = child.offsetWidth;
                if (totalWidth + tagWidth > availableWidth) {
                    break;
                }
                visibleCount++;
                totalWidth += tagWidth;
            }
            setVisibleTagCount(visibleCount);
        }
    }, [tags.length, hideText, containerRef.current?.offsetWidth]);

    const visibleTags = tags.slice(0, visibleTagCount);
    const resourceOffset = useResourceOffset();

    return (
        <Flex
            backgroundColor="white"
            px={1}
            py="6px"
            ref={containerRef}
            width="100%"
            overflow="clip"
        >
            <Flex
                {...(stickyContent
                    ? {
                          position: "sticky",
                          width: "auto",
                          left: resourceOffset,
                      }
                    : {})}
                maxWidth="100%"
                style={{gap: "4px"}}
                ref={wrapperRef}
            >
                {visibleTags.map((tag, index) => (
                    <Tag tag={tag} key={index} hideText={hideText} size="small" flexShrink={0} />
                ))}
                {visibleTags.length < tags.length ? (
                    <Text variant="subcaption" lineHeight="0px" alignSelf="center">
                        +{tags.length - visibleTags.length}
                    </Text>
                ) : null}
            </Flex>
        </Flex>
    );
}

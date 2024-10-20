import {guid} from "@dashdoc/core";
import {LOCALES_OPTIONS, Locale, LocaleOption, localeService} from "@dashdoc/web-core";
import React, {ReactNode} from "react";

import {Tabs} from "../../base/tabs/Tabs";
import {IconButton} from "../../button/IconButton";
import {Box} from "../../../Elements/layout/Box";
import {Callout} from "../../../Elements/layout/Callout";
import {Flex} from "../../../Elements/layout/Flex";
import {TextArea} from "../TextArea";

import {LanguagePicker} from "./LanguagePicker";

export type MultilingualInputProps = {
    label?: string;
    readOnly?: boolean;
    localeOptions?: LocaleOption[];
    height?: number | string;
    defaultOpenTab?: Locale;
    value: Partial<Record<Locale, string>>; // {fr: "Valeur", en: "Value"...}
    error?: string;
    defaultValue?: Partial<Record<Locale, string>>; // {fr: "Valeur par défaut", en: "Default value"...}
    onChange: (value: Partial<Record<Locale, string>>) => void;
    onTabChange?: (tab: Locale) => void;
};
export function MultilingualInput({
    label,
    readOnly,
    localeOptions = LOCALES_OPTIONS,
    height,
    defaultOpenTab,
    value,
    error,
    defaultValue,
    onChange,
    onTabChange,
}: MultilingualInputProps) {
    const valueLocales = Object.keys(value) as Locale[];
    const remainingLanguages = getRemainingLanguages();
    const [activeTab, setActiveTab] = React.useState(
        defaultOpenTab ?? valueLocales.find(() => true) // focus first language if no default open tab
    );
    const [tabsKey, setTabsKey] = React.useState("_");
    const canDelete = !readOnly && valueLocales.length > 1;
    const tabs: {label: ReactNode; content: ReactNode; testId?: string}[] = Object.entries(
        value
    ).map(([language, v]) => {
        function handleChange(language: string, newV: string): void {
            const newValue = {...value, [language]: newV};
            onChange(newValue);
        }

        const shortLocale = localeService.getShortLocalLabel(language as Locale);
        return {
            label: shortLocale,
            testId: `${language}-tab`,
            content: (
                <Flex mt={2}>
                    <Box flexGrow={1}>
                        <TextArea
                            flexGrow={1}
                            value={v}
                            label={label ? `${label} (${shortLocale})` : undefined}
                            readOnly={readOnly}
                            height={height}
                            onChange={(newV: string) => handleChange(language, newV)}
                            data-testid={`${language}-textarea`}
                        />
                    </Box>
                    {canDelete && (
                        <Box ml={2}>
                            <IconButton
                                name="delete"
                                onClick={() => {
                                    handleDelete(language as Locale);
                                }}
                                data-testid={`${language}-delete`}
                            />
                        </Box>
                    )}
                </Flex>
            ),
        };
    });
    if (!readOnly && remainingLanguages.length > 0) {
        tabs.push({
            label: (
                <Box mb={1}>
                    <LanguagePicker availableLanguages={remainingLanguages} onPick={onPick} />
                </Box>
            ),
            testId: "add-language-tab",
            content: <Box />, //Empty content
        });
    }

    let initialActiveTabIndex = activeTab && valueLocales.indexOf(activeTab);
    if (initialActiveTabIndex === -1) {
        initialActiveTabIndex = undefined;
    }

    return (
        <>
            <Tabs
                key={tabsKey}
                tabs={tabs}
                initialActiveTab={initialActiveTabIndex}
                onTabChanged={(index: number) => handleTabChanged(valueLocales[index])}
                clickableTab={isClickableTab}
            />

            {error && (
                <Callout variant="danger" iconDisabled mt={2}>
                    {error}
                </Callout>
            )}
        </>
    );

    function isClickableTab(index: number) {
        return index < valueLocales.length;
    }

    function handleTabChanged(newTab: Locale): boolean {
        setActiveTab(newTab);
        setTabsKey(guid());
        onTabChange?.(newTab);
        return true;
    }

    function getRemainingLanguages(): LocaleOption[] {
        return localeOptions.filter(
            (option) => option.value && !valueLocales.includes(option.value)
        );
    }

    function handleDelete(language: Locale) {
        const oldIndex = valueLocales.indexOf(language);
        const newValue = {...value};
        delete newValue[language];
        onChange(newValue);
        const newIndex = Math.max(0, oldIndex - 1);
        handleTabChanged(Object.keys(newValue)[newIndex] as Locale);
    }

    function onPick(option: LocaleOption) {
        if (!option.value) {
            return;
        }
        let optionValue = "";
        if (defaultValue && defaultValue[option.value]) {
            const defaultValueLocale = defaultValue[option.value];
            if (defaultValueLocale) {
                optionValue = defaultValueLocale;
            }
        }
        const newValue = {...value, [option.value]: optionValue};
        onChange(newValue);
        handleTabChanged(option.value);
    }
}

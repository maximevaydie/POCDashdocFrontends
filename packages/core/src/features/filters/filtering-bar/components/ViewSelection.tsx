import {t} from "@dashdoc/web-core";
import {ConfirmationModal, Flex, Icon, Select, Text, theme} from "@dashdoc/web-ui";
import React, {useState} from "react";
import {components, ControlProps} from "react-select";

import {useDispatch} from "../../../../hooks/useDispatch";
import {useSelectorWithSettings} from "../../../../hooks/useSelector";
import {
    deleteSettingsView,
    settingsViewSelector,
} from "../../../../../../../react/Redux/reducers/settingsViewsReducer";
import {useSettingsViews} from "../hooks/useSettingsViews";

import type {GenericSettingsView} from "../genericSettingsViews.types";

type ViewSelectionProps<TQuery = Record<string, any>> = {
    selectedViewPk: number | undefined;
    setSelectedView: (view: GenericSettingsView<TQuery> | undefined) => void;
    viewCategory: string;
    deleteEnabled: boolean;
    displayViewName: boolean;
};

export function ViewSelection<TQuery extends Record<string, any>>({
    selectedViewPk,
    setSelectedView,
    viewCategory,
    deleteEnabled,
    displayViewName = false,
}: ViewSelectionProps<TQuery>) {
    const selectedView = useSelectorWithSettings(
        (state) =>
            (settingsViewSelector(state, selectedViewPk) as GenericSettingsView<TQuery>) ?? null
    );
    const views = useSettingsViews([viewCategory]) as GenericSettingsView<TQuery>[];
    const [deletingViewPk, setDeletingViewPk] = useState<number | undefined>();
    const dispatch = useDispatch();
    return (
        <>
            <Select<GenericSettingsView<TQuery>>
                data-testid="settings-view-select"
                options={views}
                value={selectedView}
                onChange={(view: GenericSettingsView<TQuery>) => {
                    setSelectedView(view);
                }}
                isClearable={false}
                getOptionValue={(view) => `${view.pk}`}
                formatOptionLabel={(view, labelMeta) => (
                    <Flex justifyContent="space-between" alignItems="center">
                        <Text ellipsis color="inherit">
                            {view.label}
                        </Text>
                        {deleteEnabled && labelMeta.context === "menu" && (
                            <Icon
                                style={{cursor: "pointer"}}
                                ml={2}
                                name="delete"
                                color="inherit"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setDeletingViewPk(view.pk);
                                }}
                                data-testid={`delete-view-${view.label}`}
                            />
                        )}
                    </Flex>
                )}
                noOptionsMessage={() => t("settingsViewSelection.noResultFound")}
                placeholder={t("filter.modifiedView")}
                styles={{
                    container: (base) => ({
                        ...base,
                        height: "41px",
                        paddingRight: 0,
                        paddingLeft: 0,
                        ...(displayViewName
                            ? {
                                  width: "15vw",
                                  maxWidth: "200px",
                                  minWidth: "50px",
                              }
                            : {}),
                    }),
                    valueContainer: (base) => ({
                        ...base,
                        paddingRight: 0,
                    }),
                    control: (base) => ({
                        ...base,
                        height: "inherit",
                    }),
                    menu: (base) => ({
                        ...base,
                        minWidth: "150px",
                        right: 0,
                        zIndex: theme.zIndices.filteringBar,
                    }),
                    indicatorSeparator: (base) => ({
                        ...base,
                        display: "none",
                    }),
                }}
                components={{
                    Control: ({children, ...props}: ControlProps<any, false>) => (
                        <components.Control {...props}>
                            <Icon name="eye" color="grey.dark" ml={2} />
                            {children}
                        </components.Control>
                    ),
                    DropdownIndicator: () => (
                        <Icon
                            display="flex"
                            height="41px"
                            name="arrowDown"
                            scale={0.5}
                            ml={displayViewName ? 1 : -2}
                        />
                    ),
                    ...(displayViewName
                        ? {}
                        : {
                              Placeholder: displayViewName
                                  ? undefined
                                  : () => <Flex ml={-3} height="41px" />,
                              SingleValue: displayViewName
                                  ? undefined
                                  : () => <Flex height="41px" />,
                          }),
                }}
            />
            {deletingViewPk && (
                <ConfirmationModal
                    data-testid="delete-view-confirmation-modal"
                    title={t("filter.deleteView")}
                    confirmationMessage={t("filter.deleteView.confirmation")}
                    onClose={() => setDeletingViewPk(undefined)}
                    mainButton={{
                        onClick: async () => {
                            if (selectedViewPk && selectedViewPk === deletingViewPk) {
                                setSelectedView(
                                    views.length > 1
                                        ? views.filter((v) => v.pk !== deletingViewPk)[0]
                                        : undefined
                                );
                            }
                            await dispatch(
                                deleteSettingsView({
                                    id: deletingViewPk,
                                })
                            );
                            setDeletingViewPk(undefined);
                        },
                        severity: "danger",
                        children: t("common.delete"),
                    }}
                    secondaryButton={{}}
                />
            )}
        </>
    );
}

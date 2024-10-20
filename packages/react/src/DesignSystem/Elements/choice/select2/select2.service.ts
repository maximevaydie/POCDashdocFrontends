function isFocused(selectRef: React.MutableRefObject<null>, option: {pk: number}) {
    let focusedOption: {pk: number} | undefined;
    // AsyncPaginatedCreatableSelect and AsyncPaginatedSelect don't have the same structure
    if ((selectRef.current as any)?.select?.select) {
        focusedOption = (selectRef.current as any)?.select?.select?.state?.focusedOption;
    } else if ((selectRef.current as any)?.select) {
        focusedOption = (selectRef.current as any)?.select?.state?.focusedOption;
    }

    const isFocused = focusedOption !== undefined && focusedOption.pk === option.pk;
    return isFocused;
}
export const select2Service = {
    isFocused,
};

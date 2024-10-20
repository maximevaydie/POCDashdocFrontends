export type AnyTransportsFiltersValueByPk<TValue> = Record<string | number, TValue | undefined>;

export const arrayToObject = <TValue extends {pk: string | number}>(
    items: TValue[]
): AnyTransportsFiltersValueByPk<TValue> =>
    items?.reduce((acc: AnyTransportsFiltersValueByPk<TValue>, item) => {
        acc[item.pk] = item;
        return acc;
    }, {});

import {useSelector} from "app/redux/hooks";

export function useFullCompany(pk: number | undefined) {
    const company = useSelector((state) => {
        return pk ? state.companies.items[pk] : undefined;
    });
    return company;
}

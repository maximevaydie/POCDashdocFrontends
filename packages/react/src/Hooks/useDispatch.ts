import {useDispatch as untypedUseDispatch} from "react-redux";
export const useDispatch: () => (action: any) => Promise<any> = untypedUseDispatch;

/**
 * The data-testid allows to retrieve the component in an E2E test case.
 */
export interface TestableProps {
    "data-testid": string;
}

export type Named = {
    name: string;
};

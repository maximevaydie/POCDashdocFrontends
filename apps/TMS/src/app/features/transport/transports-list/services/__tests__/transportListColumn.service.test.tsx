import {transportsListColumnService} from "../transportsListColumn.service";

describe("Test getTransportMargin method", () => {
    test("With no parent_split_turnover", async () => {
        testMargin(null, null);
    });

    test("With 0 subcontracting cost", async () => {
        testMargin(
            {
                subcontracting_cost: "0",
                subcontracting_margin: "0",
            },
            null
        );
    });

    test("With subcontracting cost and margin", async () => {
        testMargin(
            {
                subcontracting_cost: "200",
                subcontracting_margin: "40",
            },
            {margin: 40, percentage: 0.2}
        );
    });

    test("With negative margin", async () => {
        testMargin(
            {
                subcontracting_cost: "200",
                subcontracting_margin: "-10",
            },
            {margin: -10, percentage: -0.05}
        );
    });

    test("With null cost and margin", async () => {
        testMargin(
            {
                subcontracting_cost: null,
                subcontracting_margin: null,
            },
            null
        );
    });
});

function testMargin(
    parent_split_turnover: {
        subcontracting_cost: string | null;
        subcontracting_margin: string | null;
    } | null,
    expected: {margin: number; percentage: number} | null
) {
    const transport = {
        parent_split_turnover,
    };

    const result = transportsListColumnService.getTransportMargin(transport);
    expect(result).toStrictEqual(expected);
}

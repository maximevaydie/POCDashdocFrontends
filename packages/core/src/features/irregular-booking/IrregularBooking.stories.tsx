import {Box, Text} from "@dashdoc/web-ui";
import {Meta, Story} from "@storybook/react/types-6-0";
import {IrregularSlotTime} from "features/slot/actions/slot-booking/step/types";
import React from "react";
import {tz} from "services/date";

import {
    IrregularBooking as IrregularBookingComponent,
    IrregularBookingProps,
} from "./IrregularBooking";

export default {
    title: "flow/features",
    component: IrregularBookingComponent,
    args: {
        rootId: "root",
        dateRange: 30,
        currentDate: tz.convert("2021-09-01T08:00:00.000Z", "Europe/Paris"),
        onSubmit: (payload: IrregularSlotTime) => {
            alert(`onSubmit(startTime:${payload.startTime}, endTime:${payload.endTime})`);
        },
    },
    parameters: {
        backgrounds: {default: "white"},
    },
} as Meta;

const Template: Story<IrregularBookingProps> = (args) => (
    <Box
        style={{
            display: "grid",
            gridTemplateColumns: `100px  1fr`,
            gap: "30px",
        }}
    >
        <Text>Valid case</Text>
        <Box width="400px">
            <IrregularBookingComponent {...args} />
        </Box>

        <Text>Invalid case 1</Text>
        <Box width="400px">
            <IrregularBookingComponent
                {...args}
                selectedTime={{
                    startTime: "2021-09-01T08:00:00.000Z",
                    endTime: "2021-09-01T07:00:00.000Z",
                }}
            />
        </Box>

        <Text>Invalid case 2</Text>
        <Box width="400px">
            <IrregularBookingComponent
                {...args}
                selectedTime={{
                    startTime: "2021-10-01T08:00:00.000Z",
                    endTime: "2021-09-01T08:00:00.000Z",
                }}
            />
        </Box>

        <Text>Invalid case 3</Text>
        <Box width="400px">
            <IrregularBookingComponent
                {...args}
                selectedTime={{
                    startTime: "2021-10-01T08:00:00.000Z",
                    endTime: "2021-10-01T08:00:00.000Z",
                }}
            />
        </Box>
    </Box>
);

export const CustomBooking = Template.bind({});

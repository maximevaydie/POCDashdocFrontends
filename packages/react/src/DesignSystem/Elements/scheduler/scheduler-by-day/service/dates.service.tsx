import {startOfDay, endOfDay, eachDayOfInterval, isSaturday, isSunday} from "date-fns";

function getDatesSection({
    start,
    end,
    hideSaturdays,
    hideSundays,
}: {
    start: Date;
    end: Date;
    hideSaturdays: boolean;
    hideSundays: boolean;
}) {
    // compute all visible date range sections of the planning according weekends to hide
    let days = eachDayOfInterval({start: startOfDay(start), end: endOfDay(end)});
    if (hideSaturdays || hideSundays) {
        // Get the list of days within the selected period

        let currentSection: Date[] | null = null;
        let sections: Date[][] = [];

        // Go through each day and create a new section each time we encounter a period to hide
        days.map((day) => {
            // Check for each day
            if ((hideSaturdays && isSaturday(day)) || (hideSundays && isSunday(day))) {
                // if day is part of the weekend and should be hidden
                // then we should end the section and start a new one after the weekend
                if (currentSection) {
                    sections.push(currentSection);
                    currentSection = null;
                }
            } else if (currentSection === null) {
                // otherwise init a new section at current day
                currentSection = [day];
            } else {
                // and update end day until we reach a hidden period
                currentSection.push(day);
            }
        });
        // add last computed section in the list
        if (currentSection) {
            sections.push(currentSection);
        }
        return sections;
    }

    return [days];
}

export const schedulerByDayDatesService = {
    getDatesSection,
};

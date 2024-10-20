export type PageVisit = {
    id: number;
    display_name: string;
    last_visited: string;
    email: string;
    company_name: string;
    is_staff: boolean;
    profile_picture: string;
};

export type PageVisitsResponse = PageVisit[];

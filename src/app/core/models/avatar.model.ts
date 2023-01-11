export interface Avatar {
    id: number;
    name: string;
    image: string;
    effort_cost: number;
    unlocked: boolean;
    selected: boolean;
    displayCheckMark?: boolean;
    clicked?: boolean;
}

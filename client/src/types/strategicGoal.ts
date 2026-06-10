import type {IOperationalGoal} from "./operationalGoal.ts";

export interface IStrategicGoal {
    id?: string;
    strategyId?: string,
    label: string,
    number?: number,
    title: string
    operationalGoals?: IOperationalGoal[]
}
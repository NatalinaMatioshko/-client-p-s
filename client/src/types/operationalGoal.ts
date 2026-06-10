import type {IProgramTask} from "./programTask.ts";

export interface IOperationalGoal {
    id?: string;
    strategicGoalId?: string,
    label: string,
    number?: number,
    title: string
    programTasks?: IProgramTask[]
}
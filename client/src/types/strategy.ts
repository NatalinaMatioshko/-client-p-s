import type { IStrategicGoal } from './strategicGoal.ts'

export interface IStrategy {
  id?: string
  regionId?: string | null
  districtId?: string | null
  communityId?: string | null
  title: string
  strategyUrl?: string | null
  strategicGoals?: IStrategicGoal[]
}

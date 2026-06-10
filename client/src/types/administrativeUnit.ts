import type { IStrategy } from './strategy.ts'

export type AdministrativeUnitKind = 'Region' | 'District' | 'Community'

export interface IAdministrativeUnit {
  id?: string
  kattotgId: string
  name: string
  nameFull: string
  category: string
  imgUrl?: string | null
  regionId?: string
  districtId?: string
  websiteUrl?: string | null
  strategiesUrl?: string | null
  type?: AdministrativeUnitKind
  strategies?: IStrategy[]
}

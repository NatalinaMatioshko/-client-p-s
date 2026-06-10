import { apiGet } from './api'

interface Unit {
  id: string
  name: string
  type: 'Region' | 'District' | 'Community'
}

interface CatalogEntry {
  id: string
  city: string
  unitId: string
  strategyId: string
  title: string
  period: string
  summary: string
  directions: string[]
  status: 'active' | 'archive'
  strategyUrl: string | null
  officialSourceUrl: string | null
  fileUrl: string | null
}

let strategiesCache: Promise<CatalogEntry[]> | null = null
let unitsCache: Promise<Unit[]> | null = null
const strategyDetailsCache = new Map<string, Promise<any>>()

function normalize(value: any): string {
  return String(value ?? '').trim().toLowerCase()
}

function extractPeriod(title: string): string {
  const match = title?.match(/(20\d{2})\s*[–-]\s*(20\d{2})/)
  if (!match) return ''
  return `${match[1]}–${match[2]}`
}

function getStatus(period: string): 'active' | 'archive' {
  const endYear = Number(period?.match(/20\d{2}\s*[–-]\s*(20\d{2})/)?.[1])
  if (!endYear) return 'active'
  return endYear < new Date().getFullYear() ? 'archive' : 'active'
}

function getCityFromUnitName(name: string): string {
  return (
    name
      ?.replace(/\s+міська територіальна громада$/i, '')
      ?.replace(/\s+територіальна громада$/i, '')
      ?.trim() || 'Невідома територія'
  )
}

function normalizeTask(task: any): any {
  return {
    ...task,
    label: task.label ?? String(task.number ?? ''),
    description: task.description ?? '',
  }
}

function normalizeOperationalGoal(goal: any): any {
  const programTasks = goal.programTasks ?? []

  return {
    ...goal,
    label: goal.label ?? String(goal.number ?? ''),
    title: goal.title ?? '',
    programTasks: programTasks.map(normalizeTask),
  }
}

function normalizeStrategicGoal(goal: any): any {
  const operationalGoals = goal.operationalGoals ?? []

  return {
    ...goal,
    label: goal.label ?? String(goal.number ?? ''),
    title: goal.title ?? '',
    operationalGoals: operationalGoals.map(normalizeOperationalGoal),
  }
}

export function normalizeStrategy(strategy: any): any {
  const strategicGoals = strategy.strategicGoals ?? []

  return {
    ...strategy,
    title: strategy.title ?? '',
    strategyUrl: strategy.strategyUrl ?? null,
    regionId: strategy.regionId ?? null,
    districtId: strategy.districtId ?? null,
    communityId: strategy.communityId ?? null,
    strategicGoals: strategicGoals.map(normalizeStrategicGoal),
  }
}

function getStrategyUnitId(strategy: any): string {
  return strategy.communityId ?? strategy.districtId ?? strategy.regionId
}

function getDirections(strategy: any): string[] {
  const directions = (strategy.strategicGoals ?? [])
    .flatMap((strategicGoal: any) => strategicGoal.operationalGoals ?? [])
    .map((operationalGoal: any) => operationalGoal.title)
    .filter(Boolean)

  return [...new Set(directions)]
}

function buildCatalogEntry(strategy: any, unit: Unit | undefined): CatalogEntry {
  const normalizedStrategy = normalizeStrategy(strategy)
  const period = extractPeriod(normalizedStrategy.title)
  const directions = getDirections(normalizedStrategy)
  const sourceUrl = normalizedStrategy.strategyUrl || null

  return {
    id: normalizedStrategy.id,
    city: getCityFromUnitName(unit?.name),
    unitId: getStrategyUnitId(normalizedStrategy),
    strategyId: normalizedStrategy.id,
    title: normalizedStrategy.title,
    period,
    summary: unit?.name
      ? `Стратегічний документ: ${unit.name}.`
      : 'Стратегічний документ територіальної одиниці.',
    directions,
    status: getStatus(period),
    strategyUrl: sourceUrl,
    officialSourceUrl: sourceUrl,
    fileUrl: sourceUrl?.toLowerCase().endsWith('.pdf') ? sourceUrl : null,
  }
}

async function getUnitsMap(): Promise<Map<string, Unit>> {
  if (!unitsCache) {
    unitsCache = Promise.all([
      apiGet('/api/Regions'),
      apiGet('/api/Districts'),
      apiGet('/api/Communities'),
    ]).then(([regions, districts, communities]) => {
      const allUnits: Unit[] = []
      regions.forEach((r: any) =>
        allUnits.push({ id: r.id, name: r.nameFull || r.name, type: 'Region' }),
      )
      districts.forEach((d: any) =>
        allUnits.push({ id: d.id, name: d.nameFull || d.name, type: 'District' }),
      )
      communities.forEach((c: any) =>
        allUnits.push({ id: c.id, name: c.nameFull || c.name, type: 'Community' }),
      )
      return allUnits
    })
  }

  const units = await unitsCache
  return new Map(units.map((unit) => [unit.id, unit]))
}

function getStrategyById(id: string): Promise<any> {
  if (!strategyDetailsCache.has(id)) {
    strategyDetailsCache.set(
      id,
      apiGet(`/api/Strategies/${id}`).then(normalizeStrategy),
    )
  }

  return strategyDetailsCache.get(id)!
}

async function getCatalog(): Promise<CatalogEntry[]> {
  if (!strategiesCache) {
    strategiesCache = Promise.all([apiGet('/api/Strategies'), getUnitsMap()]).then(
      ([strategies, unitsById]) =>
        strategies.map((strategy: any) => {
          const unitId = getStrategyUnitId(strategy)
          return buildCatalogEntry(strategy, unitsById.get(unitId))
        }),
    )
  }

  return strategiesCache
}

export async function getCities(): Promise<string[]> {
  const catalog = await getCatalog()
  const cities = [...new Set(catalog.map((item) => item.city))]
  return cities.sort((a, b) => a.localeCompare(b, 'uk'))
}

export async function getDirectionsList(): Promise<string[]> {
  const catalog = await getCatalog()
  const all = catalog.flatMap((item) => item.directions ?? [])
  return [...new Set(all)].sort((a, b) => a.localeCompare(b, 'uk'))
}

export { getDirectionsList as getDirections }

export async function searchStrategies(query: string): Promise<CatalogEntry[]> {
  const q = normalize(query)
  if (!q) return []

  const catalog = await getCatalog()

  return catalog.filter((item) => {
    const haystack = [
      item.city,
      item.title,
      item.summary,
      item.period,
      ...(item.directions ?? []),
    ]
      .join(' ')
      .toLowerCase()

    return haystack.includes(q)
  })
}

export async function getCatalogEntryById(id: string): Promise<CatalogEntry> {
  const [strategy, unitsById] = await Promise.all([
    getStrategyById(id),
    getUnitsMap(),
  ])

  const unitId = getStrategyUnitId(strategy)
  return buildCatalogEntry(strategy, unitsById.get(unitId))
}

export async function getStrategiesByCity(city: string): Promise<CatalogEntry[]> {
  if (!city) return []
  const catalog = await getCatalog()
  return catalog.filter((item) => item.city === city)
}

export async function loadStrategyForCatalogEntry(
  catalogEntry: CatalogEntry,
): Promise<{ unit: Unit | undefined; strategy: any }> {
  const [strategy, unitsById] = await Promise.all([
    getStrategyById(catalogEntry.strategyId ?? catalogEntry.id),
    getUnitsMap(),
  ])

  const unit = unitsById.get(catalogEntry.unitId)

  return {
    unit,
    strategy,
  }
}

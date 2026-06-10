interface MeasureRow {
  id: string
  label: string
  description: string
  strategicGoalTitle: string
  operationalGoalTitle: string
  direction: string
  executor?: string
  deadline?: string
  budgetLabel?: string
  budgetMln?: number
  status?: 'done' | 'in_progress' | 'planned'
}

interface DashboardMetrics {
  budgetTotalMln: number
  budgetUsedMln: number
  budgetUsedPercent: number
  tasksDone: number
  tasksInProgress: number
  tasksTotal: number
  executionPercent: number
  periodElapsed: number
  periodLabel: string
  [key: string]: any
}

const EXECUTORS = [
  'Департамент освіти',
  'Департамент соціальної політики',
  'Департамент економіки',
  'Управління містобудування',
  'Відділ цифровізації',
  'Департамент охорони здоров\'я',
]

const MONTHS_UK = [
  'Січень',
  'Лютий',
  'Березень',
  'Квітень',
  'Травень',
  'Червень',
  'Липень',
  'Серпень',
  'Вересень',
  'Жовтень',
  'Листопад',
  'Грудень',
]

function hashString(value: string): number {
  let hash = 0
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

export function parsePeriod(period: string): { start: number; end: number } | null {
  const match = period?.match(/(\d{4})\s*[–-]\s*(\d{4})/)
  if (!match) return null
  return { start: Number(match[1]), end: Number(match[2]) }
}

export function getPeriodElapsedPercent(period: string, now: Date = new Date()): number {
  const parsed = parsePeriod(period)
  if (!parsed) return 0

  const current = now.getFullYear() + now.getMonth() / 12
  if (current <= parsed.start) return 0
  if (current >= parsed.end) return 100
  return Math.round(((current - parsed.start) / (parsed.end - parsed.start)) * 100)
}

export function flattenTasks(strategy: any): MeasureRow[] {
  const rows: MeasureRow[] = []

  for (const strategicGoal of strategy.strategicGoals ?? []) {
    for (const operationalGoal of strategicGoal.operationalGoals ?? []) {
      for (const task of operationalGoal.programTasks ?? []) {
        rows.push({
          id: task.id,
          label: task.label,
          description: task.description,
          strategicGoalTitle: strategicGoal.title,
          operationalGoalTitle: operationalGoal.title,
          direction: operationalGoal.title,
        })
      }
    }
  }

  return rows
}

function getTaskStatus(taskId: string, periodElapsedPercent: number): 'done' | 'in_progress' | 'planned' {
  const bucket = hashString(taskId) % 100
  const executionBias = Math.min(periodElapsedPercent, 85)

  if (bucket < executionBias * 0.4) return 'done'
  if (bucket < executionBias * 0.85) return 'in_progress'
  return 'planned'
}

function formatBudgetMln(amountMln: number): string {
  if (amountMln >= 100) return `${amountMln.toFixed(0)} млн`
  if (amountMln >= 10) return `${amountMln.toFixed(1)} млн`
  return `${amountMln.toFixed(2)} млн`
}

function formatDeadline(taskId: string, period: string): string {
  const parsed = parsePeriod(period)
  const year = parsed?.end ?? new Date().getFullYear() + 1
  const month = hashString(taskId) % 12
  return `${MONTHS_UK[month]} ${year}`
}

export function buildMeasureRows(strategy: any, catalogEntry: any): MeasureRow[] {
  const period = catalogEntry.period
  const periodElapsed = getPeriodElapsedPercent(period)
  const tasks = flattenTasks(strategy)

  return tasks.map((task) => {
    const status = getTaskStatus(task.id, periodElapsed)
    const budgetMln = 0.4 + (hashString(task.id) % 280) / 100

    return {
      ...task,
      executor: EXECUTORS[hashString(task.id) % EXECUTORS.length],
      deadline: formatDeadline(task.id, period),
      budgetLabel: formatBudgetMln(budgetMln),
      budgetMln,
      status,
    }
  })
}

export function computeDashboardMetrics(strategy: any, catalogEntry: any): DashboardMetrics {
  const period = catalogEntry.period
  const parsed = parsePeriod(period)
  const periodElapsed = getPeriodElapsedPercent(period)
  const measures = buildMeasureRows(strategy, catalogEntry)

  const tasksTotal = measures.length
  const tasksDone = measures.filter((m) => m.status === 'done').length
  const tasksInProgress = measures.filter((m) => m.status === 'in_progress').length

  const operationalGoals = (strategy.strategicGoals ?? []).reduce(
    (sum: number, sg: any) => sum + (sg.operationalGoals?.length ?? 0),
    0,
  )
  const strategicGoals = strategy.strategicGoals?.length ?? 0

  const budgetTotalMln =
    catalogEntry.budgetTotalMln ??
    Math.round(measures.reduce((sum: number, m) => sum + m.budgetMln!, 0) * 10) / 10

  const executionPercent =
    tasksTotal === 0 ? 0 : Math.round((tasksDone / tasksTotal) * 100)

  const budgetUsedMln =
    Math.round(budgetTotalMln * (0.35 + executionPercent / 200) * 10) / 10

  const uniqueDirections = [
    ...new Set(measures.map((m) => m.direction).filter(Boolean)),
  ]

  return {
    budgetTotalMln,
    budgetUsedMln,
    budgetUsedPercent: Math.round((budgetUsedMln / budgetTotalMln) * 100) || 0,
    tasksDone,
    tasksInProgress,
    tasksTotal,
    executionPercent,
    periodElapsed,
    periodLabel: parsed ? `${parsed.start}–${parsed.end}` : period,
    periodYearsTotal: parsed ? parsed.end - parsed.start + 1 : null,
    periodYearsPassed: parsed
      ? Math.min(parsed.end, new Date().getFullYear()) - parsed.start + 1
      : null,
    strategicGoals,
    operationalGoals,
    directionsCount: uniqueDirections.length,
    partnersCount: catalogEntry.partnersCount ?? Math.min(12, 4 + strategicGoals * 2),
    kpiPercent: Math.min(98, Math.round(executionPercent * 0.85 + periodElapsed * 0.15)),
  }
}

export const STATUS_LABELS: Record<string, string> = {
  done: 'Виконано',
  in_progress: 'В процесі',
  planned: 'Планується',
}

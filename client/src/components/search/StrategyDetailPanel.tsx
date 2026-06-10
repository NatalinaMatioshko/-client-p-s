import { useMemo } from 'react'
import {
  buildMeasureRows,
  computeDashboardMetrics,
} from '../../lib/strategyMetrics'
import { StrategyDashboard } from './StrategyDashboard'
import { StrategyMeasuresTable } from './StrategyMeasuresTable'
import { StrategyGoalsTree } from './StrategyGoalsTree'

export function StrategyDetailPanel({ catalogEntry, loaded, loading, error }) {
  const strategy = loaded?.strategy
  const unitName = loaded?.unit?.name

  const metrics = useMemo(() => {
    if (!strategy || !catalogEntry) return null
    return computeDashboardMetrics(strategy, catalogEntry)
  }, [strategy, catalogEntry])

  const measureRows = useMemo(() => {
    if (!strategy || !catalogEntry) return []
    return buildMeasureRows(strategy, catalogEntry)
  }, [strategy, catalogEntry])

  const directionLabel =
    catalogEntry.directions?.[0] ?? measureRows[0]?.direction ?? 'Загальний огляд'

  const sourceLink = catalogEntry.officialSourceUrl ?? strategy?.strategyUrl ?? null
  const fileLink = catalogEntry.fileUrl
  const fileDisabled = !fileLink
  const sourceDisabled = !sourceLink

  if (loading) {
    return <p className="strategy-detail__loading muted">Завантаження стратегії…</p>
  }

  if (error) {
    return <p className="strategy-detail__error">{error}</p>
  }

  if (!strategy || !metrics) return null

  return (
    <div className="strategy-detail">
      <header className="strategy-detail__header">
        <div>
          <p className="strategy-detail__city">{catalogEntry.city}</p>
          {unitName && <p className="muted strategy-detail__unit">{unitName}</p>}
          <h2 className="strategy-detail__title">{strategy.title}</h2>
        </div>
        <div className="strategy-detail__actions">
          {fileDisabled ? (
            <span className="btn btn--outline btn--disabled">Завантажити PDF (скоро)</span>
          ) : (
            <a
              className="btn btn--outline"
              href={fileLink}
              target="_blank"
              rel="noreferrer"
            >
              Завантажити PDF
            </a>
          )}
          {!sourceDisabled && (
            <a
              className="btn btn--ghost"
              href={sourceLink}
              target="_blank"
              rel="noreferrer"
            >
              Офіційне джерело
            </a>
          )}
        </div>
      </header>

      {/*<StrategyDashboard metrics={metrics} directionLabel={directionLabel} />*/}
      {/*<StrategyMeasuresTable rows={measureRows} />*/}
      <StrategyGoalsTree strategy={strategy} />
    </div>
  )
}

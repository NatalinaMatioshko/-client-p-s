import { computeDashboardMetrics } from '../../lib/strategyMetrics'

export function StrategyResultCard({ entry, strategy, isSelected, onSelect }) {
  const metrics = strategy ? computeDashboardMetrics(strategy, entry) : null
  const isArchive = entry.status === 'archive'
  const progress = isArchive ? 100 : (metrics?.executionPercent ?? 0)

  return (
    <button
      type="button"
      className={`strategy-result-card ${isSelected ? 'strategy-result-card--active' : ''} ${isArchive ? 'strategy-result-card--archive' : ''}`}
      onClick={onSelect}
      aria-pressed={isSelected}
    >
      <span
        className={`strategy-result-card__badge ${isArchive ? 'strategy-result-card__badge--archive' : ''}`}
      >
        {isArchive ? 'Архів' : 'Діюча'}
      </span>
      <h3 className="strategy-result-card__title">{entry.title}</h3>
      <p className="strategy-result-card__summary">{entry.summary}</p>
      <div className="strategy-result-card__progress">
        <div
          className="strategy-result-card__progress-bar"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="strategy-result-card__progress-label">
        {isArchive ? 'Період завершено' : `Виконано на ${progress}%`}
      </p>
    </button>
  )
}

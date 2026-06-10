import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { StrategyGoalsTree } from '../../components/search/StrategyGoalsTree'
import { Container } from '../../components/layout/Container'
import {
  getCatalogEntryById,
  loadStrategyForCatalogEntry,
} from '../../lib/strategies'
import './StrategyPage.css'

export function StrategyPage() {
  const { id } = useParams()

  const [catalogEntry, setCatalogEntry] = useState(null)
  const [loaded, setLoaded] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!id) {
      setNotFound(true)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)
    setNotFound(false)

    getCatalogEntryById(id)
      .then((entry) => {
        if (!entry) {
          if (!cancelled) setNotFound(true)
          return null
        }

        if (!cancelled) setCatalogEntry(entry)
        return loadStrategyForCatalogEntry(entry)
      })
      .then((data) => {
        if (!cancelled && data) setLoaded(data)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [id])

  if (notFound) {
    return (
      <main className="strategy-page strategy-page--centered">
        <Container>
          <h1>Стратегію не знайдено</h1>
          <p className="muted">Перевірте посилання або поверніться до пошуку.</p>
          <Link className="btn btn--tonal" to="/search">
            До пошуку
          </Link>
        </Container>
      </main>
    )
  }

  if (!catalogEntry) {
    return (
      <main className="strategy-page strategy-page--centered">
        <Container>
          <p className="muted">Завантаження стратегії…</p>
        </Container>
      </main>
    )
  }

  const sourceLink =
    catalogEntry.officialSourceUrl ?? loaded?.strategy?.strategyUrl ?? null
  const fileLink = catalogEntry.fileUrl
  const fileDisabled = !fileLink
  const sourceDisabled = !sourceLink

  const strategy = loaded?.strategy
  const unitName = loaded?.unit?.name

  return (
    <main className="strategy-page">
      <Container>
        <Link className="strategy-page__back" to="/search">
          ← Назад до пошуку
        </Link>

        <header className="strategy-page__header">
          <p className="strategy-page__city">{catalogEntry.city}</p>
          {unitName && (
            <p className="strategy-page__unit muted">{unitName}</p>
          )}
          <h1 className="strategy-page__title">
            {strategy?.title ?? catalogEntry.title}
          </h1>
          {catalogEntry.period && (
            <p className="strategy-page__period muted">Період: {catalogEntry.period}</p>
          )}
        </header>

        <div className="strategy-page__docs">
          <h2 className="strategy-page__docs-title">Документи</h2>
          <div className="strategy-page__docs-actions">
            {fileDisabled ? (
              <span className="btn btn--disabled" title="Файл ще не додано">
                Завантажити PDF (скоро)
              </span>
            ) : (
              <a
                className="btn btn--primary"
                href={fileLink}
                target="_blank"
                rel="noreferrer"
              >
                Завантажити PDF
              </a>
            )}
            {sourceDisabled ? (
              <span className="btn btn--disabled" title="Посилання ще не додано">
                Офіційне джерело (скоро)
              </span>
            ) : (
              <a
                className="btn btn--tonal"
                href={sourceLink}
                target="_blank"
                rel="noreferrer"
              >
                Офіційне джерело
              </a>
            )}
          </div>
        </div>

        {loading && <p className="muted">Завантаження стратегії…</p>}
        {error && <p className="strategy-page__error">{error}</p>}
        {strategy && <StrategyGoalsTree strategy={strategy} />}
      </Container>
    </main>
  )
}

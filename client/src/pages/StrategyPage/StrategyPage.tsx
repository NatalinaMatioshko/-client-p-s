import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { StrategyGoalsTree } from "../../components/search/StrategyGoalsTree";
import { Container } from "../../components/layout/Container";
import {
  getCatalogEntryById,
  loadStrategyForCatalogEntry,
} from "../../lib/strategies";
import "./StrategyPage.css";

interface ProgramTask {
  id: string;
  label: string;
  number: number;
  description: string;
}

interface OperationalGoal {
  id: string;
  label: string;
  number: number;
  title: string;
  programTasks: ProgramTask[];
}

interface StrategicGoal {
  id: string;
  label: string;
  number: number;
  title: string;
  operationalGoals: OperationalGoal[];
}

interface Strategy {
  id: string;
  title: string;
  strategyUrl?: string | null;
  regionId?: string | null;
  districtId?: string | null;
  communityId?: string | null;
  strategicGoals: StrategicGoal[];
}

interface CatalogEntry {
  id: string;
  city: string;
  unitId: string;
  strategyId: string;
  title: string;
  period: string;
  summary: string;
  directions: string[];
  status: "active" | "archive";
  strategyUrl?: string | null;
  officialSourceUrl?: string | null;
  fileUrl?: string | null;
}

interface Unit {
  id: string;
  name: string;
  type: "Region" | "District" | "Community";
  regionId?: string;
  districtId?: string;
  communityId?: string;
}

interface LoadedData {
  strategy: Strategy;
  unit: Unit | undefined;
}

export function StrategyPage() {
  const { id } = useParams<{ id: string }>();

  const [catalogEntry, setCatalogEntry] = useState<CatalogEntry | null>(null);
  const [loaded, setLoaded] = useState<LoadedData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) {
      setNotFound(true);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    setNotFound(false);
    setCatalogEntry(null);
    setLoaded(null);

    getCatalogEntryById(id)
      .then((entry: CatalogEntry | null) => {
        if (!entry) {
          if (!cancelled) setNotFound(true);
          return null;
        }

        if (!cancelled) setCatalogEntry(entry);
        return loadStrategyForCatalogEntry(entry);
      })
      .then((data: LoadedData | null) => {
        if (!cancelled && data) setLoaded(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unknown error");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (notFound) {
    return (
      <Container>
        <div className="strategy-page">
          <h1>Стратегію не знайдено</h1>
          <p>Перевірте посилання або поверніться до пошуку.</p>
          <Link to="/search">До пошуку</Link>
        </div>
      </Container>
    );
  }

  if (!catalogEntry) {
    return (
      <Container>
        <div className="strategy-page">
          <p>Завантаження стратегії…</p>
        </div>
      </Container>
    );
  }

  const sourceLink =
    catalogEntry.officialSourceUrl ?? loaded?.strategy?.strategyUrl ?? null;
  const fileLink = catalogEntry.fileUrl;
  const fileDisabled = !fileLink;
  const sourceDisabled = !sourceLink;

  const strategy = loaded?.strategy;
  const unitName = loaded?.unit?.name;

  return (
    <Container>
      <div className="strategy-page">
        <Link to="/search">← Назад до пошуку</Link>

        <h1>{catalogEntry.title}</h1>
        {unitName && <p>{unitName}</p>}

        <section>
          <h2>Документи</h2>

          {fileDisabled ? (
            <span>Завантажити PDF (скоро)</span>
          ) : (
            <a href={fileLink ?? "#"} target="_blank" rel="noreferrer">
              Завантажити PDF
            </a>
          )}

          {sourceDisabled ? (
            <span>Офіційне джерело (скоро)</span>
          ) : (
            <a href={sourceLink ?? "#"} target="_blank" rel="noreferrer">
              Офіційне джерело
            </a>
          )}
        </section>

        {loading && <p>Завантаження стратегії…</p>}
        {error && <p>{error}</p>}
        {strategy && <StrategyGoalsTree strategy={strategy} />}
      </div>
    </Container>
  );
}

import { STATUS_LABELS } from "../../lib/strategyMetrics";

interface MeasureRow {
  id: string;
  description: string;
  label: string;
  executor?: string;
  deadline?: string;
  budgetLabel?: string;
  status?: "done" | "in_progress" | "planned";
}

interface StrategyMeasuresTableProps {
  rows: MeasureRow[];
}

export function StrategyMeasuresTable({ rows }: StrategyMeasuresTableProps) {
  const preview = rows.slice(0, 12);

  return (
    <section className="measures-table-wrap">
      <h2 className="measures-table-wrap__title">Перелік заходів стратегії</h2>
      <div className="measures-table-scroll">
        <table className="measures-table">
          <thead>
            <tr>
              <th>Назва заходу</th>
              <th>Виконавець</th>
              <th>Термін</th>
              <th>Бюджет</th>
              <th>Статус</th>
            </tr>
          </thead>
          <tbody>
            {preview.map((row) => (
              <tr key={row.id}>
                <td>
                  <span className="measures-table__name">
                    {row.description}
                  </span>
                  <span className="measures-table__meta">{row.label}</span>
                </td>
                <td>{row.executor}</td>
                <td>{row.deadline}</td>
                <td>{row.budgetLabel}</td>
                <td>
                  <span className={`status-pill status-pill--${row.status}`}>
                    {row.status ? STATUS_LABELS[row.status] : ""}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length > preview.length && (
        <p className="muted measures-table-wrap__more">
          Показано {preview.length} з {rows.length} заходів. Решта — у дереві
          цілей нижче.
        </p>
      )}
    </section>
  );
}

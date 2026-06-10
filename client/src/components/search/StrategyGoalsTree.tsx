import { useState } from 'react'
import './StrategyGoalsTree.css'

const collator = new Intl.Collator('uk', {
  numeric: true,
  sensitivity: 'base',
})

function sortByNumber(items = []) {
  return [...items].sort((a, b) => {
    const numberDiff = (a.number ?? 0) - (b.number ?? 0)
    if (numberDiff !== 0) return numberDiff

    return collator.compare(a.label ?? '', b.label ?? '')
  })
}

export function StrategyGoalsTree({ strategy }) {
  const strategicGoals = sortByNumber(strategy.strategicGoals ?? [])
  const [collapsedStrategicIds, setCollapsedStrategicIds] = useState(() => new Set())
  const [collapsedOperationalIds, setCollapsedOperationalIds] = useState(
    () => new Set(),
  )

  const toggleSetItem = (setter, id) => {
    setter((current) => {
      const next = new Set(current)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const expandStrategicGoal = (id) => {
    setCollapsedStrategicIds((current) => {
      const next = new Set(current)
      next.delete(id)
      return next
    })
  }

  const expandOperationalGoal = (strategicGoalId, operationalGoalId) => {
    expandStrategicGoal(strategicGoalId)
    setCollapsedOperationalIds((current) => {
      const next = new Set(current)
      next.delete(operationalGoalId)
      return next
    })
  }

  const collapseAll = () => {
    setCollapsedStrategicIds(new Set(strategicGoals.map((goal) => goal.id)))
    setCollapsedOperationalIds(
      new Set(
        strategicGoals.flatMap((goal) =>
          sortByNumber(goal.operationalGoals).map(
            (operationalGoal) => operationalGoal.id,
          ),
        ),
      ),
    )
  }

  const expandAll = () => {
    setCollapsedStrategicIds(new Set())
    setCollapsedOperationalIds(new Set())
  }

  return (
    <section className="goals-tree">
      <aside className="goals-tree__toc" aria-label="Оглав стратегічних цілей">
        <h2 className="goals-tree__toc-title">Зміст</h2>
        <ol className="goals-tree__toc-list">
          {strategicGoals.map((strategicGoal) => (
            <li key={strategicGoal.id}>
              <a
                href={`#goal-${strategicGoal.id}`}
                onClick={() => expandStrategicGoal(strategicGoal.id)}
              >
                Стратегічна ціль {strategicGoal.label}. {strategicGoal.title}
              </a>
              <ol>
                {sortByNumber(strategicGoal.operationalGoals).map(
                  (operationalGoal) => (
                    <li key={operationalGoal.id}>
                      <a
                        href={`#goal-${operationalGoal.id}`}
                        onClick={() =>
                          expandOperationalGoal(strategicGoal.id, operationalGoal.id)
                        }
                      >
                        {operationalGoal.label}. {operationalGoal.title}
                      </a>
                    </li>
                  ),
                )}
              </ol>
            </li>
          ))}
        </ol>

        <div className="goals-tree__toc-actions">
          <button
            type="button"
            className="btn btn--tonal goals-tree__toc-action"
            onClick={collapseAll}
          >
            Згорнути все
          </button>
          <button
            type="button"
            className="btn btn--ghost goals-tree__toc-action"
            onClick={expandAll}
          >
            Розгорнути все
          </button>
        </div>
      </aside>

      <div className="goals-tree__outline">
        {strategicGoals.map((strategicGoal) => {
          const operationalGoals = sortByNumber(strategicGoal.operationalGoals)
          const isStrategicCollapsed = collapsedStrategicIds.has(strategicGoal.id)

          return (
            <article
              key={strategicGoal.id}
              id={`goal-${strategicGoal.id}`}
              className="goals-tree__strategic"
            >
              <h2>
                <button
                  type="button"
                  className="goals-tree__title-button goals-tree__strategic-title"
                  onClick={() =>
                    toggleSetItem(setCollapsedStrategicIds, strategicGoal.id)
                  }
                  aria-expanded={!isStrategicCollapsed}
                >
                  <span
                    className={`goals-tree__toggle ${
                      isStrategicCollapsed ? 'goals-tree__toggle--collapsed' : ''
                    }`}
                    aria-hidden="true"
                  >
                    &gt;
                  </span>
                  <span>
                    Стратегічна ціль {strategicGoal.label}. {strategicGoal.title}
                  </span>
                </button>
              </h2>

              <div
                className="goals-tree__branch"
                hidden={isStrategicCollapsed}
              >
                <p className="goals-tree__branch-label">Оперативні цілі</p>

                {operationalGoals.map((operationalGoal) => {
                  const tasks = sortByNumber(operationalGoal.programTasks)
                  const isOperationalCollapsed = collapsedOperationalIds.has(
                    operationalGoal.id,
                  )

                  return (
                    <section
                      key={operationalGoal.id}
                      id={`goal-${operationalGoal.id}`}
                      className="goals-tree__operational"
                    >
                      <h3>
                        <button
                          type="button"
                          className="goals-tree__title-button goals-tree__operational-title"
                          onClick={() =>
                            toggleSetItem(
                              setCollapsedOperationalIds,
                              operationalGoal.id,
                            )
                          }
                          aria-expanded={!isOperationalCollapsed}
                        >
                          <span
                            className={`goals-tree__toggle ${
                              isOperationalCollapsed
                                ? 'goals-tree__toggle--collapsed'
                                : ''
                            }`}
                            aria-hidden="true"
                          >
                            &gt;
                          </span>
                          <span>
                            {operationalGoal.label}. {operationalGoal.title}
                          </span>
                        </button>
                      </h3>

                      <ol
                        className="goals-tree__tasks"
                        hidden={isOperationalCollapsed}
                      >
                        {tasks.map((task) => (
                          <li key={task.id} className="goals-tree__task">
                            <strong>{task.label}.</strong> {task.description}
                          </li>
                        ))}
                      </ol>
                    </section>
                  )
                })}
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

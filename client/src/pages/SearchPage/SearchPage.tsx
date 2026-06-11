import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Container } from "../../components/layout/Container";
import {
  buildUploadLink,
  fetchReferenceData,
  getUnitTypeLabel,
} from "../../lib/api";
import "./SearchPage.css";

type SelectedFilter = "all" | "community" | "district" | "region";
type SelectedSort = "programs-desc" | "programs-asc" | "name-asc";
type UnitType = "Region" | "District" | "Community";

interface StrategyItem {
  id: string;
  title: string;
  regionId?: string | null;
  districtId?: string | null;
  communityId?: string | null;
}

interface RegionItem {
  id: string;
  name?: string;
  nameFull?: string;
}

interface DistrictItem {
  id: string;
  name?: string;
  nameFull?: string;
  regionId?: string;
}

interface CommunityItem {
  id: string;
  name?: string;
  nameFull?: string;
  regionId?: string;
  districtId?: string;
}

interface SearchItem {
  id: string;
  name: string;
  type: UnitType;
  regionId?: string | null;
  districtId?: string | null;
  communityId?: string | null;
  regionName: string;
  districtName: string;
  strategies: StrategyItem[];
}

export function SearchPage() {
  const [regions, setRegions] = useState<RegionItem[]>([]);
  const [districts, setDistricts] = useState<DistrictItem[]>([]);
  const [communities, setCommunities] = useState<CommunityItem[]>([]);
  const [strategies, setStrategies] = useState<StrategyItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedFilter, setSelectedFilter] = useState<SelectedFilter>("all");
  const [selectedSort, setSelectedSort] =
    useState<SelectedSort>("programs-desc");
  const [visibleCount, setVisibleCount] = useState<number>(30);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const data = await fetchReferenceData();
        if (cancelled) return;
        setRegions((data.regions ?? []) as RegionItem[]);
        setDistricts((data.districts ?? []) as DistrictItem[]);
        setCommunities((data.communities ?? []) as CommunityItem[]);
        setStrategies((data.strategies ?? []) as StrategyItem[]);
      } catch (err) {
        if (cancelled) return;
        setError(
          "Не вдалося завантажити дані з сервера. Будь ласка, спробуйте пізніше.",
        );
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const regionsMap = useMemo<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    regions.forEach((r) => {
      map[r.id] = r.nameFull || r.name || "";
    });
    return map;
  }, [regions]);

  const districtsMap = useMemo<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    districts.forEach((d) => {
      map[d.id] = d.nameFull || d.name || "";
    });
    return map;
  }, [districts]);

  const searchList = useMemo<SearchItem[]>(() => {
    const list: SearchItem[] = [];

    regions.forEach((r) => {
      list.push({
        id: r.id,
        name: r.nameFull || r.name || "",
        type: "Region",
        regionId: r.id,
        districtId: null,
        communityId: null,
        regionName: r.nameFull || r.name || "",
        districtName: "",
        strategies: strategies.filter((s) => s.regionId === r.id),
      });
    });

    districts.forEach((d) => {
      list.push({
        id: d.id,
        name: d.nameFull || d.name || "",
        type: "District",
        regionId: d.regionId,
        districtId: d.id,
        communityId: null,
        regionName: (d.regionId && regionsMap[d.regionId]) || "",
        districtName: d.nameFull || d.name || "",
        strategies: strategies.filter((s) => s.districtId === d.id),
      });
    });

    communities.forEach((c) => {
      list.push({
        id: c.id,
        name: c.nameFull || c.name || "",
        type: "Community",
        regionId: c.regionId,
        districtId: c.districtId,
        communityId: c.id,
        regionName: (c.regionId && regionsMap[c.regionId]) || "",
        districtName: (c.districtId && districtsMap[c.districtId]) || "",
        strategies: strategies.filter((s) => s.communityId === c.id),
      });
    });

    return list;
  }, [regions, districts, communities, strategies, regionsMap, districtsMap]);

  const filteredAndSortedList = useMemo<SearchItem[]>(() => {
    let result = [...searchList];

    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      result = result.filter((item) => {
        const nameMatch = item.name.toLowerCase().includes(q);
        const regionMatch = item.regionName.toLowerCase().includes(q);
        const districtMatch = item.districtName.toLowerCase().includes(q);
        const strategyMatch = item.strategies.some((s) =>
          s.title.toLowerCase().includes(q),
        );
        return nameMatch || regionMatch || districtMatch || strategyMatch;
      });
    }

    if (selectedFilter === "community") {
      result = result.filter((item) => item.type === "Community");
    } else if (selectedFilter === "district") {
      result = result.filter((item) => item.type === "District");
    } else if (selectedFilter === "region") {
      result = result.filter((item) => item.type === "Region");
    }

    result.sort((a, b) => {
      if (selectedSort === "programs-desc") {
        const diff = b.strategies.length - a.strategies.length;
        if (diff !== 0) return diff;
        return a.name.localeCompare(b.name, "uk");
      }
      if (selectedSort === "programs-asc") {
        const diff = a.strategies.length - b.strategies.length;
        if (diff !== 0) return diff;
        return a.name.localeCompare(b.name, "uk");
      }
      if (selectedSort === "name-asc") {
        return a.name.localeCompare(b.name, "uk");
      }
      return 0;
    });

    return result;
  }, [searchList, searchQuery, selectedFilter, selectedSort]);

  const visibleResults = useMemo(
    () => filteredAndSortedList.slice(0, visibleCount),
    [filteredAndSortedList, visibleCount],
  );

  return (
    <main className="search-hub">
      <Container>
        <header className="search-hub__hero">
          <h1 className="search-hub__title">Перелік стратегічних документів</h1>
          <p className="search-hub__subtitle muted">
            Шукайте громади, райони та області для перегляду їхніх програм
            розвитку або додавайте нові.
          </p>
        </header>

        <section
          className="search-hub__controls-card"
          aria-label="Параметри пошуку"
        >
          <div className="search-bar-wrapper">
            <input
              className="search-hub__input-new"
              type="text"
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearchQuery(e.target.value)
              }
              placeholder="Введіть назву громади, району, області чи тему програми (наприклад: Освіта)..."
              aria-label="Пошук територіальних одиниць"
            />
            {searchQuery && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => setSearchQuery("")}
                aria-label="Очистити пошук"
              >
                ✕
              </button>
            )}
          </div>

          <div className="controls-row">
            <div className="filter-group">
              <span className="controls-label">Тип одиниці:</span>
              <div className="segmented-control">
                <button
                  type="button"
                  className={`segmented-btn ${selectedFilter === "all" ? "active" : ""}`}
                  onClick={() => setSelectedFilter("all")}
                >
                  Всі
                </button>
                <button
                  type="button"
                  className={`segmented-btn ${selectedFilter === "community" ? "active" : ""}`}
                  onClick={() => setSelectedFilter("community")}
                >
                  Громади
                </button>
                <button
                  type="button"
                  className={`segmented-btn ${selectedFilter === "district" ? "active" : ""}`}
                  onClick={() => setSelectedFilter("district")}
                >
                  Райони
                </button>
                <button
                  type="button"
                  className={`segmented-btn ${selectedFilter === "region" ? "active" : ""}`}
                  onClick={() => setSelectedFilter("region")}
                >
                  Області
                </button>
              </div>
            </div>

            <div className="sort-group">
              <label className="controls-label" htmlFor="sort-select">
                Сортування:
              </label>
              <select
                id="sort-select"
                className="sort-select"
                value={selectedSort}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setSelectedSort(e.target.value as SelectedSort)
                }
              >
                <option value="programs-desc">
                  Програми (від більшої к-сті)
                </option>
                <option value="programs-asc">
                  Програми (від меншої к-сті)
                </option>
                <option value="name-asc">Назва (А-Я)</option>
              </select>
            </div>
          </div>
        </section>

        {loading ? (
          <div className="search-hub__status">Завантаження бази даних…</div>
        ) : error ? (
          <div className="search-hub__error" role="alert">
            {error}
          </div>
        ) : (
          <>
            <p className="search-results-info muted">
              Знайдено територіальних одиниць:{" "}
              <strong>{filteredAndSortedList.length}</strong>
            </p>

            {filteredAndSortedList.length === 0 ? (
              <div className="search-hub__empty">
                Нічого не знайдено за вашим запитом. Спробуйте змінити ключові
                слова.
              </div>
            ) : (
              <div className="search-hub__cards-new">
                {visibleResults.map((item) => (
                  <article
                    key={`${item.type}-${item.id}`}
                    className="unit-card"
                  >
                    <div className="unit-card__header">
                      <span
                        className={`unit-card__badge unit-card__badge--${item.type.toLowerCase()}`}
                      >
                        {getUnitTypeLabel(item.type)}
                      </span>
                      {item.strategies.length > 0 ? (
                        <span className="unit-card__status unit-card__status--has-program">
                          Програм: {item.strategies.length}
                        </span>
                      ) : (
                        <span className="unit-card__status unit-card__status--no-program">
                          Немає програм
                        </span>
                      )}
                    </div>

                    <h2 className="unit-card__title">{item.name}</h2>

                    {item.type !== "Region" && (
                      <p className="unit-card__location muted">
                        {item.type === "Community" &&
                          item.districtName &&
                          `${item.districtName}, `}
                        {item.regionName}
                      </p>
                    )}

                    <div className="unit-card__content">
                      {item.strategies.length > 0 ? (
                        <div className="unit-card__strategies">
                          <p className="unit-card__strategies-label">
                            Документи розвитку:
                          </p>
                          <ul className="unit-card__strategies-list">
                            {item.strategies.map((s) => (
                              <li
                                key={s.id}
                                className="unit-card__strategy-item"
                              >
                                <Link
                                  className="unit-card__strategy-link"
                                  to={`/strategies/${s.id}`}
                                >
                                  <span className="unit-card__strategy-icon">
                                    📄
                                  </span>
                                  <span className="unit-card__strategy-title">
                                    {s.title}
                                  </span>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <div className="unit-card__empty-state">
                          <p className="muted small-text">
                            Документи ще не завантажені для цієї одиниці.
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="unit-card__footer">
                      <Link
                        className={`btn ${item.strategies.length > 0 ? "btn--tonal" : "btn--primary"} btn--sm unit-card__action-btn`}
                        to={buildUploadLink({
                          type: item.type,
                          regionId: item.regionId ?? "",
                          districtId: item.districtId ?? "",
                          communityId: item.communityId ?? "",
                        })}
                      >
                        {item.strategies.length > 0
                          ? "➕ Додати ще одну програму"
                          : "➕ Додати програму"}
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {filteredAndSortedList.length > visibleCount && (
              <div className="search-hub__more-container">
                <button
                  type="button"
                  className="btn btn--tonal load-more-btn"
                  onClick={() => setVisibleCount((prev) => prev + 30)}
                >
                  Показати ще
                </button>
              </div>
            )}
          </>
        )}
      </Container>
    </main>
  );
}

import { useState, useEffect, useMemo } from "react";
import { Container } from "../../components/layout/Container";
import "./AdminPage.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ??
  "http://localhost:5257";

type ActiveType = "Region" | "Community";
type UrlFilter = "all" | "filled" | "empty";
type StrategiesFilter = "all" | "yes" | "no";
type ToastType = "success" | "error" | "info";

interface Strategy {
  id: string;
  title?: string;
  strategyUrl?: string | null;
}

interface UnitItem {
  id: string;
  name?: string;
  nameFull?: string;
  kattotgId?: string;
  category?: string;
  regionId?: string;
  websiteUrl?: string | null;
  strategiesUrl?: string | null;
  strategies?: Strategy[];
}

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

export function AdminPage() {
  const [regions, setRegions] = useState<UnitItem[]>([]);
  const [communities, setCommunities] = useState<UnitItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [activeType, setActiveType] = useState<ActiveType>("Community");
  const [selectedRegionFilterId, setSelectedRegionFilterId] =
    useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [websiteUrlFilter, setWebsiteUrlFilter] = useState<UrlFilter>("all");
  const [strategiesUrlFilter, setStrategiesUrlFilter] =
    useState<UrlFilter>("all");
  const [hasStrategiesFilter, setHasStrategiesFilter] =
    useState<StrategiesFilter>("all");

  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 12;

  const [selectedUnit, setSelectedUnit] = useState<UnitItem | null>(null);
  const [strategiesUrlInput, setStrategiesUrlInput] = useState<string>("");
  const [websiteUrlInput, setWebsiteUrlInput] = useState<string>("");
  const [strategiesUrlError, setStrategiesUrlError] = useState<string>("");
  const [websiteUrlError, setWebsiteUrlError] = useState<string>("");
  const [saving, setSaving] = useState<boolean>(false);

  const [editingStrategyId, setEditingStrategyId] = useState<string | null>(
    null,
  );
  const [editStrategyTitle, setEditStrategyTitle] = useState<string>("");
  const [editStrategyUrl, setEditStrategyUrl] = useState<string>("");
  const [savingStrategyId, setSavingStrategyId] = useState<string | null>(null);

  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([
      fetch(`${API_BASE_URL}/api/Regions`).then((r) => {
        if (!r.ok) throw new Error("Не вдалося завантажити області");
        return r.json();
      }),
      fetch(`${API_BASE_URL}/api/Communities`).then((r) => {
        if (!r.ok) throw new Error("Не вдалося завантажити громади");
        return r.json();
      }),
    ])
      .then(([regionsData, communitiesData]) => {
        if (!cancelled) {
          setRegions((regionsData ?? []) as UnitItem[]);
          setCommunities((communitiesData ?? []) as UnitItem[]);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const message =
            err instanceof Error
              ? err.message
              : "Не вдалося завантажити довідкові дані.";
          setError(message);
          console.error(err);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const showToast = (message: string, type: ToastType = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const validateFrontendUrl = (url: string): boolean => {
    if (!url || url.trim() === "") return true;
    try {
      const parsed = new URL(url);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  };

  const filteredUnits = useMemo(() => {
    let list: UnitItem[] = [];

    if (activeType === "Region") {
      list = [...regions];
    } else {
      list = [...communities];
      if (selectedRegionFilterId) {
        list = list.filter((c) => c.regionId === selectedRegionFilterId);
      }
    }

    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (item) =>
          item.name?.toLowerCase().includes(q) ||
          item.nameFull?.toLowerCase().includes(q) ||
          item.kattotgId?.toLowerCase().includes(q),
      );
    }

    if (websiteUrlFilter === "filled") {
      list = list.filter(
        (item) => item.websiteUrl && item.websiteUrl.trim() !== "",
      );
    } else if (websiteUrlFilter === "empty") {
      list = list.filter(
        (item) => !item.websiteUrl || item.websiteUrl.trim() === "",
      );
    }

    if (strategiesUrlFilter === "filled") {
      list = list.filter(
        (item) => item.strategiesUrl && item.strategiesUrl.trim() !== "",
      );
    } else if (strategiesUrlFilter === "empty") {
      list = list.filter(
        (item) => !item.strategiesUrl || item.strategiesUrl.trim() === "",
      );
    }

    if (hasStrategiesFilter === "yes") {
      list = list.filter(
        (item) => item.strategies && item.strategies.length > 0,
      );
    } else if (hasStrategiesFilter === "no") {
      list = list.filter(
        (item) => !item.strategies || item.strategies.length === 0,
      );
    }

    list.sort((a, b) => (a.name || "").localeCompare(b.name || "", "uk"));
    return list;
  }, [
    activeType,
    regions,
    communities,
    selectedRegionFilterId,
    searchQuery,
    websiteUrlFilter,
    strategiesUrlFilter,
    hasStrategiesFilter,
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    activeType,
    selectedRegionFilterId,
    searchQuery,
    websiteUrlFilter,
    strategiesUrlFilter,
    hasStrategiesFilter,
  ]);

  const paginatedUnits = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredUnits.slice(startIndex, startIndex + pageSize);
  }, [filteredUnits, currentPage]);

  const totalPages = Math.max(1, Math.ceil(filteredUnits.length / pageSize));

  const handleSelectUnit = (unit: UnitItem) => {
    setSelectedUnit(unit);
    setStrategiesUrlInput(unit.strategiesUrl || "");
    setWebsiteUrlInput(unit.websiteUrl || "");
    setStrategiesUrlError("");
    setWebsiteUrlError("");
    setEditingStrategyId(null);
    setEditStrategyTitle("");
    setEditStrategyUrl("");
  };

  const startEditStrategy = (strategy: Strategy) => {
    setEditingStrategyId(strategy.id);
    setEditStrategyTitle(strategy.title || "");
    setEditStrategyUrl(strategy.strategyUrl || "");
  };

  const cancelEditStrategy = () => {
    setEditingStrategyId(null);
    setEditStrategyTitle("");
    setEditStrategyUrl("");
  };

  const handleStrategyDelete = async (strategyId: string) => {
    if (!window.confirm("Ви впевнені, що хочете видалити цю програму?")) return;
    if (!selectedUnit) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/Strategies/${strategyId}`,
        {
          method: "DELETE",
        },
      );
      if (!response.ok) {
        throw new Error("Не вдалося видалити програму");
      }

      setSelectedUnit((prev) =>
        prev
          ? {
              ...prev,
              strategies: (prev.strategies || []).filter(
                (s) => s.id !== strategyId,
              ),
            }
          : prev,
      );

      if (activeType === "Region") {
        setRegions((prev) =>
          prev.map((r) =>
            r.id === selectedUnit.id
              ? {
                  ...r,
                  strategies: (r.strategies || []).filter(
                    (s) => s.id !== strategyId,
                  ),
                }
              : r,
          ),
        );
      } else {
        setCommunities((prev) =>
          prev.map((c) =>
            c.id === selectedUnit.id
              ? {
                  ...c,
                  strategies: (c.strategies || []).filter(
                    (s) => s.id !== strategyId,
                  ),
                }
              : c,
          ),
        );
      }

      showToast("Програму успішно видалено", "success");
    } catch (err: unknown) {
      console.error(err);
      showToast(
        err instanceof Error ? err.message : "Помилка при видаленні програми",
        "error",
      );
    }
  };

  const handleStrategyUpdate = async (strategyId: string) => {
    if (!selectedUnit) return;

    if (!editStrategyTitle.trim()) {
      showToast("Назва програми не може бути порожньою", "error");
      return;
    }

    if (editStrategyUrl && !validateFrontendUrl(editStrategyUrl)) {
      showToast("Некоректний формат URL програми", "error");
      return;
    }

    setSavingStrategyId(strategyId);
    try {
      const payload = {
        id: strategyId,
        communityId: activeType === "Community" ? selectedUnit.id : null,
        regionId: activeType === "Region" ? selectedUnit.id : null,
        title: editStrategyTitle,
        strategyUrl: editStrategyUrl || null,
      };

      const response = await fetch(
        `${API_BASE_URL}/api/Strategies/${strategyId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Не вдалося оновити програму");
      }

      const updatedStrategy: Strategy = await response.json();

      setSelectedUnit((prev) =>
        prev
          ? {
              ...prev,
              strategies: (prev.strategies || []).map((s) =>
                s.id === strategyId ? updatedStrategy : s,
              ),
            }
          : prev,
      );

      if (activeType === "Region") {
        setRegions((prev) =>
          prev.map((r) =>
            r.id === selectedUnit.id
              ? {
                  ...r,
                  strategies: (r.strategies || []).map((s) =>
                    s.id === strategyId ? updatedStrategy : s,
                  ),
                }
              : r,
          ),
        );
      } else {
        setCommunities((prev) =>
          prev.map((c) =>
            c.id === selectedUnit.id
              ? {
                  ...c,
                  strategies: (c.strategies || []).map((s) =>
                    s.id === strategyId ? updatedStrategy : s,
                  ),
                }
              : c,
          ),
        );
      }

      setEditingStrategyId(null);
      setEditStrategyTitle("");
      setEditStrategyUrl("");
      showToast("Програму успішно оновлено", "success");
    } catch (err: unknown) {
      console.error(err);
      showToast(
        err instanceof Error ? err.message : "Помилка при оновленні програми",
        "error",
      );
    } finally {
      setSavingStrategyId(null);
    }
  };

  const handleStrategiesUrlChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const val = e.target.value;
    setStrategiesUrlInput(val);
    setStrategiesUrlError(
      val && !validateFrontendUrl(val)
        ? "Некоректний формат URL. URL має починатися з http:// або https://"
        : "",
    );
  };

  const handleWebsiteUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setWebsiteUrlInput(val);
    setWebsiteUrlError(
      val && !validateFrontendUrl(val)
        ? "Некоректний формат URL. URL має починатися з http:// або https://"
        : "",
    );
  };

  const handleCancel = () => {
    if (selectedUnit) {
      setStrategiesUrlInput(selectedUnit.strategiesUrl || "");
      setWebsiteUrlInput(selectedUnit.websiteUrl || "");
      setStrategiesUrlError("");
      setWebsiteUrlError("");
      showToast("Зміни скасовано", "info");
    }
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedUnit) return;

    if (strategiesUrlInput && !validateFrontendUrl(strategiesUrlInput)) {
      setStrategiesUrlError(
        "Некоректний формат URL. URL має починатися з http:// або https://",
      );
      showToast("Помилка валідації URL стратегії", "error");
      return;
    }
    if (websiteUrlInput && !validateFrontendUrl(websiteUrlInput)) {
      setWebsiteUrlError(
        "Некоректний формат URL. URL має починатися з http:// або https://",
      );
      showToast("Помилка валідації URL офіційного сайту", "error");
      return;
    }

    setSaving(true);
    const endpoint =
      activeType === "Region"
        ? `${API_BASE_URL}/api/Regions/${selectedUnit.id}`
        : `${API_BASE_URL}/api/Communities/${selectedUnit.id}`;

    try {
      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          strategiesUrl: strategiesUrlInput || null,
          websiteUrl: websiteUrlInput || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message || "Не вдалося зберегти дані на сервері.",
        );
      }

      const responseData = await response.json();
      const updatedStrategiesUrl = responseData.strategiesUrl;
      const updatedWebsiteUrl = responseData.websiteUrl;

      if (activeType === "Region") {
        setRegions((prev) =>
          prev.map((r) =>
            r.id === selectedUnit.id
              ? {
                  ...r,
                  strategiesUrl: updatedStrategiesUrl,
                  websiteUrl: updatedWebsiteUrl,
                }
              : r,
          ),
        );
      } else {
        setCommunities((prev) =>
          prev.map((c) =>
            c.id === selectedUnit.id
              ? {
                  ...c,
                  strategiesUrl: updatedStrategiesUrl,
                  websiteUrl: updatedWebsiteUrl,
                }
              : c,
          ),
        );
      }

      setSelectedUnit((prev) =>
        prev
          ? {
              ...prev,
              strategiesUrl: updatedStrategiesUrl,
              websiteUrl: updatedWebsiteUrl,
            }
          : prev,
      );
      showToast("Дані успішно оновлено!", "success");
    } catch (err: unknown) {
      console.error(err);
      showToast(
        err instanceof Error
          ? err.message
          : "Виникла помилка під час збереження.",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  const getRegionName = (regionId?: string) => {
    const r = regions.find((x) => x.id === regionId);
    return r ? r.nameFull || r.name || "" : "";
  };

  const getCategoryExplanation = (cat
      const updatedWebsiteUrl = responseData.websiteUrl

      // Update local state to keep everything in sync
      if (activeType === 'Region') {
        setRegions((prev) =>
          prev.map((r) => (r.id === selectedUnit.id ? { ...r, strategiesUrl: updatedStrategiesUrl, websiteUrl: updatedWebsiteUrl } : r))
        )
      } else {
        setCommunities((prev) =>
          prev.map((c) => (c.id === selectedUnit.id ? { ...c, strategiesUrl: updatedStrategiesUrl, websiteUrl: updatedWebsiteUrl } : c))
        )
      }

      // Update currently selected unit state
      setSelectedUnit((prev) => ({
        ...prev,
        strategiesUrl: updatedStrategiesUrl,
        websiteUrl: updatedWebsiteUrl
      }))
      showToast('Дані успішно оновлено!', 'success')
    } catch (err) {
      console.error(err)
      showToast(err.message || 'Виникла помилка під час збереження.', 'error')
    } finally {
      setSaving(false)
    }
  }

  // Get Oblast/Region Name for selected community
  const getRegionName = (regionId) => {
    const r = regions.find((x) => x.id === regionId)
    return r ? r.nameFull || r.name : ''
  }

  // Decode Category explanation
  const getCategoryExplanation = (category) => {
    const mapping = {
      'O': 'Область / АРК',
      'K': 'Місто зі спеціальним статусом',
      'P': 'Район',
      'H': 'Територіальна громада',
      'M': 'Місто',
      'T': 'Селище міського типу / смт',
      'C': 'Село',
      'B': 'Район міста',
      'X': 'Селище',
    }
    const explanation = mapping[category?.toUpperCase()]
    return explanation ? `${category} (${explanation})` : category
  }

  return (
    <main className="admin-page">
      <Container>
        <header className="admin-page__hero">
          <h1 className="admin-page__title">Панель адміністратора</h1>
          <p className="admin-page__subtitle muted">
            Керування та заповнення недостаючих даних стратегічних програм общин та областей України
          </p>
        </header>

        {loading ? (
          <div className="admin-page__status">Завантаження довідкових даних…</div>
        ) : error ? (
          <div className="admin-page__error-banner" role="alert">
            {error}
          </div>
        ) : (
          <div className="admin-grid">
            {/* Left Column: List and Filtration */}
            <section className="admin-grid__sidebar card-panel" aria-label="Адміністративні одиниці">
              <h2 className="panel-title">Адміністративні одиниці</h2>
              <p className="muted panel-description">
                Оберіть область або громаду для редагування посилання на стратегічну програму.
              </p>

              {/* Type Switcher */}
              <div className="tab-menu">
                <button
                  className={`tab-menu__btn ${activeType === 'Community' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveType('Community')
                    setSelectedUnit(null)
                  }}
                >
                  Громади
                </button>
                <button
                  className={`tab-menu__btn ${activeType === 'Region' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveType('Region')
                    setSelectedUnit(null)
                  }}
                >
                  Області
                </button>
              </div>

              {/* Filters Block */}
              <div className="filters-container">
                {/* Search Input */}
                <div className="filter-field">
                  <input
                    className="sidebar-search"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Пошук за назвою або КАТТГ ID..."
                    aria-label="Пошук за назвою або КАТТГ ID"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      className="filter-clear-btn"
                      onClick={() => setSearchQuery('')}
                      aria-label="Очистити пошук"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Region Dropdown filter (only for communities) */}
                {activeType === 'Community' && (
                  <div className="form-group">
                      <label className="form-label">Область</label>
                    <select
                      className="form-select sidebar-select"
                      value={selectedRegionFilterId}
                      onChange={(e) => setSelectedRegionFilterId(e.target.value)}
                      aria-label="Фільтр за областю"
                    >
                      <option value="">Всі області</option>
                      {regions.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.nameFull || r.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Website URL filter */}
                <div className="form-group">
                    <label className="form-label">Посилання на офіційний веб-сайт</label>

                    <select
                    className="form-select sidebar-select"
                    value={websiteUrlFilter}
                    onChange={(e) => setWebsiteUrlFilter(e.target.value)}
                    aria-label="Фільтр офіційного сайту"
                  >
                    <option value="all">Без фільтру</option>
                    <option value="filled">Заповнено</option>
                    <option value="empty">Не заповнено</option>
                  </select>
                </div>
                {/* Strategies URL filter */}
                <div className="form-group">
                    <label className="form-label">Посилання на стратегічні програми розвитку</label>
                    <select
                    className="form-select sidebar-select"
                    value={strategiesUrlFilter}
                    onChange={(e) => setStrategiesUrlFilter(e.target.value)}
                    aria-label="Фільтр стратегій"
                  >
                    <option value="all">Без фільтру</option>
                    <option value="filled">Заповнено</option>
                    <option value="empty">Не заповнено</option>
                  </select>
                </div>
                {/* Has Uploaded Programs filter */}
                <div className="form-group">
                    <label className="form-label">Наявність програми</label>
                    <select
                    className="form-select sidebar-select"
                    value={hasStrategiesFilter}
                    onChange={(e) => setHasStrategiesFilter(e.target.value)}
                    aria-label="Фільтр наявності програм"
                  >
                    <option value="all">Без фільтру</option>
                    <option value="yes">Є</option>
                    <option value="no">Немає</option>
                  </select>
                </div>
              </div>



              {/* Total found info */}
              <div className="units-count-info muted">
                Знайдено одиниць: <strong>{filteredUnits.length}</strong>
              </div>

              {/* Units List */}
              <ul className="admin-units-list">
                {paginatedUnits.length > 0 ? (
                  paginatedUnits.map((item) => {
                    const isSelected = selectedUnit && selectedUnit.id === item.id
                    return (
                      <li key={item.id} className={`admin-units-list__item ${isSelected ? 'selected' : ''}`}>
                        <button
                          className="admin-units-list__action-btn"
                          onClick={() => handleSelectUnit(item)}
                        >
                          <div className="admin-units-list__info">
                            <span className="unit-title">{item.name}</span>
                            <span className="unit-subinfo muted">
                              ID: {item.kattotgId} • {getCategoryExplanation(item.category)}
                            </span>

                          </div>
                          <span className="arrow-indicator">▶</span>
                        </button>
                      </li>
                    )
                  })
                ) : (
                  <li className="admin-units-list__empty muted">
                    Нічого не знайдено за даними фільтрами.
                  </li>
                )}
              </ul>

              {/* Pagination */}
              {totalPages > 1 && (
                <nav className="pagination-container" aria-label="Пагінація списку">
                  <button
                    className="pagination-btn"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    aria-label="Попередня сторінка"
                  >
                    ◀
                  </button>
                  <span className="pagination-info">
                    Стор. <strong>{currentPage}</strong> з {totalPages}
                  </span>
                  <button
                    className="pagination-btn"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    aria-label="Наступна сторінка"
                  >
                    ▶
                  </button>
                </nav>
              )}
            </section>

            {/* Right Column: Detailed View & Editing Form */}
            <section className="admin-grid__main" aria-label="Детальний перегляд та редагування">
              {selectedUnit ? (
                <div className="card-panel detail-card">
                  <div className="detail-card__header">
                    <span className={`detail-card__badge detail-card__badge--${activeType.toLowerCase()}`}>
                      {activeType === 'Community' ? 'Громада' : 'Область'}
                    </span>
                    <h2 className="detail-card__title">{selectedUnit.name}</h2>
                  </div>

                  <form className="detail-form" onSubmit={handleSave}>
                    <h3 className="section-subtitle">Системні та справочні дані (Read-Only)</h3>

                    <div className="read-only-grid">
                      <div className="form-group">
                        <label className="form-label">Унікальний ID (guid)</label>
                        <input
                          className="form-input form-input--readonly"
                          type="text"
                          value={selectedUnit.id || ''}
                          readOnly
                          disabled
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">КАТТГ ID</label>
                        <input
                          className="form-input form-input--readonly"
                          type="text"
                          value={selectedUnit.kattotgId || ''}
                          readOnly
                          disabled
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Назва</label>
                        <input
                          className="form-input form-input--readonly"
                          type="text"
                          value={selectedUnit.name || ''}
                          readOnly
                          disabled
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Повна назва</label>
                        <input
                          className="form-input form-input--readonly"
                          type="text"
                          value={selectedUnit.nameFull || ''}
                          readOnly
                          disabled
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Категорія КАТТГ</label>
                        <input
                          className="form-input form-input--readonly"
                          type="text"
                          value={getCategoryExplanation(selectedUnit.category)}
                          readOnly
                          disabled
                        />
                      </div>

                      {activeType === 'Community' && (
                        <div className="form-group">
                          <label className="form-label">Належність до області</label>
                          <input
                            className="form-input form-input--readonly"
                            type="text"
                            value={getRegionName(selectedUnit.regionId)}
                            readOnly
                            disabled
                          />
                        </div>
                      )}
                    </div>

                    <div className="editable-section">
                      <h3 className="section-subtitle">Редагування додаткових даних</h3>

                      <div className="form-group">
                        <label className="form-label" htmlFor="website-url-input">
                          Посилання на офіційний веб-сайт
                        </label>
                        <div className="readonly-link-wrapper">
                          <input
                            id="website-url-input"
                            className={`form-input ${websiteUrlError ? 'form-input--error' : ''}`}
                            type="text"
                            value={websiteUrlInput}
                            onChange={handleWebsiteUrlChange}
                            placeholder="Введіть URL, наприклад: https://city.gov.ua"
                            disabled={saving}
                          />
                          {websiteUrlInput && validateFrontendUrl(websiteUrlInput) && (
                            <a
                              href={websiteUrlInput}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="external-link-btn"
                              title="Перейти на сайт"
                            >
                              🔗
                            </a>
                          )}
                        </div>
                        {websiteUrlError && (
                          <span className="input-error-text" role="alert">
                            {websiteUrlError}
                          </span>
                        )}
                        <span className="input-hint-text muted">
                          Це посилання на офіційний сайт адміністративної одиниці.
                        </span>
                      </div>

                      <div className="form-group">
                        <label className="form-label" htmlFor="strategies-url-input">
                          Посилання на стратегічні програми розвитку
                        </label>
                        <input
                          id="strategies-url-input"
                          className={`form-input ${strategiesUrlError ? 'form-input--error' : ''}`}
                          type="text"
                          value={strategiesUrlInput}
                          onChange={handleStrategiesUrlChange}
                          placeholder="Введіть URL, наприклад: https://example.com/strategies"
                          disabled={saving}
                        />
                        {strategiesUrlError && (
                          <span className="input-error-text" role="alert">
                            {strategiesUrlError}
                          </span>
                        )}
                        <span className="input-hint-text muted">
                          Це посилання використовується для відображення сторінки на якій знаходяться всі програми.
                        </span>
                      </div>
                    </div>

                    <div className="form-actions">
                      <button
                        type="button"
                        className="btn btn--ghost"
                        onClick={handleCancel}
                        disabled={
                          saving ||
                          (strategiesUrlInput === (selectedUnit.strategiesUrl || '') &&
                            websiteUrlInput === (selectedUnit.websiteUrl || ''))
                        }
                      >
                        Скасувати
                      </button>
                      <button
                        type="submit"
                        className="btn btn--primary"
                        disabled={
                          saving ||
                          !!strategiesUrlError ||
                          !!websiteUrlError ||
                          (strategiesUrlInput === (selectedUnit.strategiesUrl || '') &&
                            websiteUrlInput === (selectedUnit.websiteUrl || ''))
                        }
                      >
                        {saving ? 'Збереження...' : 'Зберегти'}
                      </button>
                    </div>
                  </form>

                  <div className="programs-section">
                    <h3 className="section-subtitle">
                      {activeType === 'Community' ? 'Програми розвитку громади' : 'Програми розвитку області'} ({selectedUnit.strategies?.length || 0})
                    </h3>
                    {selectedUnit.strategies && selectedUnit.strategies.length > 0 ? (
                      <ul className="programs-list">
                        {selectedUnit.strategies.map((strategy) => {
                          const isEditing = editingStrategyId === strategy.id
                          const isSaving = savingStrategyId === strategy.id

                          return (
                            <li key={strategy.id} className="program-card">
                              {isEditing ? (
                                <div className="program-card__edit-form">
                                  <div className="form-group">
                                    <label className="form-label" htmlFor={`edit-title-${strategy.id}`}>Назва програми</label>
                                    <input
                                      id={`edit-title-${strategy.id}`}
                                      className="form-input"
                                      type="text"
                                      value={editStrategyTitle}
                                      onChange={(e) => setEditStrategyTitle(e.target.value)}
                                      disabled={isSaving}
                                    />
                                  </div>
                                  <div className="form-group">
                                    <label className="form-label" htmlFor={`edit-url-${strategy.id}`}>Посилання на програму (URL)</label>
                                    <input
                                      id={`edit-url-${strategy.id}`}
                                      className="form-input"
                                      type="text"
                                      value={editStrategyUrl}
                                      onChange={(e) => setEditStrategyUrl(e.target.value)}
                                      disabled={isSaving}
                                      placeholder="Введіть URL, наприклад: https://example.com/strategy.pdf"
                                    />
                                  </div>
                                  <div className="program-card__actions">
                                    <button
                                      type="button"
                                      className="btn btn--primary btn--sm"
                                      onClick={() => handleStrategyUpdate(strategy.id)}
                                      disabled={isSaving || !editStrategyTitle.trim()}
                                    >
                                      {isSaving ? 'Збереження...' : 'Зберегти'}
                                    </button>
                                    <button
                                      type="button"
                                      className="btn btn--ghost btn--sm"
                                      onClick={cancelEditStrategy}
                                      disabled={isSaving}
                                    >
                                      Скасувати
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <div className="program-card__info">
                                    <span className="program-card__title">{strategy.title}</span>
                                    {strategy.strategyUrl && (
                                      <a
                                        href={strategy.strategyUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="program-card__url"
                                      >
                                        🔗 {strategy.strategyUrl}
                                      </a>
                                    )}
                                  </div>
                                  <div className="program-card__actions">
                                    <button
                                      type="button"
                                      className="btn btn--tonal btn--sm"
                                      onClick={() => startEditStrategy(strategy)}
                                    >
                                      Редагувати
                                    </button>
                                    <button
                                      type="button"
                                      className="btn btn--danger-tonal btn--sm"
                                      onClick={() => handleStrategyDelete(strategy.id)}
                                    >
                                      Видалити
                                    </button>
                                  </div>
                                </>
                              )}
                            </li>
                          )
                        })}
                      </ul>
                    ) : (
                      <p className="muted">Немає завантажених програм розвитку.</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="card-panel empty-detail-panel">
                  <div className="empty-state-illustration">🛡️</div>
                  <h2 className="panel-title">Редагування не обрано</h2>
                  <p className="muted text-center">
                    Будь ласка, оберіть область чи громаду зі списку ліворуч, щоб заповнити або оновити посилання на стратегічний документ.
                  </p>
                </div>
              )}
            </section>
          </div>
        )}
      </Container>

      {/* Floating Toasts container */}
      <div className="toasts-container" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast-item toast-item--${t.type}`}>
            <span className="toast-icon">
              {t.type === 'success' && '✅'}
              {t.type === 'error' && '❌'}
              {t.type === 'info' && 'ℹ️'}
            </span>
            <span className="toast-message">{t.message}</span>
          </div>
        ))}
      </div>
    </main>
  )
}

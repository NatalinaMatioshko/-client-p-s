import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Container } from "../../components/layout/Container";
import { apiPost, fetchReferenceData, getUnitTypeLabel } from "../../lib/api";
import "./UploadPage.css";
import { StrategyGoalsTree } from "../../components/search/StrategyGoalsTree";

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

interface StrategyForTree {
  strategicGoals: StrategicGoal[];
}

interface Region {
  id: string;
  name: string;
  nameFull?: string;
}

interface District {
  id: string;
  name: string;
  nameFull?: string;
  regionId: string;
}

interface Community {
  id: string;
  name: string;
  nameFull?: string;
  regionId: string;
  districtId?: string;
}

interface Unit {
  id: string;
  name: string;
  type: "Region" | "District" | "Community";
  regionId?: string;
  districtId?: string;
  communityId?: string;
}

type SaveStatus = "idle" | "success" | "error";
type UnitType = "Region" | "District" | "Community";

export function UploadPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [regions, setRegions] = useState<Region[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [strategies, setStrategies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedType, setSelectedType] = useState<UnitType>("Community");
  const [selectedRegionId, setSelectedRegionId] = useState<string>("");
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>("");
  const [selectedCommunityId, setSelectedCommunityId] = useState<string>("");

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<UnitType>("Community");

  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState("");
  const [parsedStrategy, setParsedStrategy] = useState<StrategyForTree | null>(
    null,
  );
  const [jsonError, setJsonError] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchReferenceData()
      .then(
        ({
          regions: regionsData,
          districts: districtsData,
          communities: communitiesData,
          strategies: strategiesData,
        }) => {
          if (!cancelled) {
            setRegions(regionsData || []);
            setDistricts(districtsData || []);
            setCommunities(communitiesData || []);
            setStrategies(strategiesData || []);

            const qType = searchParams.get("type");
            const qRegionId = searchParams.get("regionId");
            const qDistrictId = searchParams.get("districtId");
            const qCommunityId = searchParams.get("communityId");

            if (qType) setSelectedType(qType as UnitType);
            if (qRegionId) setSelectedRegionId(qRegionId);
            if (qDistrictId) setSelectedDistrictId(qDistrictId);
            if (qCommunityId) setSelectedCommunityId(qCommunityId);
          }
        },
      )
      .catch((err) => {
        if (!cancelled) {
          setError(
            "Не вдалося завантажити довідкові дані. Будь ласка, перевірте з'єднання.",
          );
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

  useEffect(() => {
    if (regions.length > 0 && !selectedRegionId) {
      setSelectedRegionId(regions[0].id);
    }
  }, [regions, selectedRegionId]);

  const filteredDistricts = useMemo<District[]>(() => {
    if (!selectedRegionId) return [];
    return districts.filter((d) => d.regionId === selectedRegionId);
  }, [districts, selectedRegionId]);

  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const regId = e.target.value;
    setSelectedRegionId(regId);
    const nextDistricts = districts.filter((d) => d.regionId === regId);
    if (nextDistricts.length > 0) {
      setSelectedDistrictId(nextDistricts[0].id);
      const nextComm = communities.filter(
        (c) => c.districtId === nextDistricts[0].id,
      );
      if (nextComm.length > 0) {
        setSelectedCommunityId(nextComm[0].id);
      } else {
        setSelectedCommunityId("");
      }
    } else {
      setSelectedDistrictId("");
      setSelectedCommunityId("");
    }
  };

  const filteredCommunities = useMemo<Community[]>(() => {
    if (!selectedDistrictId) return [];
    return communities.filter((c) => c.districtId === selectedDistrictId);
  }, [communities, selectedDistrictId]);

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const distId = e.target.value;
    setSelectedDistrictId(distId);
    const nextComm = communities.filter((c) => c.districtId === distId);
    if (nextComm.length > 0) {
      setSelectedCommunityId(nextComm[0].id);
    } else {
      setSelectedCommunityId("");
    }
  };

  const unitsWithoutStrategies = useMemo<Unit[]>(() => {
    const regionsWithStr = new Set(
      strategies.map((s: any) => s.regionId).filter(Boolean),
    );
    const districtsWithStr = new Set(
      strategies.map((s: any) => s.districtId).filter(Boolean),
    );
    const communitiesWithStr = new Set(
      strategies.map((s: any) => s.communityId).filter(Boolean),
    );

    const list: Unit[] = [];

    regions.forEach((r) => {
      if (!regionsWithStr.has(r.id)) {
        list.push({
          id: r.id,
          name: r.nameFull || r.name,
          type: "Region",
          regionId: r.id,
        });
      }
    });

    districts.forEach((d) => {
      if (!districtsWithStr.has(d.id)) {
        list.push({
          id: d.id,
          name: d.nameFull || d.name,
          type: "District",
          regionId: d.regionId,
          districtId: d.id,
        });
      }
    });

    communities.forEach((c) => {
      if (!communitiesWithStr.has(c.id)) {
        list.push({
          id: c.id,
          name: c.nameFull || c.name,
          type: "Community",
          regionId: c.regionId,
          districtId: c.districtId,
          communityId: c.id,
        });
      }
    });

    return list;
  }, [regions, districts, communities, strategies]);

  const filteredUnitsList = useMemo<Unit[]>(() => {
    let list = unitsWithoutStrategies.filter((item) => item.type === activeTab);
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      list = list.filter((item) => item.name.toLowerCase().includes(q));
    }
    return list.slice(0, 15);
  }, [unitsWithoutStrategies, searchQuery, activeTab]);

  const handleQuickSelect = (item: Unit) => {
    setSelectedType(item.type);
    if (item.regionId) setSelectedRegionId(item.regionId);
    if (item.districtId) setSelectedDistrictId(item.districtId);
    if (item.communityId) setSelectedCommunityId(item.communityId);
  };

  const processJsonFile = (file: File) => {
    if (!file) return;

    setFileName(file.name);
    setJsonError(null);
    setParsedStrategy(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result as string);

        let strategy: any = null;

        if (
          json.strategies &&
          Array.isArray(json.strategies) &&
          json.strategies.length > 0
        ) {
          strategy = json.strategies[0];
        } else if (
          json.Strategies &&
          Array.isArray(json.Strategies) &&
          json.Strategies.length > 0
        ) {
          strategy = json.Strategies[0];
        } else if (json.title || json.Title) {
          strategy = json;
        }

        if (!strategy) {
          throw new Error(
            "Файл не містить коректної структури програми розвитку (відсутній заголовок або перелік стратегій).",
          );
        }

        const normalizeStrategy = (raw: any): StrategyForTree => {
          const rawGoals =
            raw.strategicGoals ||
            raw.StrategicGoals ||
            raw.strategic_goals ||
            [];
          const strategicGoals = rawGoals.map((g: any, gi: number) => {
            const label = g.label || g.Label || String(gi + 1);
            const number = g.number || g.Number || gi + 1;
            const gTitle = g.title || g.Title || "Стратегічна ціль";

            const rawOps =
              g.operationalGoals ||
              g.OperationalGoals ||
              g.operational_goals ||
              [];
            const operationalGoals = rawOps.map((op: any, opi: number) => {
              const opLabel = op.label || op.Label || `${label}.${opi + 1}`;
              const opNumber = op.number || op.Number || opi + 1;
              const opTitle = op.title || op.Title || "Оперативна ціль";

              const rawTasks =
                op.programTasks ||
                op.ProgramTasks ||
                op.tasks ||
                op.Tasks ||
                [];
              const programTasks = rawTasks.map((t: any, ti: number) => {
                const tLabel = t.label || t.Label || `${opLabel}.${ti + 1}`;
                const tNumber = t.number || t.Number || ti + 1;
                const description =
                  t.description || t.Description || "Завдання";
                return {
                  id: `${tNumber}`,
                  label: tLabel,
                  number: tNumber,
                  description,
                };
              });

              return {
                id: `${opNumber}`,
                label: opLabel,
                number: opNumber,
                title: opTitle,
                programTasks,
              };
            });

            return {
              id: `${number}`,
              label,
              number,
              title: gTitle,
              operationalGoals,
            };
          });

          return { strategicGoals };
        };

        const normalized = normalizeStrategy(strategy);
        setParsedStrategy(normalized);
      } catch (err) {
        setJsonError(err.message || "Не вдалося розпарсити JSON-файл.");
        console.error(err);
      }
    };
    reader.onerror = () => {
      setJsonError("Помилка під час читання файлу.");
    };
    reader.readAsText(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processJsonFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processJsonFile(e.target.files[0]);
    }
  };

  const validateFrontendUrl = (url: string) => {
    if (!url || url.trim() === "") return true;
    try {
      const parsed = new URL(url);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch (e) {
      return false;
    }
  };

  const handleSave = async () => {
    if (!parsedStrategy) return;

    const title = parsedStrategy.strategicGoals[0]?.title || "Програма";

    if (!title.trim()) {
      setSaveStatus("error");
      setSaveMessage("Назва програми не може бути порожньою.");
      return;
    }

    let targetId: string | null = null;
    if (selectedType === "Region") {
      targetId = selectedRegionId;
      if (!targetId) {
        setSaveStatus("error");
        setSaveMessage("Оберіть цільову область.");
        return;
      }
    } else if (selectedType === "District") {
      targetId = selectedDistrictId;
      if (!targetId) {
        setSaveStatus("error");
        setSaveMessage("Оберіть цільовий район.");
        return;
      }
    } else if (selectedType === "Community") {
      targetId = selectedCommunityId;
      if (!targetId) {
        setSaveStatus("error");
        setSaveMessage("Оберіть цільову громаду.");
        return;
      }
    }

    setSaving(true);
    setSaveStatus("idle");
    setSaveMessage("");

    const payload = {
      title: title,
      strategyUrl: "",
      regionId: selectedType === "Region" ? targetId : null,
      districtId: selectedType === "District" ? targetId : null,
      communityId: selectedType === "Community" ? targetId : null,
      strategicGoals: parsedStrategy.strategicGoals,
    };

    try {
      await apiPost("/api/Strategies", payload);

      setSaveStatus("success");
      setSaveMessage("Програму успішно додано та зв'язано!");

      setTimeout(() => {
        navigate("/search");
      }, 2000);
    } catch (err: any) {
      setSaveStatus("error");
      setSaveMessage(
        err.message || "Виникла помилка під час надсилання запиту.",
      );
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleMockUpload = () => {
    const mockJson: StrategyForTree = {
      strategicGoals: [
        {
          id: "1",
          label: "1",
          number: 1,
          title: "Стратегічна ціль 1. Економічний розвиток",
          operationalGoals: [
            {
              id: "1.1",
              label: "1.1",
              number: 1,
              title: "Оперативна ціль 1.1. Підтримка малого бізнесу",
              programTasks: [
                {
                  id: "1.1.1",
                  label: "1.1.1",
                  number: 1,
                  description: "Завдання 1.1.1. Створення бізнес-інкубатора",
                },
                {
                  id: "1.1.2",
                  label: "1.1.2",
                  number: 2,
                  description:
                    "Завдання 1.1.2. Організація щорічного бізнес-форуму",
                },
              ],
            },
          ],
        },
      ],
    };
    setParsedStrategy(mockJson);
    setFileName("test_strategy.json");
    setJsonError(null);
  };

  const selectedUnitName = useMemo<string>(() => {
    if (selectedType === "Region") {
      const unit = regions.find((r) => r.id === selectedRegionId);
      return unit ? unit.nameFull || unit.name : "Не обрано";
    }
    if (selectedType === "District") {
      const unit = districts.find((d) => d.id === selectedDistrictId);
      return unit ? unit.nameFull || unit.name : "Не обрано";
    }
    const unit = communities.find((c) => c.id === selectedCommunityId);
    return unit ? unit.nameFull || unit.name : "Не обрано";
  }, [
    selectedType,
    selectedRegionId,
    selectedDistrictId,
    selectedCommunityId,
    regions,
    districts,
    communities,
  ]);

  return (
    <main className="upload-page">
      <Container>
        <header className="upload-page__hero">
          <h1 className="upload-page__title">Завантаження нових програм</h1>
          <p className="upload-page__subtitle muted">
            Додайте стратегічний документ розвитку до обраної області або
            територіальної громади
          </p>
        </header>

        {loading ? (
          <div className="upload-page__status">
            Завантаження довідкових даних...
          </div>
        ) : error ? (
          <div className="upload-page__error-banner" role="alert">
            {error}
          </div>
        ) : (
          <div className="upload-grid">
            <section
              className="upload-grid__sidebar card-panel"
              aria-label="Адміністративні одиниці без стратегій"
            >
              <h2 className="panel-title">Одиниці без програм</h2>
              <p className="muted panel-description">
                Оберіть із переліку територіальних одиниць, у яких наразі немає
                жодного завантаженого документа.
              </p>

              <div className="tab-menu">
                <button
                  className={`tab-menu__btn ${activeTab === "Community" ? "active" : ""}`}
                  onClick={() => setActiveTab("Community")}
                  type="button"
                >
                  Громади
                </button>
                <button
                  className={`tab-menu__btn ${activeTab === "Region" ? "active" : ""}`}
                  onClick={() => setActiveTab("Region")}
                  type="button"
                >
                  Області
                </button>
              </div>

              <input
                className="sidebar-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Пошук одиниці..."
              />

              <ul className="units-list">
                {filteredUnitsList.length > 0 ? (
                  filteredUnitsList.map((item) => (
                    <li key={item.id} className="units-list__item">
                      <button
                        className="units-list__action-btn"
                        onClick={() => handleQuickSelect(item)}
                        type="button"
                      >
                        <span className="unit-name">{item.name}</span>
                        <span className="unit-badge">
                          {getUnitTypeLabel(activeTab)}
                        </span>
                      </button>
                    </li>
                  ))
                ) : (
                  <li className="units-list__empty muted">
                    {searchQuery
                      ? "Нічого не знайдено"
                      : "Усі одиниці в цій категорії мають програми!"}
                  </li>
                )}
              </ul>
            </section>

            <div className="upload-grid__main">
              <section
                className="card-panel"
                aria-label="Вибір належності до громади"
              >
                <h2 className="panel-title">1. Вибір належності до громади</h2>
                <p className="muted panel-description">
                  Вкажіть адміністративно-територіальну одиницю, для якої
                  призначена ця програма.
                </p>

                <div className="form-group">
                  <label className="form-label">
                    Тип територіального рівня
                  </label>
                  <div className="level-select-grid">
                    <label
                      className={`level-radio-label ${selectedType === "Community" ? "active" : ""}`}
                    >
                      <input
                        type="radio"
                        name="unitType"
                        value="Community"
                        checked={selectedType === "Community"}
                        onChange={() => setSelectedType("Community")}
                      />
                      <span>Громада</span>
                    </label>
                    <label
                      className={`level-radio-label ${selectedType === "Region" ? "active" : ""}`}
                    >
                      <input
                        type="radio"
                        name="unitType"
                        value="Region"
                        checked={selectedType === "Region"}
                        onChange={() => setSelectedType("Region")}
                      />
                      <span>Область</span>
                    </label>
                  </div>
                </div>

                <div className="dropdowns-grid">
                  <div className="form-group">
                    <label className="form-label">Область</label>
                    <select
                      className="form-select"
                      value={selectedRegionId}
                      onChange={handleRegionChange}
                    >
                      <option value="" disabled>
                        Оберіть область...
                      </option>
                      {regions.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.nameFull || r.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {(selectedType === "District" ||
                    selectedType === "Community") && (
                    <div className="form-group">
                      <label className="form-label">Район</label>
                      <select
                        className="form-select"
                        value={selectedDistrictId}
                        onChange={handleDistrictChange}
                        disabled={filteredDistricts.length === 0}
                      >
                        <option value="" disabled>
                          Оберіть район...
                        </option>
                        {filteredDistricts.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.nameFull || d.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {selectedType === "Community" && (
                    <div className="form-group">
                      <label className="form-label">Громада</label>
                      <select
                        className="form-select"
                        value={selectedCommunityId}
                        onChange={(e) => setSelectedCommunityId(e.target.value)}
                        disabled={filteredCommunities.length === 0}
                      >
                        <option value="" disabled>
                          Оберіть громаду...
                        </option>
                        {filteredCommunities.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.nameFull || c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </section>

              <section
                className="card-panel"
                aria-label="Завантаження JSON файлу"
              >
                <h2 className="panel-title">2. Завантаження програми</h2>
                <p className="muted panel-description">
                  Перетягніть готовий JSON-файл структури програми або оберіть
                  його на комп'ютері.
                </p>

                <div
                  className={`dropzone ${dragActive ? "active" : ""} ${parsedStrategy ? "has-file" : ""}`}
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    id="file-upload"
                    className="dropzone__input"
                    accept=".json,application/json"
                    onChange={handleFileChange}
                  />
                  <label htmlFor="file-upload" className="dropzone__label">
                    <svg
                      className="dropzone__icon"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    {fileName ? (
                      <div className="dropzone__status">
                        <span className="file-highlight">{fileName}</span>
                        <p className="muted">
                          Перетягніть або натисніть сюди, щоб обрати інший файл
                        </p>
                      </div>
                    ) : (
                      <div className="dropzone__status">
                        <span>Перетягніть сюди JSON-файл</span>
                        <p className="muted">
                          або натисніть кнопку для пошуку на комп'ютері
                        </p>
                      </div>
                    )}
                  </label>
                </div>

                <button
                  id="mock-upload-test-strategy"
                  className="btn btn--tonal"
                  type="button"
                  onClick={handleMockUpload}
                  style={{ marginTop: "14px", width: "100%" }}
                >
                  Завантажити тестовий приклад (test_strategy.json)
                </button>

                {jsonError && (
                  <div className="error-message" role="alert">
                    <strong>Помилка валідації JSON:</strong> {jsonError}
                  </div>
                )}
              </section>

              {parsedStrategy && (
                <section
                  className="card-panel"
                  aria-label="Попередній перегляд результату"
                >
                  <h2 className="panel-title">
                    3. Попередній перегляд результату парсингу
                  </h2>
                  <p className="muted panel-description">
                    Перевірте правильність розпізнавання структури документа
                    перед фіксацією в базі даних.
                  </p>

                  <div className="preview-summary">
                    <div className="summary-item">
                      <span className="summary-label">
                        Об\'єкт прив\'язки:{" "}
                      </span>
                      <strong className="summary-value highlight-text">
                        {selectedUnitName}
                      </strong>
                    </div>
                  </div>

                  <div className="tree-container" style={{ marginTop: "16px" }}>
                    <div className="tree-header">Структура програми</div>
                    <div
                      className="tree-body"
                      style={{
                        maxHeight: "none",
                        overflowY: "visible",
                        padding: 0,
                      }}
                    >
                      {parsedStrategy.strategicGoals &&
                      parsedStrategy.strategicGoals.length > 0 ? (
                        <StrategyGoalsTree strategy={parsedStrategy} />
                      ) : (
                        <div
                          className="tree-empty muted"
                          style={{ padding: "20px" }}
                        >
                          Стратегічні цілі відсутні у цьому файлі.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="action-buttons" style={{ marginTop: "20px" }}>
                    <button
                      className="btn btn--primary"
                      onClick={handleSave}
                      disabled={saving}
                      type="button"
                    >
                      {saving ? "Збереження..." : "Зберегти програму"}
                    </button>
                    {saveMessage && (
                      <div
                        className={`save-status-msg save-status-msg--${saveStatus}`}
                      >
                        {saveMessage}
                      </div>
                    )}
                  </div>
                </section>
              )}
            </div>
          </div>
        )}
      </Container>
    </main>
  );
}

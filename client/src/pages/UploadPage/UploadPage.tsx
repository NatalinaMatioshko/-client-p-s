import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Container } from '../../components/layout/Container'
import { apiPost, fetchReferenceData, getUnitTypeLabel } from '../../lib/api'
import './UploadPage.css'
import { StrategyGoalsTree } from '../../components/search/StrategyGoalsTree'
import { normalizeStrategy } from '../../lib/strategies'

export function UploadPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // App data state
  const [regions, setRegions] = useState([])
  const [districts, setDistricts] = useState([])
  const [communities, setCommunities] = useState([])
  const [strategies, setStrategies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Selection state
  const [selectedType, setSelectedType] = useState('Community') // Region, Community
  const [selectedRegionId, setSelectedRegionId] = useState('')
  const [selectedDistrictId, setSelectedDistrictId] = useState('')
  const [selectedCommunityId, setSelectedCommunityId] = useState('')

  // Search filter for list of units without strategies
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('Community') // Region, Community

  // File / Upload state
  const [dragActive, setDragActive] = useState(false)
  const [fileName, setFileName] = useState('')
  const [parsedStrategy, setParsedStrategy] = useState(null)
  const [jsonError, setJsonError] = useState(null)

  // Save state
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState('idle') // idle, success, error
  const [saveMessage, setSaveMessage] = useState('')

  // Expanded nodes for preview tree
  const [expandedGoals, setExpandedGoals] = useState({})

  // Fetch initial data
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    fetchReferenceData()
      .then(({ regions: regionsData, districts: districtsData, communities: communitiesData, strategies: strategiesData }) => {
        if (!cancelled) {
          setRegions(regionsData || [])
          setDistricts(districtsData || [])
          setCommunities(communitiesData || [])
          setStrategies(strategiesData || [])

          const qType = searchParams.get('type')
          const qRegionId = searchParams.get('regionId')
          const qDistrictId = searchParams.get('districtId')
          const qCommunityId = searchParams.get('communityId')

          if (qType) setSelectedType(qType)
          if (qRegionId) setSelectedRegionId(qRegionId)
          if (qDistrictId) setSelectedDistrictId(qDistrictId)
          if (qCommunityId) setSelectedCommunityId(qCommunityId)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError('РќРµ РІРґР°Р»РѕСЃСЏ Р·Р°РІР°РЅС‚Р°Р¶РёС‚Рё РґРѕРІС–РґРєРѕРІС– РґР°РЅС–. Р‘СѓРґСЊ Р»Р°СЃРєР°, РїРµСЂРµРІС–СЂС‚Рµ Р·вЂ™С”РґРЅР°РЅРЅСЏ.')
          console.error(err)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  // Auto-select first region/district if none selected and type changes
  useEffect(() => {
    if (regions.length > 0 && !selectedRegionId) {
      setSelectedRegionId(regions[0].id)
    }
  }, [regions, selectedRegionId])

  // Filtered districts for selected region
  const filteredDistricts = useMemo(() => {
    if (!selectedRegionId) return []
    return districts.filter((d) => d.regionId === selectedRegionId)
  }, [districts, selectedRegionId])

  // Reset selected district when region changes
  const handleRegionChange = (e) => {
    const regId = e.target.value
    setSelectedRegionId(regId)
    const nextDistricts = districts.filter((d) => d.regionId === regId)
    if (nextDistricts.length > 0) {
      setSelectedDistrictId(nextDistricts[0].id)
      const nextComm = communities.filter((c) => c.districtId === nextDistricts[0].id)
      if (nextComm.length > 0) {
        setSelectedCommunityId(nextComm[0].id)
      } else {
        setSelectedCommunityId('')
      }
    } else {
      setSelectedDistrictId('')
      setSelectedCommunityId('')
    }
  }

  // Filtered communities for selected district
  const filteredCommunities = useMemo(() => {
    if (!selectedDistrictId) return []
    return communities.filter((c) => c.districtId === selectedDistrictId)
  }, [communities, selectedDistrictId])

  const handleDistrictChange = (e) => {
    const distId = e.target.value
    setSelectedDistrictId(distId)
    const nextComm = communities.filter((c) => c.districtId === distId)
    if (nextComm.length > 0) {
      setSelectedCommunityId(nextComm[0].id)
    } else {
      setSelectedCommunityId('')
    }
  }

  // Calculate units without strategies
  const unitsWithoutStrategies = useMemo(() => {
    const regionsWithStr = new Set(strategies.map((s) => s.regionId).filter(Boolean))
    const districtsWithStr = new Set(strategies.map((s) => s.districtId).filter(Boolean))
    const communitiesWithStr = new Set(strategies.map((s) => s.communityId).filter(Boolean))

    const list = []

    // Regions without strategies
    regions.forEach((r) => {
      if (!regionsWithStr.has(r.id)) {
        list.push({ id: r.id, name: r.nameFull || r.name, type: 'Region', regionId: r.id })
      }
    })

    // Districts without strategies
    districts.forEach((d) => {
      if (!districtsWithStr.has(d.id)) {
        list.push({
          id: d.id,
          name: d.nameFull || d.name,
          type: 'District',
          regionId: d.regionId,
          districtId: d.id,
        })
      }
    })

    // Communities without strategies
    communities.forEach((c) => {
      if (!communitiesWithStr.has(c.id)) {
        list.push({
          id: c.id,
          name: c.nameFull || c.name,
          type: 'Community',
          regionId: c.regionId,
          districtId: c.districtId,
          communityId: c.id,
        })
      }
    })

    return list
  }, [regions, districts, communities, strategies])

  // Filter list by searchQuery and activeTab
  const filteredUnitsList = useMemo(() => {
    let list = unitsWithoutStrategies.filter((item) => item.type === activeTab)
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase()
      list = list.filter((item) => item.name.toLowerCase().includes(q))
    }
    return list.slice(0, 15) // Limit list display to first 15 for slickness
  }, [unitsWithoutStrategies, searchQuery, activeTab])

  // Quick click handler for list
  const handleQuickSelect = (item) => {
    setSelectedType(item.type)
    if (item.regionId) setSelectedRegionId(item.regionId)
    if (item.districtId) setSelectedDistrictId(item.districtId)
    if (item.communityId) setSelectedCommunityId(item.communityId)
  }

  // Parse JSON file
  const processJsonFile = (file) => {
    if (!file) return

    setFileName(file.name)
    setJsonError(null)
    setParsedStrategy(null)

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result)

        // Determine if this is a CommunityDto style json or StrategyDto style json
        let strategy = null

        // Style A: CommunityDto (e.g. data.json) with nested strategies array
        if (json.strategies && Array.isArray(json.strategies) && json.strategies.length > 0) {
          strategy = json.strategies[0]
        } else if (json.Strategies && Array.isArray(json.Strategies) && json.Strategies.length > 0) {
          strategy = json.Strategies[0]
        }
        // Style B: Direct StrategyDto
        else if (json.title || json.Title) {
          strategy = json
        }

        if (!strategy) {
          throw new Error('Р¤Р°Р№Р» РЅРµ РјС–СЃС‚РёС‚СЊ РєРѕСЂРµРєС‚РЅРѕС— СЃС‚СЂСѓРєС‚СѓСЂРё РїСЂРѕРіСЂР°РјРё СЂРѕР·РІРёС‚РєСѓ (РІС–РґСЃСѓС‚РЅС–Р№ Р·Р°РіРѕР»РѕРІРѕРє Р°Р±Рѕ РїРµСЂРµР»С–Рє СЃС‚СЂР°С‚РµРіС–Р№).')
        }

        // Normalize naming properties recursively to standard DTO structure (title, strategicGoals, operationalGoals, programTasks)
        const normalizeStrategy = (raw) => {
          const title = raw.title || raw.Title || 'РџСЂРѕРіСЂР°РјР° СЂРѕР·РІРёС‚РєСѓ'
          const strategyUrl = raw.strategyUrl || raw.StrategyUrl || null

          // Goals mapping
          const rawGoals = raw.strategicGoals || raw.StrategicGoals || raw.strategic_goals || []
          const strategicGoals = rawGoals.map((g, gi) => {
            const label = g.label || g.Label || String(gi + 1)
            const number = g.number || g.Number || (gi + 1)
            const gTitle = g.title || g.Title || 'РЎС‚СЂР°С‚РµРіС–С‡РЅР° С†С–Р»СЊ'

            // Operational goals
            const rawOps = g.operationalGoals || g.OperationalGoals || g.operational_goals || []
            const operationalGoals = rawOps.map((op, opi) => {
              const opLabel = op.label || op.Label || `${label}.${opi + 1}`
              const opNumber = op.number || op.Number || (opi + 1)
              const opTitle = op.title || op.Title || 'РћРїРµСЂР°С†С–Р№РЅР° С†С–Р»СЊ'

              // Program tasks
              const rawTasks = op.programTasks || op.ProgramTasks || op.tasks || op.Tasks || []
              const programTasks = rawTasks.map((t, ti) => {
                const tLabel = t.label || t.Label || `${opLabel}.${ti + 1}`
                const tNumber = t.number || t.Number || (ti + 1)
                const description = t.description || t.Description || 'Р—Р°РІРґР°РЅРЅСЏ'
                return { label: tLabel, number: tNumber, description }
              })

              return { label: opLabel, number: opNumber, title: opTitle, programTasks }
            })

            return { label, number, title: gTitle, operationalGoals }
          })

          return { title, strategyUrl, strategicGoals }
        }

        const normalized = normalizeStrategy(strategy)
        setParsedStrategy(normalized)
      } catch (err) {
        setJsonError(err.message || 'РќРµ РІРґР°Р»РѕСЃСЏ СЂРѕР·РїР°СЂСЃРёС‚Рё JSON-С„Р°Р№Р».')
        console.error(err)
      }
    }
    reader.onerror = () => {
      setJsonError('РџРѕРјРёР»РєР° РїС–Рґ С‡Р°СЃ С‡РёС‚Р°РЅРЅСЏ С„Р°Р№Р»Сѓ.')
    }
    reader.readAsText(file)
  }

  // Handle Drag Events
  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processJsonFile(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processJsonFile(e.target.files[0])
    }
  }

  // Node toggle helper for preview tree
  const toggleGoal = (key) => {
    setExpandedGoals((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  // Validate URL format on frontend
  const validateFrontendUrl = (url) => {
    if (!url || url.trim() === '') return true
    try {
      const parsed = new URL(url)
      return parsed.protocol === 'http:' || parsed.protocol === 'https:'
    } catch (e) {
      return false
    }
  }

  // Submit parsed strategy
  const handleSave = async () => {
    if (!parsedStrategy) return

    if (!parsedStrategy.title?.trim()) {
      setSaveStatus('error')
      setSaveMessage('РќР°Р·РІР° РїСЂРѕРіСЂР°РјРё РЅРµ РјРѕР¶Рµ Р±СѓС‚Рё РїРѕСЂРѕР¶РЅСЊРѕСЋ.')
      return
    }

    if (parsedStrategy.strategyUrl && !validateFrontendUrl(parsedStrategy.strategyUrl)) {
      setSaveStatus('error')
      setSaveMessage('РќРµРєРѕСЂРµРєС‚РЅРёР№ С„РѕСЂРјР°С‚ URL РґР»СЏ РїСЂРѕРіСЂР°РјРё. URL РјР°С” РїРѕС‡РёРЅР°С‚РёСЃСЏ Р· http:// Р°Р±Рѕ https://')
      return
    }

    let targetId = null
    if (selectedType === 'Region') {
      targetId = selectedRegionId
      if (!targetId) {
        setSaveStatus('error')
        setSaveMessage('РћР±РµСЂС–С‚СЊ С†С–Р»СЊРѕРІСѓ РѕР±Р»Р°СЃС‚СЊ.')
        return
      }
    } else if (selectedType === 'District') {
      targetId = selectedDistrictId
      if (!targetId) {
        setSaveStatus('error')
        setSaveMessage('РћР±РµСЂС–С‚СЊ С†С–Р»СЊРѕРІРёР№ СЂР°Р№РѕРЅ.')
        return
      }
    } else if (selectedType === 'Community') {
      targetId = selectedCommunityId
      if (!targetId) {
        setSaveStatus('error')
        setSaveMessage('РћР±РµСЂС–С‚СЊ С†С–Р»СЊРѕРІСѓ РіСЂРѕРјР°РґСѓ.')
        return
      }
    }

    setSaving(true)
    setSaveStatus('idle')
    setSaveMessage('')

    // Prepare strategy payload
    const payload = {
      title: parsedStrategy.title,
      strategyUrl: parsedStrategy.strategyUrl,
      regionId: selectedType === 'Region' ? targetId : null,
      districtId: selectedType === 'District' ? targetId : null,
      communityId: selectedType === 'Community' ? targetId : null,
      strategicGoals: parsedStrategy.strategicGoals,
    }

    try {
      await apiPost('/api/Strategies', payload)

      setSaveStatus('success')
      setSaveMessage('РџСЂРѕРіСЂР°РјСѓ СѓСЃРїС–С€РЅРѕ РґРѕРґР°РЅРѕ С‚Р° Р·РІвЂ™СЏР·Р°РЅРѕ!')

      // Redirect to search after short delay
      setTimeout(() => {
        navigate('/search')
      }, 2000)
    } catch (err) {
      setSaveStatus('error')
      setSaveMessage(err.message || 'Р’РёРЅРёРєР»Р° РїРѕРјРёР»РєР° РїС–Рґ С‡Р°СЃ РЅР°РґСЃРёР»Р°РЅРЅСЏ Р·Р°РїРёС‚Сѓ.')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleMockUpload = () => {
    const mockJson = {
      title: "РўРµСЃС‚РѕРІР° РїСЂРѕРіСЂР°РјР° СЂРѕР·РІРёС‚РєСѓ РіСЂРѕРјР°РґРё 2026-2030",
      strategyUrl: "https://example.com/strategy",
      strategicGoals: [
        {
          label: "1",
          number: 1,
          title: "РЎС‚СЂР°С‚РµРіС–С‡РЅР° С†С–Р»СЊ 1. Р•РєРѕРЅРѕРјС–С‡РЅРёР№ СЂРѕР·РІРёС‚РѕРє",
          operationalGoals: [
            {
              label: "1.1",
              number: 1,
              title: "РћРїРµСЂР°С†С–Р№РЅР° С†С–Р»СЊ 1.1. РџС–РґС‚СЂРёРјРєР° РјР°Р»РѕРіРѕ Р±С–Р·РЅРµСЃСѓ",
              programTasks: [
                {
                  label: "1.1.1",
                  number: 1,
                  description: "Р—Р°РІРґР°РЅРЅСЏ 1.1.1. РЎС‚РІРѕСЂРµРЅРЅСЏ Р±С–Р·РЅРµСЃ-С–РЅРєСѓР±Р°С‚РѕСЂР°"
                },
                {
                  label: "1.1.2",
                  number: 2,
                  description: "Р—Р°РІРґР°РЅРЅСЏ 1.1.2. РћСЂРіР°РЅС–Р·Р°С†С–СЏ С‰РѕСЂС–С‡РЅРѕРіРѕ Р±С–Р·РЅРµСЃ-С„РѕСЂСѓРјСѓ"
                }
              ]
            }
          ]
        }
      ]
    }
    setParsedStrategy(mockJson)
    setFileName('test_strategy.json')
    setJsonError(null)
  }

  // Get name of current selected unit for summary banner
  const selectedUnitName = useMemo(() => {
    if (selectedType === 'Region') {
      const unit = regions.find((r) => r.id === selectedRegionId)
      return unit ? unit.nameFull || unit.name : 'РќРµ РѕР±СЂР°РЅРѕ'
    }
    if (selectedType === 'District') {
      const unit = districts.find((d) => d.id === selectedDistrictId)
      return unit ? unit.nameFull || unit.name : 'РќРµ РѕР±СЂР°РЅРѕ'
    }
    const unit = communities.find((c) => c.id === selectedCommunityId)
    return unit ? unit.nameFull || unit.name : 'РќРµ РѕР±СЂР°РЅРѕ'
  }, [selectedType, selectedRegionId, selectedDistrictId, selectedCommunityId, regions, districts, communities])

  return (
    <main className="upload-page">
      <Container>
        <header className="upload-page__hero">
          <h1 className="upload-page__title">Р—Р°РІР°РЅС‚Р°Р¶РµРЅРЅСЏ РЅРѕРІРёС… РїСЂРѕРіСЂР°Рј</h1>
          <p className="upload-page__subtitle muted">
            Р”РѕРґР°Р№С‚Рµ СЃС‚СЂР°С‚РµРіС–С‡РЅРёР№ РґРѕРєСѓРјРµРЅС‚ СЂРѕР·РІРёС‚РєСѓ РґРѕ РѕР±СЂР°РЅРѕС— РѕР±Р»Р°СЃС‚С– Р°Р±Рѕ С‚РµСЂРёС‚РѕСЂС–Р°Р»СЊРЅРѕС— РіСЂРѕРјР°РґРё
          </p>
        </header>

        {loading ? (
          <div className="upload-page__status">Р—Р°РІР°РЅС‚Р°Р¶РµРЅРЅСЏ РґРѕРІС–РґРєРѕРІРёС… РґР°РЅРёС…вЂ¦</div>
        ) : error ? (
          <div className="upload-page__error-banner" role="alert">
            {error}
          </div>
        ) : (
          <div className="upload-grid">
            {/* Left Column: List of units without programs */}
            <section className="upload-grid__sidebar card-panel" aria-label="РђРґРјС–РЅС–СЃС‚СЂР°С‚РёРІРЅС– РѕРґРёРЅРёС†С– Р±РµР· СЃС‚СЂР°С‚РµРіС–Р№">
              <h2 className="panel-title">РћРґРёРЅРёС†С– Р±РµР· РїСЂРѕРіСЂР°Рј</h2>
              <p className="muted panel-description">
                РћР±РµСЂС–С‚СЊ С–Р· РїРµСЂРµР»С–РєСѓ С‚РµСЂРёС‚РѕСЂС–Р°Р»СЊРЅРёС… РѕРґРёРЅРёС†СЊ, Сѓ СЏРєРёС… РЅР°СЂР°Р·С– РЅРµРјР°С” Р¶РѕРґРЅРѕРіРѕ Р·Р°РІР°РЅС‚Р°Р¶РµРЅРѕРіРѕ РґРѕРєСѓРјРµРЅС‚Р°.
              </p>

              {/* Tabs */}
              <div className="tab-menu">
                <button
                  className={`tab-menu__btn ${activeTab === 'Community' ? 'active' : ''}`}
                  onClick={() => setActiveTab('Community')}
                >
                  Р“СЂРѕРјР°РґРё
                </button>
                <button
                  className={`tab-menu__btn ${activeTab === 'Region' ? 'active' : ''}`}
                  onClick={() => setActiveTab('Region')}
                >
                  РћР±Р»Р°СЃС‚С–
                </button>
              </div>

              {/* Search */}
              <input
                className="sidebar-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="РџРѕС€СѓРє РѕРґРёРЅРёС†С–..."
              />

              {/* Units List */}
              <ul className="units-list">
                {filteredUnitsList.length > 0 ? (
                  filteredUnitsList.map((item) => (
                    <li key={item.id} className="units-list__item">
                      <button
                        className="units-list__action-btn"
                        onClick={() => handleQuickSelect(item)}
                      >
                        <span className="unit-name">{item.name}</span>
                        <span className="unit-badge">{getUnitTypeLabel(activeTab)}</span>
                      </button>
                    </li>
                  ))
                ) : (
                  <li className="units-list__empty muted">
                    {searchQuery ? 'РќС–С‡РѕРіРѕ РЅРµ Р·РЅР°Р№РґРµРЅРѕ' : 'РЈСЃС– РѕРґРёРЅРёС†С– РІ С†С–Р№ РєР°С‚РµРіРѕСЂС–С— РјР°СЋС‚СЊ РїСЂРѕРіСЂР°РјРё!'}
                  </li>
                )}
              </ul>
            </section>

            {/* Right Column: Upload forms, target selection & preview */}
            <div className="upload-grid__main">
              {/* Card 1: Select affiliation */}
              <section className="card-panel" aria-label="Р’РёР±С–СЂ РЅР°Р»РµР¶РЅРѕСЃС‚С– РґРѕ РіСЂРѕРјР°РґРё">
                <h2 className="panel-title">1. Р’РёР±С–СЂ РЅР°Р»РµР¶РЅРѕСЃС‚С– РґРѕ РіСЂРѕРјР°РґРё</h2>
                <p className="muted panel-description">
                  Р’РєР°Р¶С–С‚СЊ Р°РґРјС–РЅС–СЃС‚СЂР°С‚РёРІРЅРѕ-С‚РµСЂРёС‚РѕСЂС–Р°Р»СЊРЅСѓ РѕРґРёРЅРёС†СЋ, РґР»СЏ СЏРєРѕС— РїСЂРёР·РЅР°С‡РµРЅР° С†СЏ РїСЂРѕРіСЂР°РјР°.
                </p>

                <div className="form-group">
                  <label className="form-label">РўРёРї С‚РµСЂРёС‚РѕСЂС–Р°Р»СЊРЅРѕРіРѕ СЂС–РІРЅСЏ</label>
                  <div className="level-select-grid">
                    <label className={`level-radio-label ${selectedType === 'Community' ? 'active' : ''}`}>
                      <input
                        type="radio"
                        name="unitType"
                        value="Community"
                        checked={selectedType === 'Community'}
                        onChange={() => setSelectedType('Community')}
                      />
                      <span>Р“СЂРѕРјР°РґР°</span>
                    </label>
                    <label className={`level-radio-label ${selectedType === 'Region' ? 'active' : ''}`}>
                      <input
                        type="radio"
                        name="unitType"
                        value="Region"
                        checked={selectedType === 'Region'}
                        onChange={() => setSelectedType('Region')}
                      />
                      <span>РћР±Р»Р°СЃС‚СЊ</span>
                    </label>
                  </div>
                </div>

                <div className="dropdowns-grid">
                  {/* Always show Region */}
                  <div className="form-group">
                    <label className="form-label">РћР±Р»Р°СЃС‚СЊ</label>
                    <select
                      className="form-select"
                      value={selectedRegionId}
                      onChange={handleRegionChange}
                    >
                      <option value="" disabled>РћР±РµСЂС–С‚СЊ РѕР±Р»Р°СЃС‚СЊ...</option>
                      {regions.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.nameFull || r.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Show District if District or Community selected */}
                  {(selectedType === 'District' || selectedType === 'Community') && (
                    <div className="form-group">
                      <label className="form-label">Р Р°Р№РѕРЅ</label>
                      <select
                        className="form-select"
                        value={selectedDistrictId}
                        onChange={handleDistrictChange}
                        disabled={filteredDistricts.length === 0}
                      >
                        <option value="" disabled>РћР±РµСЂС–С‚СЊ СЂР°Р№РѕРЅ...</option>
                        {filteredDistricts.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.nameFull || d.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Show Community if Community selected */}
                  {selectedType === 'Community' && (
                    <div className="form-group">
                      <label className="form-label">Р“СЂРѕРјР°РґР°</label>
                      <select
                        className="form-select"
                        value={selectedCommunityId}
                        onChange={(e) => setSelectedCommunityId(e.target.value)}
                        disabled={filteredCommunities.length === 0}
                      >
                        <option value="" disabled>РћР±РµСЂС–С‚СЊ РіСЂРѕРјР°РґСѓ...</option>
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

              {/* Card 2: JSON file drag and drop */}
              <section className="card-panel" aria-label="Р—Р°РІР°РЅС‚Р°Р¶РµРЅРЅСЏ JSON С„Р°Р№Р»Сѓ">
                <h2 className="panel-title">2. Р—Р°РІР°РЅС‚Р°Р¶РµРЅРЅСЏ РїСЂРѕРіСЂР°РјРё</h2>
                <p className="muted panel-description">
                  РџРµСЂРµС‚СЏРіРЅС–С‚СЊ РіРѕС‚РѕРІРёР№ JSON-С„Р°Р№Р» СЃС‚СЂСѓРєС‚СѓСЂРё РїСЂРѕРіСЂР°РјРё Р°Р±Рѕ РѕР±РµСЂС–С‚СЊ Р№РѕРіРѕ РЅР° РєРѕРјРївЂ™СЋС‚РµСЂС–.
                </p>

                <div
                  className={`dropzone ${dragActive ? 'active' : ''} ${parsedStrategy ? 'has-file' : ''}`}
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
                    <svg className="dropzone__icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    {fileName ? (
                      <div className="dropzone__status">
                        <span className="file-highlight">{fileName}</span>
                        <p className="muted">РџРµСЂРµС‚СЏРіРЅС–С‚СЊ Р°Р±Рѕ РЅР°С‚РёСЃРЅС–С‚СЊ СЃСЋРґРё, С‰РѕР± РѕР±СЂР°С‚Рё С–РЅС€РёР№ С„Р°Р№Р»</p>
                      </div>
                    ) : (
                      <div className="dropzone__status">
                        <span>РџРµСЂРµС‚СЏРіРЅС–С‚СЊ СЃСЋРґРё JSON-С„Р°Р№Р»</span>
                        <p className="muted">Р°Р±Рѕ РЅР°С‚РёСЃРЅС–С‚СЊ РєРЅРѕРїРєСѓ РґР»СЏ РїРѕС€СѓРєСѓ РЅР° РєРѕРјРївЂ™СЋС‚РµСЂС–</p>
                      </div>
                    )}
                  </label>
                </div>

                <button
                  id="mock-upload-test-strategy"
                  className="btn btn--tonal"
                  type="button"
                  onClick={handleMockUpload}
                  style={{ marginTop: '14px', width: '100%' }}
                >
                  Р—Р°РІР°РЅС‚Р°Р¶РёС‚Рё С‚РµСЃС‚РѕРІРёР№ РїСЂРёРєР»Р°Рґ (test_strategy.json)
                </button>

                {jsonError && (
                  <div className="error-message" role="alert">
                    <strong>РџРѕРјРёР»РєР° РІР°Р»С–РґР°С†С–С— JSON:</strong> {jsonError}
                  </div>
                )}
              </section>

              {/* Card 3: Preview of parsing */}
              {parsedStrategy && (
                <section className="card-panel" aria-label="РџРѕРїРµСЂРµРґРЅС–Р№ РїРµСЂРµРіР»СЏРґ СЂРµР·СѓР»СЊС‚Р°С‚Сѓ">
                  <h2 className="panel-title">3. РџРѕРїРµСЂРµРґРЅС–Р№ РїРµСЂРµРіР»СЏРґ СЂРµР·СѓР»СЊС‚Р°С‚Сѓ РїР°СЂСЃРёРЅРіСѓ</h2>
                  <p className="muted panel-description">
                    РџРµСЂРµРІС–СЂС‚Рµ РїСЂР°РІРёР»СЊРЅС–СЃС‚СЊ СЂРѕР·РїС–Р·РЅР°РІР°РЅРЅСЏ СЃС‚СЂСѓРєС‚СѓСЂРё РґРѕРєСѓРјРµРЅС‚Р° РїРµСЂРµРґ С„С–РєСЃР°С†С–С”СЋ РІ Р±Р°Р·С– РґР°РЅРёС….
                  </p>

                  <div className="preview-summary">
                    <div className="summary-item">
                      <span className="summary-label">РћР±вЂ™С”РєС‚ РїСЂРёРІвЂ™СЏР·РєРё: </span>
                      <strong className="summary-value highlight-text">{selectedUnitName}</strong>
                    </div>
                  </div>

                  <div className="editable-section" style={{ marginTop: '16px', marginBottom: '20px' }}>
                    <div className="form-group">
                      <label className="form-label" htmlFor="upload-title-input">
                        РќР°Р·РІР° РїСЂРѕРіСЂР°РјРё
                      </label>
                      <input
                        id="upload-title-input"
                        className="form-input"
                        type="text"
                        value={parsedStrategy.title}
                        onChange={(e) => setParsedStrategy(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Р’РІРµРґС–С‚СЊ РЅР°Р·РІСѓ РїСЂРѕРіСЂР°РјРё СЂРѕР·РІРёС‚РєСѓ"
                      />
                    </div>
                    <div className="form-group" style={{ marginTop: '12px' }}>
                      <label className="form-label" htmlFor="upload-url-input">
                        РџРѕСЃРёР»Р°РЅРЅСЏ РЅР° РѕСЂРёРіС–РЅР°Р» РїСЂРѕРіСЂР°РјРё (URL)
                      </label>
                      <input
                        id="upload-url-input"
                        className="form-input"
                        type="text"
                        value={parsedStrategy.strategyUrl || ''}
                        onChange={(e) => setParsedStrategy(prev => ({ ...prev, strategyUrl: e.target.value }))}
                        placeholder="Р’РІРµРґС–С‚СЊ URL, РЅР°РїСЂРёРєР»Р°Рґ: https://example.com/strategy.pdf"
                      />
                    </div>
                  </div>
                  <div className="tree-container">
                    <div className="tree-header">РЎС‚СЂСѓРєС‚СѓСЂР° РїСЂРѕРіСЂР°РјРё</div>
                    <div className="tree-body" style={{ maxHeight: 'none', overflowY: 'visible', padding: 0 }}>
                      {parsedStrategy.strategicGoals && parsedStrategy.strategicGoals.length > 0 ? (
                        <StrategyGoalsTree strategy={normalizeStrategy(parsedStrategy)} />
                      ) : (
                        <div className="tree-empty muted" style={{ padding: '20px' }}>РЎС‚СЂР°С‚РµРіС–С‡РЅС– С†С–Р»С– РІС–РґСЃСѓС‚РЅС– Сѓ С†СЊРѕРјСѓ С„Р°Р№Р»С–.</div>
                      )}
                    </div>
                  </div>

                  <div className="action-buttons">
                    <button
                      className="btn btn--primary"
                      onClick={handleSave}
                      disabled={saving || !parsedStrategy.title?.trim()}
                    >
                      {saving ? 'Р—Р±РµСЂРµР¶РµРЅРЅСЏ...' : 'Р—Р±РµСЂРµРіС‚Рё РїСЂРѕРіСЂР°РјСѓ'}
                    </button>
                    {saveMessage && (
                      <div className={`save-status-msg save-status-msg--${saveStatus}`}>
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
  )
}


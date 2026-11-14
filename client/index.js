window.__ModuleLoader__.load({
  id: 'dsh-research-team-preset',
  factory: (require) => {
    const module = { exports: {} }
    const exports = module.exports
    const React = require('react')
    const h = React.createElement

    /* --- Settings page copy. The Chinese literals below are the keys of this
       table, so the zh text stays exactly what it has always been; only the
       lookup changes. The host ships just this one client bundle, so the table
       lives here rather than in a sibling module. --- */
    const MESSAGES_EN = {
      '配置 {index}': 'Profile {index}',
      '默认配置': 'Default profile',
      '至少需要一套团队配置': 'At least one team profile is required',
      '团队配置最多 {max} 套': 'At most {max} team profiles',
      '配置名称不能为空': 'The profile name cannot be empty',
      '配置名称「{name}」超过 {max} 个字符': 'Profile name "{name}" is longer than {max} characters',
      '配置名称「{name}」重复，请改成唯一名称': 'Profile name "{name}" is already used; make it unique',
      '加载中…': 'Loading…',
      '无法加载设置：{message}': 'Cannot load the settings: {message}',
      '当前宿主仍是旧版设置接口（返回中没有 profiles）。请重启 DSH 后再打开此页面；在此之前保存会被拒绝，以免覆盖已有的团队配置。': 'This host still uses the old settings API (the response has no profiles). Restart DSH and reopen this page; until then saves are rejected so your existing team profiles are not overwritten.',
      '已保存，下一次创建 teammate 时生效。': 'Saved. Takes effect the next time a teammate is created.',
      '模型目录服务不可用': 'The model catalog service is not available',
      '模型目录加载失败': 'Cannot load the model catalog',
      '正在加载模型目录…': 'Loading the model catalog…',
      '模型目录加载失败：{error}': 'Cannot load the model catalog: {error}',
      '重试': 'Retry',
      '模型目录为空；请先在模型设置里配置可用的 provider。': 'The model catalog is empty; configure a provider in the model settings first.',
      '团队配置': 'Team profiles',
      '新建配置': 'New profile',
      '确认删除': 'Confirm delete',
      '删除配置': 'Delete profile',
      '取消': 'Cancel',
      '配置名称': 'Profile name',
      '共 {count} 套配置；保存后使用「{name}」': 'Profiles: {count}; "{name}" will be used after saving',
      '未命名': 'Unnamed',
      '继承 Lead': 'Inherit from Lead',
      '当前不可用': 'Currently unavailable',
      '模型默认': 'Model default',
      '模型默认（{effort}）': 'Model default ({effort})',
      '{effort}（当前不可用）': '{effort} (currently unavailable)',
      '智能体团队的模型配置': 'Model settings for the agent team',
      '每套配置包含 8 个默认成员的 Provider / Model / 思考强度，可以创建、命名、切换与删除多套配置。保存后，选中的配置用于下一次创建默认 teammate；显式传入 model 的调用仍然优先。留空（继承 Lead）表示跟随 Lead；思考强度留空表示使用模型默认。': 'Each profile holds the Provider / Model / reasoning effort of the 8 default members, and you can create, name, switch and delete several profiles. After saving, the selected profile is used the next time a default teammate is created; calls that pass an explicit model still take priority. Empty (inherit from Lead) follows the Lead; an empty reasoning effort uses the model default.',
      '成员': 'Member',
      '模型（Provider + Model）': 'Model (Provider + Model)',
      '思考强度': 'Reasoning effort',
      '保存中…': 'Saving…',
      '保存': 'Save',
      '配置默认团队成员的 LLM 与思考强度': 'LLM and reasoning effort for the default team members'
    }

    const localeListeners = new Set()
    let activeLocale = 'zh'

    function normalizeLocale(value) {
      const code = typeof value === 'string' ? value.trim().toLowerCase() : ''
      if (code === '') return 'zh'
      return code.indexOf('zh') === 0 ? 'zh' : 'en'
    }

    function setLocale(value) {
      const next = normalizeLocale(value)
      if (next === activeLocale) return
      activeLocale = next
      for (const listener of Array.from(localeListeners)) {
        try {
          listener()
        } catch (error) {
          /* one failing subscriber must not block the rest */
        }
      }
    }

    function subscribe(listener) {
      localeListeners.add(listener)
      return () => { localeListeners.delete(listener) }
    }

    /* The optional second argument lets a caller carry its own translation;
       the role table does, so its labels do not need a second lookup table. */
    function t(text, english) {
      if (activeLocale !== 'en') return text
      if (english !== undefined) return english
      return MESSAGES_EN[text] !== undefined ? MESSAGES_EN[text] : text
    }

    function tf(pattern, vars) {
      return t(pattern).replace(/\{([a-zA-Z0-9_]+)\}/g, (match, name) => (
        Object.prototype.hasOwnProperty.call(vars, name) ? String(vars[name]) : match
      ))
    }

    const ROUTE = '/api/dsh-research-team-settings'
    const ROLES = [
      { id: 'advisor', zh: '学术顾问', en: 'Advisor' },
      { id: 'designer', zh: '实验设计', en: 'Experiment design' },
      { id: 'researcher', zh: '资料员', en: 'Literature' },
      { id: 'data', zh: '数据获取', en: 'Data acquisition' },
      { id: 'builder', zh: '代码构建', en: 'Code' },
      { id: 'runner', zh: '训练与运行', en: 'Training and runs' },
      { id: 'reviewer', zh: '资料/代码审查', en: 'Review' },
      { id: 'writer', zh: '论文写作', en: 'Writing' }
    ]

    function roleLabel(role) {
      return t(role.zh, role.en)
    }
    const MAX_PROFILES = 50
    const MAX_NAME = 60

    const controlStyle = {
      width: '100%',
      boxSizing: 'border-box',
      height: '32px',
      padding: '0 9px',
      border: '0.5px solid var(--dsw-alias-border-l4)',
      borderRadius: 'var(--dsw-radius-md)',
      background: 'var(--dsw-alias-bg-layer-3)',
      color: 'var(--dsw-alias-label-primary)',
      font: 'inherit',
      fontSize: '13px',
      outline: 'none'
    }
    const buttonStyle = {
      height: '32px',
      padding: '0 14px',
      border: '0',
      borderRadius: 'var(--dsw-radius-md)',
      background: 'var(--dsw-alias-state-business-primary)',
      color: 'var(--dsw-alias-label-primary-foreground)',
      font: 'inherit',
      fontSize: '13px',
      cursor: 'pointer'
    }
    const secondaryButtonStyle = {
      ...buttonStyle,
      background: 'var(--dsw-alias-bg-layer-3)',
      color: 'var(--dsw-alias-label-primary)',
      border: '0.5px solid var(--dsw-alias-border-l4)'
    }

    function blankRoles() {
      return Object.fromEntries(ROLES.map((role) => [role.id, { provider: '', model: '', reasoningEffort: '' }]))
    }

    function blankProfile(id, name) {
      return { id, name, roles: blankRoles() }
    }

    function normalizeRoles(value) {
      const source = value !== null && typeof value === 'object' ? value : {}
      const roles = blankRoles()
      for (const role of ROLES) {
        const item = source[role.id] !== null && typeof source[role.id] === 'object' ? source[role.id] : {}
        const provider = typeof item.provider === 'string' ? item.provider : ''
        const model = typeof item.model === 'string' ? item.model : ''
        const paired = provider !== '' && model !== ''
        roles[role.id] = {
          provider: paired ? provider : '',
          model: paired ? model : '',
          reasoningEffort: paired && typeof item.reasoningEffort === 'string' ? item.reasoningEffort : ''
        }
      }
      return roles
    }

    function newProfileId(profiles) {
      const used = new Set(profiles.map((profile) => profile.id))
      let id
      do {
        id = `p-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
      } while (used.has(id))
      return id
    }

    function nextProfileName(profiles) {
      const names = new Set(profiles.map((profile) => profile.name))
      let index = profiles.length + 1
      let name = tf('配置 {index}', { index })
      while (names.has(name)) {
        index += 1
        name = tf('配置 {index}', { index })
      }
      return name
    }

    function normalizeSettingsPayload(value) {
      const source = value !== null && typeof value === 'object' ? value : {}
      const rawProfiles = Array.isArray(source.profiles) ? source.profiles : []
      const profiles = rawProfiles.map((item, index) => {
        const profile = item !== null && typeof item === 'object' ? item : {}
        const id = typeof profile.id === 'string' && /^[A-Za-z0-9_-]{1,64}$/.test(profile.id) ? profile.id : `profile-${index + 1}`
        const name = typeof profile.name === 'string' && profile.name.trim() !== '' ? profile.name.trim() : tf('配置 {index}', { index: index + 1 })
        return { id, name, roles: normalizeRoles(profile.roles) }
      })
      if (profiles.length === 0) profiles.push(blankProfile('default', t('默认配置')))
      if (rawProfiles.length === 0 && source.roles !== undefined) {
        profiles[0].roles = normalizeRoles(source.roles)
      }
      const wanted = typeof source.activeProfileId === 'string' ? source.activeProfileId : ''
      const activeProfileId = profiles.some((profile) => profile.id === wanted) ? wanted : profiles[0].id
      return { version: 2, activeProfileId, profiles }
    }

    function validateProfiles(profiles) {
      if (!Array.isArray(profiles) || profiles.length === 0) return t('至少需要一套团队配置')
      if (profiles.length > MAX_PROFILES) return tf('团队配置最多 {max} 套', { max: MAX_PROFILES })
      const names = new Set()
      for (const profile of profiles) {
        const name = typeof profile.name === 'string' ? profile.name.trim() : ''
        if (name === '') return t('配置名称不能为空')
        if (name.length > MAX_NAME) return tf('配置名称「{name}」超过 {max} 个字符', { name: name.slice(0, 16) + '…', max: MAX_NAME })
        if (names.has(name)) return tf('配置名称「{name}」重复，请改成唯一名称', { name })
        names.add(name)
      }
      return ''
    }

    function normalizeCatalog(value) {
      const groups = value !== null && typeof value === 'object' && Array.isArray(value.groups) ? value.groups : []
      return groups.map((group) => ({
        id: String(group.id),
        name: typeof group.name === 'string' && group.name !== '' ? group.name : String(group.id),
        models: (Array.isArray(group.models) ? group.models : []).map((model) => ({
          id: String(model.id),
          name: typeof model.name === 'string' && model.name !== '' ? model.name : String(model.id),
          reasoning: model.reasoning !== null && typeof model.reasoning === 'object'
            ? {
                defaultEffort: typeof model.reasoning.defaultEffort === 'string' ? model.reasoning.defaultEffort : '',
                efforts: (Array.isArray(model.reasoning.efforts) ? model.reasoning.efforts : []).map((effort) => ({
                  id: String(effort.id),
                  name: typeof effort.name === 'string' && effort.name !== '' ? effort.name : String(effort.id)
                }))
              }
            : undefined
        }))
      }))
    }

    function labelProvider(group) {
      return group.name === group.id ? group.id : `${group.name} (${group.id})`
    }

    function labelModel(model) {
      return model.name === model.id ? model.id : `${model.name} (${model.id})`
    }

    function labelEffort(effort) {
      return effort.name === effort.id ? effort.id : `${effort.name} (${effort.id})`
    }

    function encodeModel(provider, model) {
      return JSON.stringify([provider, model])
    }

    function decodeModel(value) {
      try {
        const parsed = JSON.parse(value)
        if (Array.isArray(parsed) && parsed.length === 2 && typeof parsed[0] === 'string' && typeof parsed[1] === 'string') {
          return { provider: parsed[0], model: parsed[1] }
        }
      } catch {}
      return undefined
    }

    function SettingsPage(props) {
      const loadCatalog = props === null || props === undefined ? undefined : props.loadCatalog
      const [settings, setSettings] = React.useState(null)
      const [status, setStatus] = React.useState('loading')
      const [message, setMessage] = React.useState('')
      const [catalog, setCatalog] = React.useState({ status: 'loading', groups: [], error: '' })
      const [confirmDelete, setConfirmDelete] = React.useState(false)
      const [serverReady, setServerReady] = React.useState(false)
      /* The locale store pushes a change; the state bump re-renders the copy. */
      const [, localeTick] = React.useState(0)
      React.useEffect(() => subscribe(() => localeTick((value) => value + 1)), [])

      React.useEffect(() => {
        let alive = true
        fetch(ROUTE)
          .then(async (response) => {
            const data = await response.json()
            if (!response.ok || !data.ok) throw new Error(data.error || `HTTP ${response.status}`)
            if (alive) {
              setSettings(normalizeSettingsPayload(data))
              setServerReady(data.version === 2 && Array.isArray(data.profiles))
              setStatus('ready')
            }
          })
          .catch((error) => {
            if (alive) {
              setStatus('error')
              setMessage(error instanceof Error ? error.message : String(error))
            }
          })
        return () => { alive = false }
      }, [])

      async function loadModels() {
        if (typeof loadCatalog !== 'function') {
          setCatalog({ status: 'error', groups: [], error: t('模型目录服务不可用') })
          return
        }
        setCatalog((previous) => ({ status: 'loading', groups: previous.groups, error: '' }))
        try {
          const response = await loadCatalog()
          if (response === null || typeof response !== 'object' || response.ok !== true) {
            const detail = response !== null && typeof response === 'object' && response.error !== null && typeof response.error === 'object'
              ? response.error.message
              : undefined
            throw new Error(typeof detail === 'string' && detail !== '' ? detail : t('模型目录加载失败'))
          }
          setCatalog({ status: 'ready', groups: normalizeCatalog(response.value), error: '' })
        } catch (error) {
          setCatalog({ status: 'error', groups: [], error: error instanceof Error ? error.message : String(error) })
        }
      }

      React.useEffect(() => {
        loadModels()
      }, [])

      function markDirty() {
        setStatus('dirty')
        setMessage('')
        setConfirmDelete(false)
      }

      function selectProfile(id) {
        setSettings((previous) => previous === null ? previous : { ...previous, activeProfileId: id })
        markDirty()
      }

      function renameProfile(name) {
        const activeId = settings === null ? '' : settings.activeProfileId
        setSettings((previous) => previous === null ? previous : ({
          ...previous,
          profiles: previous.profiles.map((profile) => profile.id === activeId ? { ...profile, name } : profile)
        }))
        markDirty()
      }

      function addProfile() {
        setSettings((previous) => {
          if (previous === null) return previous
          const profile = blankProfile(newProfileId(previous.profiles), nextProfileName(previous.profiles))
          return { ...previous, activeProfileId: profile.id, profiles: [...previous.profiles, profile] }
        })
        markDirty()
      }

      function removeProfile() {
        if (settings === null || settings.profiles.length <= 1) return
        if (!confirmDelete) {
          setConfirmDelete(true)
          return
        }
        const removedIndex = Math.max(0, settings.profiles.findIndex((profile) => profile.id === settings.activeProfileId))
        const remaining = settings.profiles.filter((profile) => profile.id !== settings.activeProfileId)
        const nextActive = remaining[Math.min(removedIndex, remaining.length - 1)].id
        setSettings({ version: 2, activeProfileId: nextActive, profiles: remaining })
        markDirty()
        setConfirmDelete(false)
      }

      function setRole(roleId, patch) {
        const activeId = settings === null ? '' : settings.activeProfileId
        setSettings((previous) => previous === null ? previous : ({
          ...previous,
          profiles: previous.profiles.map((profile) => profile.id === activeId
            ? { ...profile, roles: { ...profile.roles, [roleId]: { ...(profile.roles[roleId] || {}), ...patch } } }
            : profile)
        }))
        markDirty()
      }

      function changeModelSelection(roleId, encoded) {
        const pair = decodeModel(encoded)
        if (pair === undefined || pair.provider === '' || pair.model === '') {
          setRole(roleId, { provider: '', model: '', reasoningEffort: '' })
        } else {
          setRole(roleId, { provider: pair.provider, model: pair.model, reasoningEffort: '' })
        }
      }

      function changeEffort(roleId, reasoningEffort) {
        setRole(roleId, { reasoningEffort })
      }

      if (status === 'loading') return h('p', { style: { margin: 0, color: 'var(--dsw-alias-label-secondary)' } }, t('加载中…'))
      if (settings === null) return h('p', { style: { margin: 0, color: 'var(--dsw-alias-state-error-primary)' } }, tf('无法加载设置：{message}', { message }))
      if (!serverReady) return h('p', { style: { margin: 0, color: 'var(--dsw-alias-state-error-primary)', fontSize: '13px', lineHeight: '20px' } }, t('当前宿主仍是旧版设置接口（返回中没有 profiles）。请重启 DSH 后再打开此页面；在此之前保存会被拒绝，以免覆盖已有的团队配置。'))

      const profiles = settings.profiles
      const active = profiles.find((profile) => profile.id === settings.activeProfileId) || profiles[0]
      const canDelete = profiles.length > 1

      async function save() {
        const problem = validateProfiles(profiles)
        if (problem !== '') {
          setStatus('error')
          setMessage(problem)
          return
        }
        setStatus('saving')
        setMessage('')
        try {
          const response = await fetch(ROUTE, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
              version: 2,
              activeProfileId: active.id,
              profiles: profiles.map((profile) => ({
                id: profile.id,
                name: profile.name.trim(),
                roles: profile.roles
              }))
            })
          })
          const data = await response.json()
          if (!response.ok || !data.ok) throw new Error(data.error || `HTTP ${response.status}`)
          setSettings(normalizeSettingsPayload(data))
          setStatus('saved')
          setMessage(t('已保存，下一次创建 teammate 时生效。'))
        } catch (error) {
          setStatus('error')
          setMessage(error instanceof Error ? error.message : String(error))
        }
      }

      const catalogNotice = catalog.status === 'loading'
        ? h('p', { key: 'loading', style: { margin: 0, color: 'var(--dsw-alias-label-tertiary)', fontSize: '12px' } }, t('正在加载模型目录…'))
        : catalog.status === 'error'
          ? h('div', { key: 'error', style: { display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--dsw-alias-state-error-primary)', fontSize: '12px' } }, [
              h('span', { key: 'text' }, tf('模型目录加载失败：{error}', { error: catalog.error })),
              h('button', {
                key: 'retry',
                type: 'button',
                onClick: loadModels,
                style: { ...buttonStyle, height: '26px', padding: '0 9px', fontSize: '12px' }
              }, t('重试'))
            ])
          : catalog.groups.length === 0
            ? h('p', { key: 'empty', style: { margin: 0, color: 'var(--dsw-alias-label-tertiary)', fontSize: '12px' } }, t('模型目录为空；请先在模型设置里配置可用的 provider。'))
            : null

      const profileBar = h('div', {
        key: 'profiles',
        style: {
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          padding: '12px',
          border: '0.5px solid var(--dsw-alias-border-l3)',
          borderRadius: 'var(--dsw-radius-lg)',
          background: 'var(--dsw-alias-bg-layer-2)'
        }
      }, [
        h('div', { key: 'picker', style: { display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px' } }, [
          h('span', { key: 'label', style: { fontSize: '13px', fontWeight: 500 } }, t('团队配置')),
          h('select', {
            key: 'select',
            value: active.id,
            style: { ...controlStyle, width: '220px' },
            onChange: (event) => selectProfile(event.target.value)
          }, profiles.map((profile) => h('option', { key: profile.id, value: profile.id }, profile.name))),
          h('button', { key: 'add', type: 'button', onClick: addProfile, style: secondaryButtonStyle }, t('新建配置')),
          h('button', {
            key: 'remove',
            type: 'button',
            onClick: removeProfile,
            disabled: !canDelete,
            style: {
              ...secondaryButtonStyle,
              opacity: canDelete ? 1 : 0.45,
              ...(confirmDelete ? {
                background: 'var(--dsw-alias-state-error-primary)',
                color: 'var(--dsw-alias-label-primary-foreground)',
                border: '0'
              } : {})
            }
          }, confirmDelete ? t('确认删除') : t('删除配置')),
          confirmDelete
            ? h('button', { key: 'cancel', type: 'button', onClick: () => setConfirmDelete(false), style: secondaryButtonStyle }, t('取消'))
            : null
        ]),
        h('div', { key: 'naming', style: { display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px' } }, [
          h('span', { key: 'label', style: { fontSize: '13px', color: 'var(--dsw-alias-label-secondary)' } }, t('配置名称')),
          h('input', {
            key: 'name',
            type: 'text',
            value: active.name,
            maxLength: MAX_NAME,
            spellCheck: false,
            style: { ...controlStyle, width: '260px' },
            onChange: (event) => renameProfile(event.target.value)
          }),
          h('span', { key: 'count', style: { fontSize: '12px', color: 'var(--dsw-alias-label-tertiary)' } }, tf('共 {count} 套配置；保存后使用「{name}」', { count: profiles.length, name: active.name.trim() === '' ? t('未命名') : active.name.trim() }))
        ])
      ])

      const roleRows = ROLES.map((role) => {
        const value = active.roles[role.id]
        const group = catalog.groups.find((item) => item.id === value.provider)
        const model = group === undefined ? undefined : group.models.find((item) => item.id === value.model)
        const efforts = model !== undefined && model.reasoning !== undefined ? model.reasoning.efforts : []
        const defaultEffort = model !== undefined && model.reasoning !== undefined ? model.reasoning.defaultEffort : ''

        const modelValue = value.provider !== '' && value.model !== '' ? encodeModel(value.provider, value.model) : ''
        const modelOptions = [h('option', { key: '', value: '' }, t('继承 Lead'))]
        for (const item of catalog.groups) {
          if (item.models.length === 0) continue
          modelOptions.push(h('optgroup', {
            key: `group:${item.id}`,
            label: labelProvider(item)
          }, item.models.map((modelItem) => h('option', {
            key: `${item.id}\u0000${modelItem.id}`,
            value: encodeModel(item.id, modelItem.id)
          }, labelModel(modelItem)))))
        }
        if (value.provider !== '' && value.model !== '') {
          const savedGroup = catalog.groups.find((item) => item.id === value.provider)
          const available = savedGroup !== undefined && savedGroup.models.some((item) => item.id === value.model)
          if (!available) {
            modelOptions.push(h('optgroup', { key: 'saved-unavailable', label: t('当前不可用') }, [
              h('option', {
                key: `saved:${value.provider}\u0000${value.model}`,
                value: encodeModel(value.provider, value.model)
              }, `${value.provider} / ${value.model}`)
            ]))
          }
        }

        const effortOptions = [h('option', { key: '', value: '' }, defaultEffort === '' ? t('模型默认') : tf('模型默认（{effort}）', { effort: defaultEffort }))]
        for (const item of efforts) {
          effortOptions.push(h('option', { key: item.id, value: item.id }, labelEffort(item)))
        }
        if (value.reasoningEffort !== '' && !efforts.some((item) => item.id === value.reasoningEffort)) {
          effortOptions.push(h('option', { key: `saved:${value.reasoningEffort}`, value: value.reasoningEffort }, tf('{effort}（当前不可用）', { effort: value.reasoningEffort })))
        }

        return h('div', {
          key: role.id,
          style: {
            display: 'grid',
            gridTemplateColumns: '150px minmax(0, 1fr) 170px',
            gap: '12px',
            alignItems: 'center',
            padding: '10px 12px',
            borderTop: '0.5px solid var(--dsw-alias-border-l3)'
          }
        }, [
          h('div', { key: 'role', style: { minWidth: 0 } }, [
            h('div', { key: 'zh', style: { fontSize: '13px', fontWeight: 500 } }, roleLabel(role)),
            h('div', { key: 'id', style: { fontSize: '11px', color: 'var(--dsw-alias-label-tertiary)' } }, role.id)
          ]),
          h('select', {
            key: 'model',
            value: modelValue,
            style: controlStyle,
            onChange: (event) => changeModelSelection(role.id, event.target.value)
          }, modelOptions),
          h('select', {
            key: 'effort',
            value: value.reasoningEffort,
            disabled: value.model === '',
            style: { ...controlStyle, opacity: value.model === '' ? 0.55 : 1 },
            onChange: (event) => changeEffort(role.id, event.target.value)
          }, effortOptions)
        ])
      })

      return h('div', { style: { display: 'flex', flexDirection: 'column', gap: '18px' } }, [
        h('div', { key: 'head' }, [
          h('h3', { key: 'title', style: { margin: '0 0 6px', fontSize: '15px', fontWeight: 500 } }, t('智能体团队的模型配置')),
          h('p', { key: 'note', style: { margin: 0, color: 'var(--dsw-alias-label-secondary)', fontSize: '13px', lineHeight: '20px' } }, t('每套配置包含 8 个默认成员的 Provider / Model / 思考强度，可以创建、命名、切换与删除多套配置。保存后，选中的配置用于下一次创建默认 teammate；显式传入 model 的调用仍然优先。留空（继承 Lead）表示跟随 Lead；思考强度留空表示使用模型默认。')),
          catalogNotice === null ? null : h('div', { key: 'catalog', style: { marginTop: '8px' } }, catalogNotice)
        ]),
        profileBar,
        h('div', { key: 'roles', style: { border: '0.5px solid var(--dsw-alias-border-l3)', borderRadius: 'var(--dsw-radius-lg)', overflow: 'hidden' } }, [
          h('div', {
            key: 'header',
            style: {
              display: 'grid',
              gridTemplateColumns: '150px minmax(0, 1fr) 170px',
              gap: '12px',
              padding: '8px 12px',
              background: 'var(--dsw-alias-bg-layer-2)',
              color: 'var(--dsw-alias-label-tertiary)',
              fontSize: '12px'
            }
          }, [
            h('span', { key: 'member' }, t('成员')),
            h('span', { key: 'model' }, t('模型（Provider + Model）')),
            h('span', { key: 'effort' }, t('思考强度'))
          ]),
          ...roleRows
        ]),
        h('div', { key: 'actions', style: { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px' } }, [
          h('button', {
            key: 'save',
            type: 'button',
            disabled: status === 'saving',
            style: { ...buttonStyle, opacity: status === 'saving' ? 0.55 : 1 },
            onClick: save
          }, status === 'saving' ? t('保存中…') : t('保存')),
          message === ''
            ? null
            : h('span', {
                key: 'message',
                role: 'status',
                style: { color: status === 'error' ? 'var(--dsw-alias-state-error-primary)' : 'var(--dsw-alias-label-secondary)', fontSize: '12px' }
              }, message)
        ])
      ])
    }

    function apply(ctx) {
      /* Follow the DSH language setting: read it once, then keep listening so a
         later switch re-renders the page and the configure-row summary. */
      const locale = ctx.locale
      if (locale !== undefined && locale !== null && typeof locale.getSnapshot === 'function') {
        setLocale(locale.getSnapshot().active)
        if (typeof ctx.effect === 'function' && typeof locale.subscribe === 'function') {
          ctx.effect(() => locale.subscribe(() => setLocale(locale.getSnapshot().active)), 'research-team-settings:locale')
        }
      }
      const loadCatalog = () => ctx.remote.session.modelCatalog()
      ctx.slots.inject('plugins.row.config', () => ctx.slots.register({
        name: 'plugins.row.config',
        key: 'dsh-research-team-preset#research-team-settings'
      }, (props) => props && props.view === 'summary'
        ? t('配置默认团队成员的 LLM 与思考强度')
        : h(SettingsPage, { ...(props || {}), loadCatalog })))
    }


    exports.apply = apply
    exports.name = 'research-team-settings-client'
    exports.inject = ["slots", "remote", "remote.session"]
    return module.exports
  }
})

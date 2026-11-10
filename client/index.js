window.__ModuleLoader__.load({
  id: 'dsh-research-team-preset',
  factory: (require) => {
    const module = { exports: {} }
    const exports = module.exports
    const React = require('react')
    const h = React.createElement

    const ROUTE = '/api/dsh-research-team-settings'
    const ROLES = [
      { id: 'advisor', zh: '学术顾问' },
      { id: 'designer', zh: '实验设计' },
      { id: 'researcher', zh: '资料员' },
      { id: 'data', zh: '数据获取' },
      { id: 'builder', zh: '代码构建' },
      { id: 'runner', zh: '训练与运行' },
      { id: 'reviewer', zh: '资料/代码审查' },
      { id: 'writer', zh: '论文写作' }
    ]
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
      let name = `配置 ${index}`
      while (names.has(name)) {
        index += 1
        name = `配置 ${index}`
      }
      return name
    }

    function normalizeSettingsPayload(value) {
      const source = value !== null && typeof value === 'object' ? value : {}
      const rawProfiles = Array.isArray(source.profiles) ? source.profiles : []
      const profiles = rawProfiles.map((item, index) => {
        const profile = item !== null && typeof item === 'object' ? item : {}
        const id = typeof profile.id === 'string' && /^[A-Za-z0-9_-]{1,64}$/.test(profile.id) ? profile.id : `profile-${index + 1}`
        const name = typeof profile.name === 'string' && profile.name.trim() !== '' ? profile.name.trim() : `配置 ${index + 1}`
        return { id, name, roles: normalizeRoles(profile.roles) }
      })
      if (profiles.length === 0) profiles.push(blankProfile('default', '默认配置'))
      if (rawProfiles.length === 0 && source.roles !== undefined) {
        profiles[0].roles = normalizeRoles(source.roles)
      }
      const wanted = typeof source.activeProfileId === 'string' ? source.activeProfileId : ''
      const activeProfileId = profiles.some((profile) => profile.id === wanted) ? wanted : profiles[0].id
      return { version: 2, activeProfileId, profiles }
    }

    function validateProfiles(profiles) {
      if (!Array.isArray(profiles) || profiles.length === 0) return '至少需要一套团队配置'
      if (profiles.length > MAX_PROFILES) return `团队配置最多 ${MAX_PROFILES} 套`
      const names = new Set()
      for (const profile of profiles) {
        const name = typeof profile.name === 'string' ? profile.name.trim() : ''
        if (name === '') return '配置名称不能为空'
        if (name.length > MAX_NAME) return `配置名称「${name.slice(0, 16)}…」超过 ${MAX_NAME} 个字符`
        if (names.has(name)) return `配置名称「${name}」重复，请改成唯一名称`
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
          setCatalog({ status: 'error', groups: [], error: '模型目录服务不可用' })
          return
        }
        setCatalog((previous) => ({ status: 'loading', groups: previous.groups, error: '' }))
        try {
          const response = await loadCatalog()
          if (response === null || typeof response !== 'object' || response.ok !== true) {
            const detail = response !== null && typeof response === 'object' && response.error !== null && typeof response.error === 'object'
              ? response.error.message
              : undefined
            throw new Error(typeof detail === 'string' && detail !== '' ? detail : '模型目录加载失败')
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

      if (status === 'loading') return h('p', { style: { margin: 0, color: 'var(--dsw-alias-label-secondary)' } }, '加载中…')
      if (settings === null) return h('p', { style: { margin: 0, color: 'var(--dsw-alias-state-error-primary)' } }, `无法加载设置：${message}`)
      if (!serverReady) return h('p', { style: { margin: 0, color: 'var(--dsw-alias-state-error-primary)', fontSize: '13px', lineHeight: '20px' } }, '当前宿主仍是旧版设置接口（返回中没有 profiles）。请重启 DSH 后再打开此页面；在此之前保存会被拒绝，以免覆盖已有的团队配置。')

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
          setMessage('已保存，下一次创建 teammate 时生效。')
        } catch (error) {
          setStatus('error')
          setMessage(error instanceof Error ? error.message : String(error))
        }
      }

      const catalogNotice = catalog.status === 'loading'
        ? h('p', { key: 'loading', style: { margin: 0, color: 'var(--dsw-alias-label-tertiary)', fontSize: '12px' } }, '正在加载模型目录…')
        : catalog.status === 'error'
          ? h('div', { key: 'error', style: { display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--dsw-alias-state-error-primary)', fontSize: '12px' } }, [
              h('span', { key: 'text' }, `模型目录加载失败：${catalog.error}`),
              h('button', {
                key: 'retry',
                type: 'button',
                onClick: loadModels,
                style: { ...buttonStyle, height: '26px', padding: '0 9px', fontSize: '12px' }
              }, '重试')
            ])
          : catalog.groups.length === 0
            ? h('p', { key: 'empty', style: { margin: 0, color: 'var(--dsw-alias-label-tertiary)', fontSize: '12px' } }, '模型目录为空；请先在模型设置里配置可用的 provider。')
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
          h('span', { key: 'label', style: { fontSize: '13px', fontWeight: 500 } }, '团队配置'),
          h('select', {
            key: 'select',
            value: active.id,
            style: { ...controlStyle, width: '220px' },
            onChange: (event) => selectProfile(event.target.value)
          }, profiles.map((profile) => h('option', { key: profile.id, value: profile.id }, profile.name))),
          h('button', { key: 'add', type: 'button', onClick: addProfile, style: secondaryButtonStyle }, '新建配置'),
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
          }, confirmDelete ? '确认删除' : '删除配置'),
          confirmDelete
            ? h('button', { key: 'cancel', type: 'button', onClick: () => setConfirmDelete(false), style: secondaryButtonStyle }, '取消')
            : null
        ]),
        h('div', { key: 'naming', style: { display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px' } }, [
          h('span', { key: 'label', style: { fontSize: '13px', color: 'var(--dsw-alias-label-secondary)' } }, '配置名称'),
          h('input', {
            key: 'name',
            type: 'text',
            value: active.name,
            maxLength: MAX_NAME,
            spellCheck: false,
            style: { ...controlStyle, width: '260px' },
            onChange: (event) => renameProfile(event.target.value)
          }),
          h('span', { key: 'count', style: { fontSize: '12px', color: 'var(--dsw-alias-label-tertiary)' } }, `共 ${profiles.length} 套配置；保存后使用「${active.name.trim() === '' ? '未命名' : active.name.trim()}」`)
        ])
      ])

      const roleRows = ROLES.map((role) => {
        const value = active.roles[role.id]
        const group = catalog.groups.find((item) => item.id === value.provider)
        const model = group === undefined ? undefined : group.models.find((item) => item.id === value.model)
        const efforts = model !== undefined && model.reasoning !== undefined ? model.reasoning.efforts : []
        const defaultEffort = model !== undefined && model.reasoning !== undefined ? model.reasoning.defaultEffort : ''

        const modelValue = value.provider !== '' && value.model !== '' ? encodeModel(value.provider, value.model) : ''
        const modelOptions = [h('option', { key: '', value: '' }, '继承 Lead')]
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
            modelOptions.push(h('optgroup', { key: 'saved-unavailable', label: '当前不可用' }, [
              h('option', {
                key: `saved:${value.provider}\u0000${value.model}`,
                value: encodeModel(value.provider, value.model)
              }, `${value.provider} / ${value.model}`)
            ]))
          }
        }

        const effortOptions = [h('option', { key: '', value: '' }, defaultEffort === '' ? '模型默认' : `模型默认（${defaultEffort}）`)]
        for (const item of efforts) {
          effortOptions.push(h('option', { key: item.id, value: item.id }, labelEffort(item)))
        }
        if (value.reasoningEffort !== '' && !efforts.some((item) => item.id === value.reasoningEffort)) {
          effortOptions.push(h('option', { key: `saved:${value.reasoningEffort}`, value: value.reasoningEffort }, `${value.reasoningEffort}（当前不可用）`))
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
            h('div', { key: 'zh', style: { fontSize: '13px', fontWeight: 500 } }, role.zh),
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
          h('h3', { key: 'title', style: { margin: '0 0 6px', fontSize: '15px', fontWeight: 500 } }, '智能体团队的模型配置'),
          h('p', { key: 'note', style: { margin: 0, color: 'var(--dsw-alias-label-secondary)', fontSize: '13px', lineHeight: '20px' } }, '每套配置包含 8 个默认成员的 Provider / Model / 思考强度，可以创建、命名、切换与删除多套配置。保存后，选中的配置用于下一次创建默认 teammate；显式传入 model 的调用仍然优先。留空（继承 Lead）表示跟随 Lead；思考强度留空表示使用模型默认。'),
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
            h('span', { key: 'member' }, '成员'),
            h('span', { key: 'model' }, '模型（Provider + Model）'),
            h('span', { key: 'effort' }, '思考强度')
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
          }, status === 'saving' ? '保存中…' : '保存'),
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

    /* ---------------------------------------------------------------- */
    /* Research sidebar: team state and architecture cards.              */
    /* ---------------------------------------------------------------- */

    const PANEL_ROUTE = '/api/dsh-research-team-panel'

    const KIND_LABELS = {
      input: '输入',
      module: '模块',
      output: '输出',
      data: '数据',
      loss: '目标',
      note: '说明'
    }
    const CARD_KIND_LABELS = {
      method: '方法',
      model: '模型',
      experiment: '实验',
      pipeline: '流程'
    }

    function pad(value) {
      return String(value).padStart(2, '0')
    }

    function formatSince(iso) {
      if (typeof iso !== 'string' || iso === '') return ''
      const then = Date.parse(iso)
      if (Number.isNaN(then)) return ''
      const seconds = Math.max(0, Math.round((Date.now() - then) / 1000))
      if (seconds < 60) return `${seconds} 秒前`
      const minutes = Math.round(seconds / 60)
      if (minutes < 60) return `${minutes} 分钟前`
      const hours = Math.round(minutes / 60)
      if (hours < 48) return `${hours} 小时前`
      const date = new Date(then)
      return `${date.getMonth() + 1}月${date.getDate()}日`
    }

    function wrapLabel(label, perLine) {
      const text = String(label ?? '')
      if (text.length <= perLine) return [text]
      const first = text.slice(0, perLine)
      const rest = text.slice(perLine, perLine * 2 - 1)
      return [first, text.length > perLine * 2 - 1 ? `${rest}…` : rest]
    }

    function statusTone(status) {
      const value = String(status ?? '').toLowerCase()
      if (value === 'in_progress' || value === 'running') return 'var(--dsw-alias-brand-primary)'
      if (value === 'blocked' || value === 'failed') return 'var(--dsw-alias-state-error-primary)'
      if (value === 'in_review' || value === 'waiting') return 'var(--dsw-alias-state-warn-primary)'
      if (value === 'done' || value === 'passed') return 'var(--dsw-alias-state-success-primary)'
      return 'var(--dsw-alias-label-tertiary)'
    }

    function smallButton(label, onClick, disabled) {
      return h('button', {
        type: 'button',
        disabled: disabled === true,
        onClick,
        style: {
          height: '26px',
          padding: '0 10px',
          border: '0.5px solid var(--dsw-alias-border-l3)',
          borderRadius: 'var(--dsw-radius-md)',
          background: 'var(--dsw-alias-bg-layer-2)',
          color: 'var(--dsw-alias-label-primary)',
          font: 'inherit',
          fontSize: '12px',
          cursor: disabled === true ? 'default' : 'pointer',
          opacity: disabled === true ? 0.5 : 1
        }
      }, label)
    }

    function Section(props) {
      return h('div', { style: { marginTop: '14px' } }, [
        h('div', {
          key: 'title',
          style: {
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            fontSize: '11px',
            letterSpacing: '0.04em',
            color: 'var(--dsw-alias-label-tertiary)',
            marginBottom: '6px'
          }
        }, [
          h('span', { key: 'name' }, props.title),
          props.extra === undefined ? null : h('span', { key: 'extra', style: { letterSpacing: 0 } }, props.extra)
        ]),
        h('div', { key: 'body' }, props.children)
      ])
    }

    function ArchitectureCanvas(props) {
      const card = props.card
      const selected = props.selected
      const onToggle = props.onToggle
      const svgRef = React.useRef(null)
      const [view, setView] = React.useState(null)
      const [marquee, setMarquee] = React.useState(null)
      const [pointerId, setPointerId] = React.useState(null)

      const canvas = card.canvas || {}
      const width = Number(canvas.width) > 0 ? Number(canvas.width) : 1200
      const height = Number(canvas.height) > 0 ? Number(canvas.height) : 800
      const box = view || { x: 0, y: 0, w: width, h: height }

      function point(event) {
        const svg = svgRef.current
        if (svg === null) return { x: 0, y: 0 }
        const matrix = svg.getScreenCTM()
        if (matrix === null) return { x: 0, y: 0 }
        const pt = svg.createSVGPoint()
        pt.x = event.clientX
        pt.y = event.clientY
        const mapped = pt.matrixTransform(matrix.inverse())
        return { x: mapped.x, y: mapped.y }
      }

      function onWheel(event) {
        event.preventDefault()
        const factor = event.deltaY > 0 ? 1.12 : 0.89
        const next = Math.min(4, Math.max(1, (width / box.w) * (1 / factor)))
        const anchored = point(event)
        const nextW = width / next
        const nextH = height / next
        const ratioX = (anchored.x - box.x) / box.w
        const ratioY = (anchored.y - box.y) / box.h
        setView({ x: anchored.x - ratioX * nextW, y: anchored.y - ratioY * nextH, w: nextW, h: nextH })
      }

      function onDown(event) {
        if (event.button !== 0) return
        const start = point(event)
        setPointerId(event.pointerId)
        setMarquee({ x0: start.x, y0: start.y, x1: start.x, y1: start.y })
        if (svgRef.current !== null) svgRef.current.setPointerCapture(event.pointerId)
      }

      function onMove(event) {
        if (marquee === null) return
        const current = point(event)
        setMarquee({ ...marquee, x1: current.x, y1: current.y })
      }

      function onUp() {
        if (marquee === null) return
        const x0 = Math.min(marquee.x0, marquee.x1)
        const x1 = Math.max(marquee.x0, marquee.x1)
        const y0 = Math.min(marquee.y0, marquee.y1)
        const y1 = Math.max(marquee.y0, marquee.y1)
        if (x1 - x0 > 6 && y1 - y0 > 6) {
          const hits = (card.nodes || []).filter((node) => {
            const left = Number(node.x) || 0
            const top = Number(node.y) || 0
            const w = Number(node.w) || 0
            const h = Number(node.h) || 0
            return left < x1 && left + w > x0 && top < y1 && top + h > y0
          }).map((node) => node.id)
          props.onMarquee(hits)
        }
        setMarquee(null)
        if (svgRef.current !== null && pointerId !== null) {
          try { svgRef.current.releasePointerCapture(pointerId) } catch {}
        }
        setPointerId(null)
      }

      const nodes = Array.isArray(card.nodes) ? card.nodes : []
      const edges = Array.isArray(card.edges) ? card.edges : []
      const byId = new Map(nodes.map((node) => [node.id, node]))

      const edgeElements = edges.map((edge, index) => {
        const from = byId.get(edge.from)
        const to = byId.get(edge.to)
        if (from === undefined || to === undefined) return null
        const x1 = Number(from.x) + Number(from.w) / 2
        const y1 = Number(from.y) + Number(from.h) / 2
        const x2 = Number(to.x) + Number(to.w) / 2
        const y2 = Number(to.y) + Number(to.h) / 2
        return h('line', {
          key: `e${index}`,
          x1, y1, x2, y2,
          stroke: 'var(--dsw-alias-border-l2)',
          strokeWidth: 1.2,
          markerEnd: 'url(#rt-arrow)'
        })
      })

      const nodeElements = nodes.map((node) => {
        const isSelected = selected.indexOf(node.id) >= 0
        const w = Number(node.w) || 160
        const hgt = Number(node.h) || 56
        const lines = wrapLabel(node.label, Math.max(6, Math.floor((w - 20) / 13)))
        const stroke = isSelected ? 'var(--dsw-alias-brand-primary)' : 'var(--dsw-alias-border-l2)'
        return h('g', {
          key: node.id,
          onClick: (event) => {
            event.stopPropagation()
            onToggle(node.id)
          },
          style: { cursor: 'pointer' }
        }, [
          h('rect', {
            key: 'box',
            x: Number(node.x) || 0,
            y: Number(node.y) || 0,
            width: w,
            height: hgt,
            rx: 8,
            fill: isSelected ? 'var(--dsw-alias-bg-layer-3)' : 'var(--dsw-alias-bg-layer-2)',
            stroke,
            strokeWidth: isSelected ? 1.6 : 1
          }),
          h('text', {
            key: 'l1',
            x: (Number(node.x) || 0) + 10,
            y: (Number(node.y) || 0) + 23,
            fill: 'var(--dsw-alias-label-primary)',
            fontSize: 12,
            fontFamily: 'inherit'
          }, lines[0]),
          lines.length > 1
            ? h('text', {
                key: 'l2',
                x: (Number(node.x) || 0) + 10,
                y: (Number(node.y) || 0) + 39,
                fill: 'var(--dsw-alias-label-secondary)',
                fontSize: 11,
                fontFamily: 'inherit'
              }, lines[1])
            : null,
          h('title', { key: 'tip' }, `${KIND_LABELS[node.kind] || node.kind || '模块'} · ${node.id}`)
        ])
      })

      return h('div', { style: { position: 'relative', border: '0.5px solid var(--dsw-alias-border-l2)', borderRadius: 'var(--dsw-radius-lg)', overflow: 'hidden', background: 'var(--dsw-alias-bg-layer-1)' } }, [
        h('svg', {
          key: 'svg',
          ref: svgRef,
          viewBox: `${box.x} ${box.y} ${box.w} ${box.h}`,
          style: { display: 'block', width: '100%', height: '260px', touchAction: 'none' },
          onWheel,
          onPointerDown: onDown,
          onPointerMove: onMove,
          onPointerUp: onUp,
          onPointerLeave: onUp
        }, [
          h('defs', { key: 'defs' }, [
            h('marker', {
              key: 'arrow',
              id: 'rt-arrow',
              markerWidth: 8,
              markerHeight: 8,
              refX: 7,
              refY: 4,
              orient: 'auto'
            }, [h('path', { key: 'p', d: 'M0,0 L8,4 L0,8 z', fill: 'var(--dsw-alias-border-l2)' })])
          ]),
          ...edgeElements,
          ...nodeElements,
          marquee === null ? null : h('rect', {
            key: 'marquee',
            x: Math.min(marquee.x0, marquee.x1),
            y: Math.min(marquee.y0, marquee.y1),
            width: Math.abs(marquee.x1 - marquee.x0),
            height: Math.abs(marquee.y1 - marquee.y0),
            fill: 'color-mix(in srgb, var(--dsw-alias-brand-primary) 12%, transparent)',
            stroke: 'var(--dsw-alias-brand-primary)',
            strokeWidth: 1,
            strokeDasharray: '4 3'
          })
        ])
      ])
    }

    function ResearchPanel(props) {
      const sessionId = props.sessionId
      const [state, setState] = React.useState(null)
      const [error, setError] = React.useState('')
      const [selectedCard, setSelectedCard] = React.useState('')
      const [selectedNodes, setSelectedNodes] = React.useState([])
      const [note, setNote] = React.useState('')
      const [busy, setBusy] = React.useState(false)
      const [toast, setToast] = React.useState('')

      const load = React.useCallback(async () => {
        try {
          const response = await fetch(`${PANEL_ROUTE}?session=${encodeURIComponent(sessionId || '')}`)
          const data = await response.json()
          if (!response.ok || !data.ok) throw new Error(data.error || `HTTP ${response.status}`)
          setState(data)
          setError('')
          setSelectedCard((current) => {
            if (current !== '' && (data.architectures || []).some((card) => card.id === current)) return current
            const first = (data.architectures || [])[0]
            return first === undefined ? '' : first.id
          })
        } catch (failure) {
          setError(failure.message)
        }
      }, [sessionId])

      React.useEffect(() => {
        load()
        const timer = setInterval(() => {
          if (document.visibilityState === 'visible') load()
        }, 5000)
        const onVisible = () => {
          if (document.visibilityState === 'visible') load()
        }
        document.addEventListener('visibilitychange', onVisible)
        return () => {
          clearInterval(timer)
          document.removeEventListener('visibilitychange', onVisible)
        }
      }, [load])

      React.useEffect(() => {
        if (toast === '') return undefined
        const timer = setTimeout(() => setToast(''), 2600)
        return () => clearTimeout(timer)
      }, [toast])

      const architectures = (state && state.architectures) || []
      const card = architectures.find((entry) => entry.id === selectedCard) || architectures[0]
      const worklog = (state && state.worklog) || {}
      const cards = (state && state.cards) || []
      const runs = (state && state.runs) || []
      const designs = (state && state.designs) || []
      const waiting = cards.filter((entry) => /waiting|in_review|blocked/i.test(entry.status))
      const fresh = state === null ? '' : formatSince(state.fetchedAt || new Date().toISOString())

      function toggleNode(id) {
        setSelectedNodes((current) => (current.indexOf(id) >= 0 ? current.filter((item) => item !== id) : [...current, id]))
      }

      async function submitNote() {
        if (card === undefined || note.trim() === '' || busy) return
        setBusy(true)
        try {
          const response = await fetch(PANEL_ROUTE, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ op: 'annotate', sessionId, id: card.id, text: note.trim(), targets: selectedNodes })
          })
          const data = await response.json()
          if (!response.ok || !data.ok) throw new Error(data.error || `HTTP ${response.status}`)
          setNote('')
          setSelectedNodes([])
          setToast('标注已记录，模型下一轮会读到')
          load()
        } catch (failure) {
          setToast(failure.message)
        } finally {
          setBusy(false)
        }
      }

      const header = h('div', { key: 'header', style: { paddingBottom: '10px', borderBottom: '0.5px solid var(--dsw-alias-border-l2)' } }, [
        h('div', {
          key: 'objective',
          style: { fontSize: '13px', lineHeight: '19px', color: 'var(--dsw-alias-label-primary)', fontWeight: 500 }
        }, worklog.objective || '未设置目标'),
        h('div', {
          key: 'milestone',
          style: { marginTop: '4px', fontSize: '12px', color: 'var(--dsw-alias-label-secondary)' }
        }, [worklog.milestone, worklog.milestone && worklog.next ? ' · 下一步 ' + worklog.next : worklog.next].filter(Boolean).join('') || '尚无里程碑'),
        waiting.length === 0
          ? null
          : h('div', {
              key: 'waiting',
              style: {
                marginTop: '6px',
                fontSize: '12px',
                color: 'var(--dsw-alias-state-warn-primary)',
                display: 'flex',
                gap: '6px',
                alignItems: 'baseline'
              }
            }, `⚠ 等你处理 ${waiting.length} 项：${waiting.slice(0, 2).map((entry) => entry.title || entry.id).join('、')}`)
      ])

      const archSection = h(Section, {
        key: 'arch',
        title: '架构',
        extra: architectures.length === 0 ? '' : `${architectures.length} 张`
      }, [
        architectures.length === 0
          ? h('div', { key: 'empty', style: { fontSize: '12px', color: 'var(--dsw-alias-label-tertiary)', lineHeight: '18px' } },
              '还没有架构卡片。设计者可以用 research_architecture 建一张，或在 .research/architecture/ 下放一个 JSON。')
          : h('div', { key: 'chips', style: { display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' } },
              architectures.map((entry) => h('button', {
                key: entry.id,
                type: 'button',
                onClick: () => {
                  setSelectedCard(entry.id)
                  setSelectedNodes([])
                },
                style: {
                  height: '26px',
                  padding: '0 10px',
                  border: '0.5px solid ' + (entry.id === (card && card.id) ? 'var(--dsw-alias-brand-primary)' : 'var(--dsw-alias-border-l2)'),
                  borderRadius: '999px',
                  background: entry.id === (card && card.id) ? 'var(--dsw-alias-bg-layer-3)' : 'transparent',
                  color: 'var(--dsw-alias-label-primary)',
                  font: 'inherit',
                  fontSize: '12px',
                  cursor: 'pointer'
                }
              }, [entry.title, `v${entry.version}`].join(' · ')))),
        card === undefined
          ? null
          : h('div', { key: 'detail' }, [
              h('div', {
                key: 'meta',
                style: { display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--dsw-alias-label-tertiary)', marginBottom: '6px' }
              }, [
                h('span', { key: 'kind' }, `${CARD_KIND_LABELS[card.kind] || card.kind} · ${(card.nodes || []).length} 节点`),
                h('span', { key: 'when' }, formatSince(card.updatedAt))
              ]),
              h(ArchitectureCanvas, {
                key: 'canvas',
                card,
                selected: selectedNodes,
                onToggle: toggleNode,
                onMarquee: (ids) => setSelectedNodes((current) => Array.from(new Set([...current, ...ids])))
              }),
              h('div', {
                key: 'hint',
                style: { marginTop: '6px', fontSize: '11px', color: 'var(--dsw-alias-label-tertiary)' }
              }, selectedNodes.length === 0 ? '拖动框选节点后可以提问' : `已选 ${selectedNodes.length} 个节点`),
              selectedNodes.length === 0
                ? null
                : h('div', { key: 'compose', style: { marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' } }, [
                    h('textarea', {
                      key: 'text',
                      value: note,
                      rows: 3,
                      placeholder: '针对选中的节点提问，例如：这一层的输入是不是漏了 mask',
                      onChange: (event) => setNote(event.target.value),
                      style: {
                        width: '100%',
                        boxSizing: 'border-box',
                        padding: '7px 9px',
                        border: '0.5px solid var(--dsw-alias-border-l3)',
                        borderRadius: 'var(--dsw-radius-md)',
                        background: 'var(--dsw-alias-bg-layer-2)',
                        color: 'var(--dsw-alias-label-primary)',
                        font: 'inherit',
                        fontSize: '12px',
                        resize: 'vertical'
                      }
                    }),
                    h('div', { key: 'actions', style: { display: 'flex', gap: '6px' } }, [
                      smallButton(busy ? '保存中…' : '记录标注', submitNote, busy || note.trim() === ''),
                      smallButton('清空选择', () => setSelectedNodes([]), false)
                    ])
                  ])
            ])
      ])

      const cardsSection = h(Section, {
        key: 'cards',
        title: '卡片',
        extra: cards.length === 0 ? '' : `${cards.length} 张`
      }, cards.length === 0
        ? h('div', { key: 'empty', style: { fontSize: '12px', color: 'var(--dsw-alias-label-tertiary)' } }, '没有活动卡片')
        : cards.map((entry) => h('div', {
            key: entry.id,
            style: { display: 'flex', gap: '8px', alignItems: 'baseline', padding: '4px 0', fontSize: '12px' }
          }, [
            h('span', { key: 'dot', style: { width: '6px', height: '6px', borderRadius: '3px', background: statusTone(entry.status), flex: '0 0 auto', marginTop: '5px' } }),
            h('div', { key: 'body', style: { minWidth: 0 } }, [
              h('div', { key: 'title', style: { color: 'var(--dsw-alias-label-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, `${entry.id} · ${entry.title}`),
              h('div', { key: 'meta', style: { color: 'var(--dsw-alias-label-tertiary)', fontSize: '11px' } }, [entry.status, entry.owner, entry.next].filter(Boolean).join(' · '))
            ])
          ])))

      const runsSection = h(Section, { key: 'runs', title: '实验', extra: runs.length === 0 ? '' : `${runs.length} 项` },
        runs.length === 0
          ? h('div', { key: 'empty', style: { fontSize: '12px', color: 'var(--dsw-alias-label-tertiary)' } }, '当前没有实验在跑')
          : runs.map((entry) => h('div', {
              key: entry.name,
              style: { display: 'flex', justifyContent: 'space-between', gap: '8px', padding: '3px 0', fontSize: '12px' }
            }, [
              h('span', { key: 'name', style: { color: 'var(--dsw-alias-label-primary)' } }, entry.name),
              h('span', { key: 'meta', style: { color: statusTone(entry.status), fontSize: '11px' } }, [entry.status, entry.seeds, entry.budget].filter(Boolean).join(' · ') || '—')
            ])))

      const designsSection = h(Section, { key: 'designs', title: '设计', extra: designs.length === 0 ? '' : `${designs.length} 份` },
        designs.length === 0
          ? h('div', { key: 'empty', style: { fontSize: '12px', color: 'var(--dsw-alias-label-tertiary)' } }, '还没有设计文档')
          : designs.map((entry) => h('div', { key: entry.name, style: { padding: '3px 0', fontSize: '12px' } }, [
              h('div', { key: 'name', style: { color: 'var(--dsw-alias-label-primary)' } }, entry.name),
              h('div', { key: 'meta', style: { color: 'var(--dsw-alias-label-tertiary)', fontSize: '11px' } }, [formatSince(entry.updated), entry.question].filter(Boolean).join(' · '))
            ])))

      return h('div', {
        style: {
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          minHeight: 0,
          overflowY: 'auto',
          padding: '12px',
          boxSizing: 'border-box',
          color: 'var(--dsw-alias-label-primary)',
          fontFamily: 'inherit',
          fontSize: '13px'
        }
      }, [
        header,
        error === ''
          ? null
          : h('div', { key: 'error', style: { marginTop: '8px', padding: '6px 8px', borderRadius: 'var(--dsw-radius-md)', background: 'var(--dsw-alias-bg-layer-2)', color: 'var(--dsw-alias-state-error-primary)', fontSize: '12px' } }, error),
        archSection,
        cardsSection,
        runsSection,
        designsSection,
        h('div', { key: 'footer', style: { marginTop: '14px', paddingTop: '8px', borderTop: '0.5px solid var(--dsw-alias-border-l2)', display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--dsw-alias-label-tertiary)' } }, [
          h('span', { key: 'fresh' }, state === null ? '' : `更新于 ${fresh}`),
          h('span', { key: 'root', title: (state && state.root) || '' }, state === null ? '' : '项目根')
        ]),
        toast === ''
          ? null
          : h('div', {
              key: 'toast',
              role: 'status',
              style: {
                position: 'sticky',
                bottom: 0,
                marginTop: '8px',
                padding: '6px 8px',
                borderRadius: 'var(--dsw-radius-md)',
                background: 'var(--dsw-alias-bg-layer-3)',
                color: 'var(--dsw-alias-label-primary)',
                fontSize: '11px'
              }
            }, toast)
      ])
    }

    function apply(ctx) {
      const loadCatalog = () => ctx.remote.session.modelCatalog()
      ctx.slots.inject('plugins.row.config', () => ctx.slots.register({
        name: 'plugins.row.config',
        key: 'dsh-research-team-preset#research-team-settings'
      }, (props) => props && props.view === 'summary'
        ? '配置默认团队成员的 LLM 与思考强度'
        : h(SettingsPage, { ...(props || {}), loadCatalog })))

      const sessionIdOf = (props) => {
        const value = props || {}
        if (typeof value.sessionId === 'string') return value.sessionId
        if (value.session && typeof value.session.id === 'string') return value.session.id
        if (value.scope && typeof value.scope.sessionId === 'string') return value.scope.sessionId
        return ''
      }

      const betterSidebar = typeof ctx.get === 'function' ? ctx.get('betterSidebar') : undefined
      if (betterSidebar !== undefined && betterSidebar !== null && typeof betterSidebar.registerTab === 'function') {
        ctx.effect(() => betterSidebar.registerTab({
          id: 'research-team:panel',
          title: '研究',
          description: '团队状态：架构卡片、任务、实验与设计文档',
          order: 40,
          single: true,
          component: (props) => h(ResearchPanel, { sessionId: sessionIdOf(props) })
        }))
        return
      }

      ctx.slots.inject('sidebar.right.pane.tab', () => ctx.slots.register({
        name: 'sidebar.right.pane.tab',
        key: 'research-team#panel'
      }, (props) => h(ResearchPanel, { sessionId: sessionIdOf(props) })))
      ctx.slots.inject('sidebar.right.pane.tab.title', () => ctx.slots.register({
        name: 'sidebar.right.pane.tab.title',
        key: 'research-team#panel'
      }, () => '研究'))
    }

    exports.apply = apply
    exports.inject = ['slots', 'remote', 'remote.session']
    exports.name = 'research-team-settings-client'
    return module.exports
  }
})

import { useState, useEffect } from 'react'
import Board from './components/Board'
import TaskForm from './components/TaskForm'
import TeamPanel from './components/TeamPanel'
import supabase from './supabaseClient'
import './App.css'

function App() {
  const [userId, setUserId] = useState(null)
  const [tasks, setTasks] = useState([])
  const [members, setMembers] = useState([])
  const [labels, setLabels] = useState([])
  const [activeLabels, setActiveLabels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [showTeam, setShowTeam] = useState(false)
  const [search, setSearch] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [assigneeFilter, setAssigneeFilter] = useState('')

  useEffect(() => {
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setUserId(session.user.id)
      } else {
        const { data, error } = await supabase.auth.signInAnonymously()
        if (!error) setUserId(data.user.id)
      }
    }
    initAuth()
  }, [])

  useEffect(() => {
    if (userId) {
      fetchTasks()
      fetchMembers()
      fetchLabels()
    }
  }, [userId])

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('tasks')
        .select('*, task_assignees(member_id), task_labels(label_id)')
      if (error) throw error
      setTasks(data)
    } catch (err) {
      setError('Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }

  const fetchMembers = async () => {
    const { data, error } = await supabase.from('members').select('*')
    if (!error) setMembers(data)
  }

  const fetchLabels = async () => {
    const { data, error } = await supabase.from('labels').select('*')
    if (!error) setLabels(data)
  }

  const toggleLabelFilter = (labelId) => {
    setActiveLabels(prev =>
      prev.includes(labelId)
        ? prev.filter(id => id !== labelId)
        : [...prev, labelId]
    )
  }

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase())
    
    const matchesLabel = activeLabels.length === 0
      || task.task_labels?.some(tl => activeLabels.includes(tl.label_id))
    
    const matchesPriority = !priorityFilter || task.priority === priorityFilter
    
    const matchesAssignee = !assigneeFilter
      || task.task_assignees?.some(ta => ta.member_id === assigneeFilter)
    
    return matchesSearch && matchesLabel && matchesPriority && matchesAssignee
  })

  if (loading) return (
    <div className="splash">
      <div className="spinner" />
      <p>Loading your board...</p>
    </div>
  )

  if (error) return (
    <div className="splash">
      <p className="error-text">{error}</p>
    </div>
  )

  return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          <div className="logo">⬡</div>
          <span className="header-title">Kanban</span>
        </div>
        <div className="header-right">
          <button className="btn-secondary" onClick={() => setShowTeam(true)}>
            Team
          </button>
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            + New Task
          </button>
        </div>
      </header>

      {labels.length > 0 && (
        <div className="filter-bar">
          <div className="search-wrap">
            <span className="search-icon">⌕</span>
            <input
              className="search-input"
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button className="search-clear" onClick={() => setSearch('')}>✕</button>
            )}
          </div>
          
          <div className="filter-divider" />
          
          <select
            className="filter-select"
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
          >
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          
          {members.length > 0 && (
            <select
              className="filter-select"
              value={assigneeFilter}
              onChange={e => setAssigneeFilter(e.target.value)}
            >
              <option value="">All Assignees</option>
              {members.map(member => (
                <option key={member.id} value={member.id}>{member.name}</option>
              ))}
            </select>
          )}
        
          {labels.length > 0 && (
            <>
              <div className="filter-divider" />
              <span className="filter-label">Labels:</span>
              {labels.map(label => (
                <button
                  key={label.id}
                  className={`filter-chip ${activeLabels.includes(label.id) ? 'active' : ''}`}
                  style={{ '--label-color': label.color }}
                  onClick={() => toggleLabelFilter(label.id)}
                >
                  <span className="filter-chip-dot" style={{ background: label.color }} />
                  {label.name}
                </button>
              ))}
            </>
          )}
        
          {(search || priorityFilter || assigneeFilter || activeLabels.length > 0) && (
            <button className="filter-clear" onClick={() => {
              setSearch('')
              setPriorityFilter('')
              setAssigneeFilter('')
              setActiveLabels([])
            }}>
              Clear all
            </button>
          )}
        </div>
      )}

      <Board tasks={filteredTasks} setTasks={setTasks} members={members} labels={labels} />

      {showForm && (
        <TaskForm
          setTasks={setTasks}
          onClose={() => setShowForm(false)}
          userId={userId}
          members={members}
          labels={labels}
          setLabels={setLabels}
        />
      )}

      {showTeam && (
        <TeamPanel
          members={members}
          setMembers={setMembers}
          onClose={() => setShowTeam(false)}
          userId={userId}
        />
      )}
    </div>
  )
}

export default App
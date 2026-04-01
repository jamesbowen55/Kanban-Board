import { useState } from 'react'
import supabase from '../supabaseClient'
import './TaskForm.css'

function TaskForm({ setTasks, onClose, userId, members, labels, setLabels }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('medium')
  const [dueDate, setDueDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [assignees, setAssignees] = useState([])
  const [selectedLabels, setSelectedLabels] = useState([])
  const [newLabelName, setNewLabelName] = useState('')
  const [showLabelInput, setShowLabelInput] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim()) { setError('Title is required'); return }

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('tasks')
        .insert({ title, description, priority, due_date: dueDate || null, status: 'todo', user_id: userId })
        .select()
      if (error) throw error
      if (assignees.length > 0) {
        await supabase.from('task_assignees').insert(
          assignees.map(member_id => ({ task_id: data[0].id, member_id }))
        )
      }
      if (selectedLabels.length > 0) {
        await supabase.from('task_labels').insert(
          selectedLabels.map(label_id => ({ task_id: data[0].id, label_id }))
        )
      }
      setTasks(prev => [...prev, {
        ...data[0],
        task_assignees: assignees.map(member_id => ({ member_id })),
        task_labels: selectedLabels.map(label_id => ({ label_id }))
      }])
      onClose()
    } catch (err) {
      setError('Failed to create task')
    } finally {
      setLoading(false)
    }
  }

  const toggleAssignee = (memberId) => {
    setAssignees(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    )
  }

  const toggleLabel = (labelId) => {
    setSelectedLabels(prev =>
      prev.includes(labelId)
        ? prev.filter(id => id !== labelId)
        : [...prev, labelId]
    )
  }

  const handleCreateLabel = async () => {
    if (!newLabelName.trim()) return
    const colors = ['#7c6af7','#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#f97316']
    const color = colors[Math.floor(Math.random() * colors.length)]
    const { data, error } = await supabase
      .from('labels')
      .insert({ name: newLabelName.trim(), color, user_id: userId })
      .select()
    if (!error) {
      setLabels(prev => [...prev, data[0]])
      setSelectedLabels(prev => [...prev, data[0].id])
      setNewLabelName('')
      setShowLabelInput(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">New Task</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {error && <p className="form-error">{error}</p>}

        <div className="form-group">
          <label className="form-label">Title <span className="required">*</span></label>
          <input
            className="form-input"
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="What needs to be done?"
            autoFocus
          />
        </div>

        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea
            className="form-input form-textarea"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Add more details..."
            rows={3}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Priority</label>
            <select
              className="form-input form-select"
              value={priority}
              onChange={e => setPriority(e.target.value)}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Due Date</label>
            <input
              className="form-input"
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
            />
          </div>
        </div>

        {members.length > 0 && (
          <div className="form-group">
            <label className="form-label">Assignees</label>
            <div className="assignee-picker">
              {members.map(member => (
                <button
                  key={member.id}
                  className={`assignee-btn ${assignees.includes(member.id) ? 'selected' : ''}`}
                  onClick={() => toggleAssignee(member.id)}
                  style={{ '--member-color': member.color }}
                >
                  <div className="avatar avatar-sm" style={{ background: member.color }}>
                    {member.name.trim().split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  <span>{member.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Labels</label>
          <div className="label-picker">
            {labels.map(label => (
              <button
                key={label.id}
                className={`filter-chip ${selectedLabels.includes(label.id) ? 'active' : ''}`}
                style={{ '--label-color': label.color }}
                onClick={() => toggleLabel(label.id)}
              >
                <span className="filter-chip-dot" style={{ background: label.color }} />
                {label.name}
              </button>
            ))}
            {showLabelInput ? (
              <div className="label-create">
                <input
                  className="form-input label-input"
                  type="text"
                  placeholder="Label name"
                  value={newLabelName}
                  onChange={e => setNewLabelName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleCreateLabel()}
                  autoFocus
                />
                <button className="btn-primary" onClick={handleCreateLabel}>Add</button>
                <button className="btn-secondary" onClick={() => setShowLabelInput(false)}>✕</button>
              </div>
            ) : (
              <button className="filter-chip" onClick={() => setShowLabelInput(true)}>
                + New Label
              </button>
            )}
          </div>
        </div>

        <div className="form-actions">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Creating...' : 'Create Task'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default TaskForm
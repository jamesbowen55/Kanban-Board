import { useState } from 'react'
import supabase from '../supabaseClient'
import './TeamPanel.css'

const COLORS = [
  '#7c6af7', '#3b82f6', '#10b981', '#f59e0b',
  '#ef4444', '#8b5cf6', '#06b6d4', '#f97316'
]

function getInitials(name) {
  return name.trim().split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

function TeamPanel({ members, setMembers, onClose, userId }) {
  const [name, setName] = useState('')
  const [color, setColor] = useState(COLORS[0])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleAdd = async () => {
    if (!name.trim()) { setError('Name is required'); return }

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('members')
        .insert({ name: name.trim(), color, user_id: userId })
        .select()
      if (error) throw error
      setMembers(prev => [...prev, data[0]])
      setName('')
      setError(null)
    } catch (err) {
      setError('Failed to add member')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    const { error } = await supabase.from('members').delete().eq('id', id)
    if (!error) setMembers(prev => prev.filter(m => m.id !== id))
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Team Members</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="team-add">
          <input
            className="form-input"
            type="text"
            placeholder="Member name"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
          />
          <div className="color-picker">
            {COLORS.map(c => (
              <button
                key={c}
                className={`color-swatch ${color === c ? 'selected' : ''}`}
                style={{ background: c }}
                onClick={() => setColor(c)}
              />
            ))}
          </div>
          {error && <p className="form-error">{error}</p>}
          <button className="btn-primary" onClick={handleAdd} disabled={loading}>
            {loading ? 'Adding...' : 'Add Member'}
          </button>
        </div>

        <div className="team-list">
          {members.length === 0 && (
            <p className="team-empty">No team members yet</p>
          )}
          {members.map(member => (
            <div key={member.id} className="team-member">
              <div className="avatar" style={{ background: member.color }}>
                {getInitials(member.name)}
              </div>
              <span className="member-name">{member.name}</span>
              <button className="member-delete" onClick={() => handleDelete(member.id)}>✕</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default TeamPanel
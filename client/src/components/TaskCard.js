import { Draggable } from '@hello-pangea/dnd'
import './TaskCard.css'

const PRIORITY_CONFIG = {
  low:    { label: 'Low',    color: 'var(--low)' },
  medium: { label: 'Medium', color: 'var(--medium)' },
  high:   { label: 'High',   color: 'var(--high)' }
}

function TaskCard({ task, index, members, labels }) {
  const priority = PRIORITY_CONFIG[task.priority]

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`task-card ${snapshot.isDragging ? 'dragging' : ''}`}
          style={{ ...provided.draggableProps.style }}
        >
          <p className="task-title">{task.title}</p>

          {task.description && (
            <p className="task-description">{task.description}</p>
          )}

          {task.task_labels?.length > 0 && (
            <div className="task-labels">
              {task.task_labels.map(({ label_id }) => {
                const label = labels.find(l => l.id === label_id)
                if (!label) return null
                return (
                  <span
                    key={label_id}
                    className="task-label-chip"
                    style={{ '--label-color': label.color }}
                  >
                    {label.name}
                  </span>
                )
              })}
            </div>
          )}

          <div className="task-footer">
            {priority && (
              <span
                className="task-priority"
                style={{ color: priority.color, borderColor: priority.color }}
              >
                {priority.label}
              </span>
            )}
            {task.due_date && (
              <span className="task-due">
                {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            )}
          </div>

          {task.task_assignees?.length > 0 && (
            <div className="task-assignees">
              {task.task_assignees.map(({ member_id }) => {
                const member = members.find(m => m.id === member_id)
                if (!member) return null
                return (
                  <div
                    key={member_id}
                    className="avatar avatar-sm"
                    style={{ background: member.color }}
                    title={member.name}
                  >
                    {member.name.trim().split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </Draggable>
  )
}

export default TaskCard
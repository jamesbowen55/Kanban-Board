import { Droppable } from '@hello-pangea/dnd'
import TaskCard from './TaskCard'
import './Column.css'

const COLUMN_CONFIG = {
  todo:        { label: 'To Do',      color: 'var(--todo)' },
  in_progress: { label: 'In Progress', color: 'var(--in-progress)' },
  in_review:   { label: 'In Review',  color: 'var(--in-review)' },
  done:        { label: 'Done',       color: 'var(--done)' }
}

function Column({ status, tasks, members, labels }) {
  const config = COLUMN_CONFIG[status]

  return (
    <div className="column">
      <div className="column-header">
        <div className="column-title-row">
          <span className="column-dot" style={{ background: config.color }} />
          <span className="column-title">{config.label}</span>
          <span className="column-count">{tasks.length}</span>
        </div>
      </div>

      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`column-body ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
          >
            {tasks.map((task, index) => (
              <TaskCard key={task.id} task={task} index={index} members={members} labels={labels} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  )
}

export default Column
import { DragDropContext } from '@hello-pangea/dnd'
import Column from './Column'
import supabase from '../supabaseClient'
import './Board.css'

const COLUMNS = ['todo', 'in_progress', 'in_review', 'done']

function Board({ tasks, setTasks, members, labels }) {
  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result
    if (!destination) return
    if (destination.droppableId === source.droppableId) return

    setTasks(prev =>
      prev.map(task =>
        task.id === draggableId
          ? { ...task, status: destination.droppableId }
          : task
      )
    )

    const { error } = await supabase
      .from('tasks')
      .update({ status: destination.droppableId })
      .eq('id', draggableId)

    if (error) console.error('Update error:', error)
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="board">
        {COLUMNS.map(status => (
          <Column
            key={status}
            status={status}
            tasks={tasks.filter(task => task.status === status)}
            members={members}
            labels={labels}
          />
        ))}
      </div>
    </DragDropContext>
  )
}

export default Board

import { useState } from "react";
import { Checkbox } from "../ui/checkbox";
import { Button } from "../ui/button";
import { Todo } from "../../services/todoService";
import { useAppDispatch } from "../../store/hooks";
import { toggleTodoCompletion, deleteTodo } from "../../store/todoSlice";
import { formatDate } from "../../lib/utils";
import { Edit, Trash } from "lucide-react";
import { cn } from "../../lib/utils";

interface TodoItemProps {
  todo: Todo;
  onEdit: (todo: Todo) => void;
}

const TodoItem: React.FC<TodoItemProps> = ({ todo, onEdit }) => {
  const dispatch = useAppDispatch();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleToggleComplete = () => {
    dispatch(toggleTodoCompletion({ 
      id: todo._id, 
      completed: !todo.completed 
    }));
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await dispatch(deleteTodo(todo._id)).unwrap();
    } catch (error) {
      setIsDeleting(false);
    }
  };

  const getPriorityColor = () => {
    switch (todo.priority) {
      case "high":
        return "bg-red-100 border-l-4 border-red-500";
      case "medium":
        return "bg-amber-50 border-l-4 border-amber-500";
      case "low":
        return "bg-green-50 border-l-4 border-green-500";
      default:
        return "bg-gray-50 border-l-4 border-gray-300";
    }
  };

  return (
    <div 
      className={cn(
        "p-4 mb-3 rounded-md shadow-sm transition-all hover:shadow-md",
        getPriorityColor(),
        todo.completed ? "opacity-70" : "opacity-100"
      )}
    >
      <div className="flex items-start gap-3">
        <Checkbox 
          id={`todo-${todo._id}`} 
          checked={todo.completed} 
          onCheckedChange={handleToggleComplete}
          className="mt-1"
        />
        <div className="flex-grow">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <h3 
              className={cn(
                "text-md font-medium",
                todo.completed ? "line-through text-gray-500" : ""
              )}
            >
              {todo.title}
            </h3>
            <div className="flex items-center gap-2 self-end sm:self-auto">
              {todo.dueDate && (
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                  Due: {formatDate(todo.dueDate)}
                </span>
              )}
              <span 
                className={cn(
                  "text-xs px-2 py-1 rounded capitalize font-medium",
                  todo.priority === "high" ? "bg-red-100 text-red-700" :
                  todo.priority === "medium" ? "bg-amber-100 text-amber-700" :
                  "bg-green-100 text-green-700"
                )}
              >
                {todo.priority}
              </span>
            </div>
          </div>
          
          {todo.description && (
            <p className={cn(
              "mt-1 text-gray-600 text-sm",
              todo.completed ? "line-through text-gray-400" : ""
            )}>
              {todo.description}
            </p>
          )}
          
          <div className="mt-3 flex justify-end space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onEdit(todo)}
              className="h-8 px-2"
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={handleDelete}
              disabled={isDeleting}
              className="h-8 px-2"
            >
              <Trash className="h-4 w-4 mr-1" />
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodoItem;

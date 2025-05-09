
import { useState } from "react";
import { Dialog, DialogContent } from "../ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Button } from "../ui/button";
import TodoItem from "./TodoItem";
import TodoForm from "./TodoForm";
import { useAppSelector, useAppDispatch } from "../../store/hooks";
import { setFilter, setSortBy, updateTodo, createTodo } from "../../store/todoSlice";
import { Todo, UpdateTodoInput, CreateTodoInput } from "../../services/todoService";
import { Plus, Check, X } from "lucide-react";

const TodoList = () => {
  const dispatch = useAppDispatch();
  const { filteredTodos, filter, sortBy, loading } = useAppSelector((state) => state.todos);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentTodo, setCurrentTodo] = useState<Todo | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFilterChange = (value: "all" | "active" | "completed") => {
    dispatch(setFilter(value));
  };

  const handleSortByChange = (value: "createdAt" | "dueDate" | "priority") => {
    dispatch(setSortBy(value));
  };

  const handleCreateTodo = async (todoData: CreateTodoInput) => {
    setIsSubmitting(true);
    try {
      await dispatch(createTodo(todoData)).unwrap();
      setIsCreateDialogOpen(false);
    } catch (error) {
      // Error handled by thunk
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditTodo = async (todoData: UpdateTodoInput) => {
    if (!currentTodo) return;
    
    setIsSubmitting(true);
    try {
      await dispatch(updateTodo({ id: currentTodo._id, todoData })).unwrap();
      setIsEditDialogOpen(false);
    } catch (error) {
      // Error handled by thunk
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditDialog = (todo: Todo) => {
    setCurrentTodo(todo);
    setIsEditDialogOpen(true);
  };

  const renderEmptyState = () => (
    <div className="text-center p-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
      <div className="flex justify-center">
        <Check className="h-12 w-12 text-gray-400" />
      </div>
      <h3 className="mt-2 text-lg font-medium">No tasks found</h3>
      <p className="mt-1 text-gray-500">
        {filter === "all" 
          ? "Get started by creating a new task" 
          : filter === "active" 
            ? "No active tasks. All caught up!" 
            : "No completed tasks yet"}
      </p>
      <Button 
        className="mt-4" 
        size="sm" 
        onClick={() => setIsCreateDialogOpen(true)}
      >
        <Plus className="h-4 w-4 mr-1" /> New Task
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
        <div className="flex flex-col xs:flex-row gap-2 xs:items-center">
          <div className="flex items-center">
            <span className="text-sm mr-2">Filter:</span>
            <Select value={filter} onValueChange={handleFilterChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center">
            <span className="text-sm mr-2">Sort by:</span>
            <Select value={sortBy} onValueChange={handleSortByChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Newest</SelectItem>
                <SelectItem value="dueDate">Due Date</SelectItem>
                <SelectItem value="priority">Priority</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> New Task
        </Button>
      </div>

      {loading ? (
        <div className="space-y-2">
          <div className="h-14 bg-gray-100 rounded-md animate-pulse"></div>
          <div className="h-14 bg-gray-100 rounded-md animate-pulse"></div>
          <div className="h-14 bg-gray-100 rounded-md animate-pulse"></div>
        </div>
      ) : filteredTodos.length === 0 ? (
        renderEmptyState()
      ) : (
        <div className="space-y-1">
          {filteredTodos.map((todo) => (
            <TodoItem key={todo._id} todo={todo} onEdit={openEditDialog} />
          ))}
        </div>
      )}

      {/* Create Todo Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <TodoForm 
            onSubmit={handleCreateTodo} 
            isSubmitting={isSubmitting} 
            mode="create"
            onCancel={() => setIsCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Todo Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          {currentTodo && (
            <TodoForm 
              onSubmit={handleEditTodo} 
              initialData={currentTodo} 
              isSubmitting={isSubmitting} 
              mode="edit"
              onCancel={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TodoList;

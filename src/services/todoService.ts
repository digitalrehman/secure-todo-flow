
import api from "./api";
import { toast } from "../components/ui/use-toast";

// Define Todo interfaces
export interface Todo {
  _id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTodoInput {
  title: string;
  description?: string;
  priority?: "low" | "medium" | "high";
  dueDate?: string;
}

export interface UpdateTodoInput {
  title?: string;
  description?: string;
  completed?: boolean;
  priority?: "low" | "medium" | "high";
  dueDate?: string;
}

// Todo service
const todoService = {
  // Get all todos
  getAllTodos: async (): Promise<Todo[]> => {
    try {
      const response = await api.get<Todo[]>("/todos");
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to fetch todos";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
      throw error;
    }
  },

  // Get a specific todo
  getTodoById: async (id: string): Promise<Todo> => {
    try {
      const response = await api.get<Todo>(`/todos/${id}`);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to fetch todo";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
      throw error;
    }
  },

  // Create a new todo
  createTodo: async (todoData: CreateTodoInput): Promise<Todo> => {
    try {
      const response = await api.post<Todo>("/todos", todoData);
      toast({
        title: "Success",
        description: "Todo created successfully!",
      });
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to create todo";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
      throw error;
    }
  },

  // Update a todo
  updateTodo: async (id: string, todoData: UpdateTodoInput): Promise<Todo> => {
    try {
      const response = await api.put<Todo>(`/todos/${id}`, todoData);
      toast({
        title: "Success",
        description: "Todo updated successfully!",
      });
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to update todo";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
      throw error;
    }
  },

  // Toggle todo completion status
  toggleTodoCompletion: async (id: string, completed: boolean): Promise<Todo> => {
    try {
      const response = await api.patch<Todo>(`/todos/${id}/toggle`, { completed });
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to update todo status";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
      throw error;
    }
  },

  // Delete a todo
  deleteTodo: async (id: string): Promise<void> => {
    try {
      await api.delete(`/todos/${id}`);
      toast({
        title: "Success",
        description: "Todo deleted successfully!",
      });
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to delete todo";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
      throw error;
    }
  },
};

export default todoService;

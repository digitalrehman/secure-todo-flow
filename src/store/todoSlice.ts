
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import todoService, { 
  Todo, 
  CreateTodoInput, 
  UpdateTodoInput 
} from "../services/todoService";

interface TodoState {
  todos: Todo[];
  filteredTodos: Todo[];
  selectedTodo: Todo | null;
  loading: boolean;
  error: string | null;
  filter: "all" | "completed" | "active";
  sortBy: "dueDate" | "priority" | "createdAt";
}

const initialState: TodoState = {
  todos: [],
  filteredTodos: [],
  selectedTodo: null,
  loading: false,
  error: null,
  filter: "all",
  sortBy: "createdAt",
};

// Async thunks
export const fetchTodos = createAsyncThunk(
  "todos/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const todos = await todoService.getAllTodos();
      return todos;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch todos");
    }
  }
);

export const fetchTodoById = createAsyncThunk(
  "todos/fetchById",
  async (id: string, { rejectWithValue }) => {
    try {
      const todo = await todoService.getTodoById(id);
      return todo;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch todo");
    }
  }
);

export const createTodo = createAsyncThunk(
  "todos/create",
  async (todoData: CreateTodoInput, { rejectWithValue }) => {
    try {
      const todo = await todoService.createTodo(todoData);
      return todo;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to create todo");
    }
  }
);

export const updateTodo = createAsyncThunk(
  "todos/update",
  async ({ id, todoData }: { id: string; todoData: UpdateTodoInput }, { rejectWithValue }) => {
    try {
      const todo = await todoService.updateTodo(id, todoData);
      return todo;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to update todo");
    }
  }
);

export const toggleTodoCompletion = createAsyncThunk(
  "todos/toggleCompletion",
  async ({ id, completed }: { id: string; completed: boolean }, { rejectWithValue }) => {
    try {
      const todo = await todoService.toggleTodoCompletion(id, completed);
      return todo;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to toggle todo status");
    }
  }
);

export const deleteTodo = createAsyncThunk(
  "todos/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await todoService.deleteTodo(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete todo");
    }
  }
);

// Helper function to apply filters and sorting
const applyFiltersAndSorting = (
  todos: Todo[], 
  filter: "all" | "completed" | "active",
  sortBy: "dueDate" | "priority" | "createdAt"
): Todo[] => {
  // First apply filtering
  let filteredResults = [...todos];
  if (filter === "completed") {
    filteredResults = filteredResults.filter(todo => todo.completed);
  } else if (filter === "active") {
    filteredResults = filteredResults.filter(todo => !todo.completed);
  }
  
  // Then apply sorting
  return filteredResults.sort((a, b) => {
    if (sortBy === "dueDate") {
      // Handle todos without due dates
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    } 
    else if (sortBy === "priority") {
      // Convert priority to numeric value for comparison
      const priorityValue = {
        high: 3,
        medium: 2,
        low: 1
      };
      return priorityValue[b.priority] - priorityValue[a.priority]; // Higher priority first
    }
    // Default sort by creation date (newest first)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
};

// Todo slice
const todoSlice = createSlice({
  name: "todos",
  initialState,
  reducers: {
    setFilter: (state, action: PayloadAction<"all" | "completed" | "active">) => {
      state.filter = action.payload;
      state.filteredTodos = applyFiltersAndSorting(state.todos, action.payload, state.sortBy);
    },
    setSortBy: (state, action: PayloadAction<"dueDate" | "priority" | "createdAt">) => {
      state.sortBy = action.payload;
      state.filteredTodos = applyFiltersAndSorting(state.todos, state.filter, action.payload);
    },
    resetTodoError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all todos cases
      .addCase(fetchTodos.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTodos.fulfilled, (state, action: PayloadAction<Todo[]>) => {
        state.loading = false;
        state.todos = action.payload;
        state.filteredTodos = applyFiltersAndSorting(
          action.payload, 
          state.filter, 
          state.sortBy
        );
      })
      .addCase(fetchTodos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch todo by ID cases
      .addCase(fetchTodoById.fulfilled, (state, action: PayloadAction<Todo>) => {
        state.selectedTodo = action.payload;
      })
      // Create todo cases
      .addCase(createTodo.fulfilled, (state, action: PayloadAction<Todo>) => {
        state.todos.push(action.payload);
        state.filteredTodos = applyFiltersAndSorting(
          state.todos, 
          state.filter, 
          state.sortBy
        );
      })
      // Update todo cases
      .addCase(updateTodo.fulfilled, (state, action: PayloadAction<Todo>) => {
        const index = state.todos.findIndex(todo => todo._id === action.payload._id);
        if (index !== -1) {
          state.todos[index] = action.payload;
        }
        state.filteredTodos = applyFiltersAndSorting(
          state.todos, 
          state.filter, 
          state.sortBy
        );
        if (state.selectedTodo && state.selectedTodo._id === action.payload._id) {
          state.selectedTodo = action.payload;
        }
      })
      // Toggle todo completion cases
      .addCase(toggleTodoCompletion.fulfilled, (state, action: PayloadAction<Todo>) => {
        const index = state.todos.findIndex(todo => todo._id === action.payload._id);
        if (index !== -1) {
          state.todos[index] = action.payload;
        }
        state.filteredTodos = applyFiltersAndSorting(
          state.todos, 
          state.filter, 
          state.sortBy
        );
      })
      // Delete todo cases
      .addCase(deleteTodo.fulfilled, (state, action: PayloadAction<string>) => {
        state.todos = state.todos.filter(todo => todo._id !== action.payload);
        state.filteredTodos = applyFiltersAndSorting(
          state.todos, 
          state.filter, 
          state.sortBy
        );
        if (state.selectedTodo && state.selectedTodo._id === action.payload) {
          state.selectedTodo = null;
        }
      });
  },
});

export const { setFilter, setSortBy, resetTodoError } = todoSlice.actions;
export default todoSlice.reducer;


import { useEffect } from "react";
import { useAppDispatch } from "../store/hooks";
import { fetchTodos } from "../store/todoSlice";
import { fetchCurrentUser } from "../store/authSlice";
import Layout from "../components/layout/Layout";
import TodoList from "../components/todos/TodoList";
import RequireAuth from "../components/auth/RequireAuth";

const TodosPage = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchTodos());
    dispatch(fetchCurrentUser()); // Ensure we have current user data
  }, [dispatch]);

  return (
    <RequireAuth>
      <Layout>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">My Tasks</h1>
          <TodoList />
        </div>
      </Layout>
    </RequireAuth>
  );
};

export default TodosPage;

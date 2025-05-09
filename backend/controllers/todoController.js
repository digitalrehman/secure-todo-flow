
const Todo = require('../models/Todo');
const asyncHandler = require('express-async-handler');

// @desc    Get all todos for a user
// @route   GET /api/todos
// @access  Private
exports.getTodos = asyncHandler(async (req, res) => {
  const todos = await Todo.find({ user: req.user.id }).sort({ createdAt: -1 });
  res.json(todos);
});

// @desc    Create a new todo
// @route   POST /api/todos
// @access  Private
exports.createTodo = asyncHandler(async (req, res) => {
  const { title, description, priority, dueDate } = req.body;

  if (!title) {
    res.status(400);
    throw new Error('Title is required');
  }

  const todo = await Todo.create({
    title,
    description,
    priority,
    dueDate,
    user: req.user.id
  });

  res.status(201).json(todo);
});

// @desc    Get todo by ID
// @route   GET /api/todos/:id
// @access  Private
exports.getTodoById = asyncHandler(async (req, res) => {
  const todo = await Todo.findById(req.params.id);

  if (!todo) {
    res.status(404);
    throw new Error('Todo not found');
  }

  // Check if todo belongs to user
  if (todo.user.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to access this todo');
  }

  res.json(todo);
});

// @desc    Update a todo
// @route   PUT /api/todos/:id
// @access  Private
exports.updateTodo = asyncHandler(async (req, res) => {
  const { title, description, completed, priority, dueDate } = req.body;
  
  const todo = await Todo.findById(req.params.id);

  if (!todo) {
    res.status(404);
    throw new Error('Todo not found');
  }

  // Check if todo belongs to user
  if (todo.user.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to update this todo');
  }

  todo.title = title || todo.title;
  todo.description = description !== undefined ? description : todo.description;
  todo.completed = completed !== undefined ? completed : todo.completed;
  todo.priority = priority || todo.priority;
  todo.dueDate = dueDate || todo.dueDate;

  const updatedTodo = await todo.save();
  
  res.json(updatedTodo);
});

// @desc    Toggle todo completion status
// @route   PATCH /api/todos/:id/toggle
// @access  Private
exports.toggleTodoCompletion = asyncHandler(async (req, res) => {
  const todo = await Todo.findById(req.params.id);

  if (!todo) {
    res.status(404);
    throw new Error('Todo not found');
  }

  // Check if todo belongs to user
  if (todo.user.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to update this todo');
  }

  // Toggle the completed status
  todo.completed = !todo.completed;
  
  const updatedTodo = await todo.save();
  
  res.json(updatedTodo);
});

// @desc    Delete a todo
// @route   DELETE /api/todos/:id
// @access  Private
exports.deleteTodo = asyncHandler(async (req, res) => {
  const todo = await Todo.findById(req.params.id);

  if (!todo) {
    res.status(404);
    throw new Error('Todo not found');
  }

  // Check if todo belongs to user
  if (todo.user.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to delete this todo');
  }

  await todo.deleteOne();
  
  res.json({ message: 'Todo removed' });
});

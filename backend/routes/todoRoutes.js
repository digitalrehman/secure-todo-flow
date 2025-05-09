
const express = require('express');
const router = express.Router();
const { 
  getTodos, 
  createTodo, 
  getTodoById, 
  updateTodo, 
  deleteTodo,
  toggleTodoCompletion
} = require('../controllers/todoController');
const { protect } = require('../middleware/authMiddleware');

// Apply auth middleware to all routes
router.use(protect);

router.route('/')
  .get(getTodos)
  .post(createTodo);

router.route('/:id')
  .get(getTodoById)
  .put(updateTodo)
  .delete(deleteTodo);

router.route('/:id/toggle')
  .patch(toggleTodoCompletion);

module.exports = router;

const express = require('express');
const router = express.Router();
const lessonController = require('../controllers/lesson.controller');
const { verifyToken, checkRole } = require('../middlewares/auth.middleware');

// Public: Xem danh sách bài học theo khóa học
router.get('/course/:courseId', lessonController.getLessonsByCourse);

// Private: Quản lý bài học (Giảng viên & Admin)
router.post('/', verifyToken, checkRole(['Teacher', 'Admin']), lessonController.createLesson);
router.put('/:id', verifyToken, checkRole(['Teacher', 'Admin']), lessonController.updateLesson);
router.delete('/:id', verifyToken, checkRole(['Teacher', 'Admin']), lessonController.deleteLesson);

module.exports = router;
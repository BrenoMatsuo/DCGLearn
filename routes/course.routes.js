const express = require('express');
const router = express.Router();
const courseController = require('../controllers/course.controller');

// Định nghĩa đường dẫn lấy tất cả khóa học
router.get('/all', courseController.getAllCourses);

module.exports = router;
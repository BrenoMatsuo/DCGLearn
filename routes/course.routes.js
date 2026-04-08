const express = require('express');
const router = express.Router();
const courseController = require('../controllers/course.controller');
// Route cũ: router.get('/all', courseController.getAllCourses);
// Thêm route mới này (Cần verifyToken để biết "tôi" là ai)
const { verifyToken } = require('../middlewares/auth.middleware');

// Lấy danh sách khóa học cá nhân (Đã có sẵn verifyToken)
router.get('/my-courses', verifyToken, courseController.getMyCourses);

// Lấy danh sách tất cả khóa học cho Dashboard
router.get('/all', courseController.getAllCourses);

router.get('/:id', courseController.getCourseById); 
router.put('/:id', verifyToken, courseController.updateCourse); 
router.delete('/:id', verifyToken, courseController.deleteCourse);
// CẬP NHẬT: Thêm verifyToken vào route tạo khóa học
// Điều này giúp Backend tự động lấy userId và name từ Token để lưu vào file dữ liệu
router.post('/', verifyToken, courseController.createCourse);

module.exports = router;
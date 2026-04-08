const fs = require('fs');
const path = require('path');

const coursesPath = path.join(__dirname, '../data/courses.json');

// Lấy tất cả khóa học
exports.getAllCourses = (req, res) => {
    try {
        const data = fs.readFileSync(coursesPath, 'utf-8');
        const db = JSON.parse(data);
        res.json(db.courses || []);
    } catch (error) {
        res.status(500).json({ message: "Lỗi lấy danh sách khóa học" });
    }
};

// Lấy 1 khóa học theo ID (CẦN THIÊM ĐỂ KHÔNG LỖI ROUTES)
exports.getCourseById = (req, res) => {
    try {
        const data = fs.readFileSync(coursesPath, 'utf-8');
        const db = JSON.parse(data);
        const course = db.courses.find(c => c.id == req.params.id);
        if (!course) return res.status(404).json({ message: "Không tìm thấy khóa học" });
        res.json(course);
    } catch (error) {
        res.status(500).json({ message: "Lỗi lấy dữ liệu" });
    }
};

// Tạo khóa học mới
exports.createCourse = (req, res) => {
    try {
        const { title, code, description, grade, tags, image } = req.body;
        if (!title || !code) return res.status(400).json({ message: "Thiếu tên hoặc mã khóa học" });

        const data = fs.readFileSync(coursesPath, 'utf-8');
        const db = JSON.parse(data);
        if (!db.courses) db.courses = [];

        const newCourse = {
            id: Date.now(),
            title,
            code,
            instructor: req.user.name || "Giảng viên",
            description,
            grade,
            tags: tags || [],
            image: image || ""
        };

        db.courses.push(newCourse);
        fs.writeFileSync(coursesPath, JSON.stringify(db, null, 2), 'utf-8');
        res.status(201).json({ message: "Tạo thành công!", course: newCourse });
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi lưu khóa học" });
    }
};

// Cập nhật khóa học
exports.updateCourse = (req, res) => {
    try {
        const id = req.params.id;
        const data = fs.readFileSync(coursesPath, 'utf-8');
        let db = JSON.parse(data);
        const index = db.courses.findIndex(c => c.id == id);

        if (index === -1) return res.status(404).json({ message: "Không thấy khóa học" });

        // Kiểm tra quyền (nếu cần)
        if (db.courses[index].instructor !== req.user.name) {
            return res.status(403).json({ message: "Bạn không có quyền sửa" });
        }

        db.courses[index] = { ...db.courses[index], ...req.body, id: Number(id) };
        fs.writeFileSync(coursesPath, JSON.stringify(db, null, 2));
        res.json({ message: "Cập nhật thành công" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi cập nhật" });
    }
};

// Xóa khóa học (CẦN THIÊM ĐỂ KHÔNG LỖI ROUTES)
exports.deleteCourse = (req, res) => {
    try {
        const id = req.params.id;
        const data = fs.readFileSync(coursesPath, 'utf-8');
        let db = JSON.parse(data);
        db.courses = db.courses.filter(c => c.id != id);
        fs.writeFileSync(coursesPath, JSON.stringify(db, null, 2));
        res.json({ message: "Xóa thành công" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi xóa" });
    }
};

// Thêm vào controllers/course.controller.js

// Lấy danh sách khóa học của RIÊNG tôi (Giảng viên đang đăng nhập)
exports.getMyCourses = (req, res) => {
    try {
        const data = fs.readFileSync(coursesPath, 'utf-8');
        const db = JSON.parse(data);
        
        // Lọc các khóa học có instructor hoặc userId khớp với người dùng hiện tại
        // req.user được lấy từ verifyToken middleware
        const myCourses = db.courses.filter(c => 
            c.instructor === req.user.name || c.userId === req.user.userId
        );
        
        res.json(myCourses);
    } catch (error) {
        console.error("Lỗi lấy khóa học cá nhân:", error);
        res.status(500).json({ message: "Không thể lấy danh sách khóa học của bạn" });
    }
};
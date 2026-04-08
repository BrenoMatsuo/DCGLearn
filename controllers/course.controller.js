const fs = require('fs');
const path = require('path');

const coursesPath = path.join(__dirname, '../data/courses.json');

// Lấy tất cả khóa học (Dùng cho Dashboard)
exports.getAllCourses = (req, res) => {
    try {
        const data = fs.readFileSync(coursesPath, 'utf-8');
        const db = JSON.parse(data);
        res.json(db.courses || []);
    } catch (error) {
        res.status(500).json({ message: "Lỗi lấy danh sách khóa học" });
    }
};

// Tạo khóa học mới
exports.createCourse = (req, res) => {
    try {
        const { title, code, description, grade, tags, image } = req.body;

        if (!title || !code) {
            return res.status(400).json({ message: "Thiếu tên hoặc mã khóa học" });
        }

        const data = fs.readFileSync(coursesPath, 'utf-8');
        const db = JSON.parse(data);

        if (!db.courses) db.courses = [];

        // QUAN TRỌNG: Đồng nhất dữ liệu bằng cách lấy userId từ Token (req.user)
        const newCourse = {
            id: Date.now(),
            title,
            code,
            userId: req.user.userId, // Lưu ID người tạo để lọc chính xác
            instructor: req.user.name || "Giảng viên ẩn danh", // Lấy tên chuẩn từ Token
            description,
            grade,
            tags: Array.isArray(tags) ? tags : [],
            image: image || "https://via.placeholder.com/300x150"
        };

        db.courses.push(newCourse);
        fs.writeFileSync(coursesPath, JSON.stringify(db, null, 2), 'utf-8');

        res.status(201).json({
            message: "Tạo khóa học thành công!",
            course: newCourse
        });
    } catch (error) {
        console.error("Lỗi khi lưu khóa học:", error);
        res.status(500).json({ message: "Không thể lưu dữ liệu khóa học" });
    }
};

// Lấy danh sách khóa học cá nhân (Dùng cho Manage Courses)
exports.getMyCourses = (req, res) => {
    try {
        const data = fs.readFileSync(coursesPath, 'utf-8');
        const db = JSON.parse(data);
        
        // ĐỒNG BỘ: Lọc theo userId từ Token để đảm bảo không bị sai lệch tên
        const myCourses = (db.courses || []).filter(c => c.userId === req.user.userId);
        
        res.json(myCourses);
    } catch (error) {
        res.status(500).json({ message: "Lỗi lấy danh sách khóa học cá nhân" });
    }
};

// Lấy thông tin 1 khóa học theo ID
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

// Cập nhật khóa học (Chỉ chủ sở hữu mới được sửa)
exports.updateCourse = (req, res) => {
    try {
        const id = req.params.id;
        const { title, code, description, grade, image } = req.body;
        const data = fs.readFileSync(coursesPath, 'utf-8');
        let db = JSON.parse(data);

        const index = db.courses.findIndex(c => c.id == id);
        if (index === -1) return res.status(404).json({ message: "Không tìm thấy khóa học" });

        // KIỂM TRA QUYỀN: instructor trong file phải khớp với tên user trong Token
        if (db.courses[index].instructor !== req.user.name) {
            return res.status(403).json({ message: "Bạn không có quyền sửa khóa học này" });
        }

        // Cập nhật dữ liệu mới
        db.courses[index] = { ...db.courses[index], title, code, description, grade, image };
        
        fs.writeFileSync(coursesPath, JSON.stringify(db, null, 2));
        res.json({ message: "Cập nhật thành công!", course: db.courses[index] });
    } catch (error) {
        res.status(500).json({ message: "Lỗi cập nhật" });
    }
};
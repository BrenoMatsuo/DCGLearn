const db = require('../data/database'); // File kết nối Postgres mới

exports.getAllCourses = async (req, res) => {
    try {
        // JOIN với bảng User để lấy tên Giảng viên hiển thị ra Frontend
        const sql = `
            SELECT c.*, u.name as instructor
            FROM "Course" c
            JOIN "User" u ON c.instructor_id = u.user_id
            ORDER BY c.course_id DESC
        `;
        const result = await db.query(sql);
        
        // Trả về dữ liệu cho Frontend
        res.json({ courses: result.rows });
    } catch (error) {
        console.error("Lỗi Postgres:", error);
        res.status(500).json({ message: "Lỗi lấy danh sách khóa học từ Database" });
    }
};

exports.getCourseById = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM "Course" WHERE course_id = $1', [parseInt(req.params.id)]);
        const course = result.rows[0];
        
        if (!course) return res.status(404).json({ message: "Không tìm thấy khóa học" });
        res.json(course);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi hệ thống" });
    }
};

exports.createCourse = async (req, res) => {
    try {
        const { title, description } = req.body;
        const instructorId = req.user.userId; // Lấy từ Token JWT

        const sql = 'INSERT INTO "Course" (title, description, instructor_id) VALUES ($1, $2, $3) RETURNING *';
        const result = await db.query(sql, [title, description, instructorId]);

        res.status(201).json({ message: "Tạo khóa học thành công", course: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi khi tạo khóa học" });
    }
};

exports.updateCourse = async (req, res) => {
    try {
        const { title, description } = req.body;
        const courseId = parseInt(req.params.id);
        const instructorId = req.user.userId;

        // KIỂM TRA QUYỀN SỞ HỮU (Chủ khóa học hoặc Admin)
        const checkSql = 'SELECT instructor_id FROM "Course" WHERE course_id = $1';
        const checkResult = await db.query(checkSql, [courseId]);
        
        if (checkResult.rows.length === 0) return res.status(404).json({ message: "Không tìm thấy khóa học" });

        if (req.user.role !== 'Admin' && checkResult.rows[0].instructor_id !== instructorId) {
            return res.status(403).json({ message: "Bạn không có quyền chỉnh sửa khóa học của người khác!" });
        }

        const sql = 'UPDATE "Course" SET title = $1, description = $2 WHERE course_id = $3 RETURNING *';
        const result = await db.query(sql, [title, description, courseId]);

        res.json({ message: "Cập nhật thành công", course: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi khi cập nhật" });
    }
};

exports.deleteCourse = async (req, res) => {
    try {
        const courseId = parseInt(req.params.id);
        const instructorId = req.user.userId;

        // KIỂM TRA QUYỀN
        const checkSql = 'SELECT instructor_id FROM "Course" WHERE course_id = $1';
        const checkResult = await db.query(checkSql, [courseId]);
        
        if (checkResult.rows.length === 0) return res.status(404).json({ message: "Không tìm thấy khóa học" });

        if (req.user.role !== 'Admin' && checkResult.rows[0].instructor_id !== instructorId) {
            return res.status(403).json({ message: "Bạn không có quyền xóa khóa học của người khác!" });
        }

        await db.query('DELETE FROM "Course" WHERE course_id = $1', [courseId]);
        res.json({ message: "Xóa khóa học thành công" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi khi xóa" });
    }
};
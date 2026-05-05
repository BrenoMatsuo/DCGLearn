const db = require('../data/database');

// 1. Lấy tất cả bài học của một khóa học cụ thể
exports.getLessonsByCourse = async (req, res) => {
    try {
        const { courseId } = req.params;
        // Sử dụng ORDER BY order_index để đảm bảo thứ tự bài học luôn đúng
        const sql = 'SELECT * FROM "Lesson" WHERE course_id = $1 ORDER BY order_index ASC';
        const result = await db.query(sql, [courseId]);
        
        res.json({ lessons: result.rows });
    } catch (error) {
        console.error("Lỗi lấy bài học:", error);
        res.status(500).json({ message: "Lỗi lấy danh sách bài học từ Database." });
    }
};

// 2. Thêm bài học mới (Giảng viên/Admin)
exports.createLesson = async (req, res) => {
    try {
        const { courseId, title, description, content_type, content_text, content_url, order_index } = req.body;

        const sql = `
            INSERT INTO "Lesson" (course_id, title, description, content_type, content_text, content_url, order_index)
            VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
        `;
        const result = await db.query(sql, [
            courseId, title, description, content_type, content_text, content_url, order_index
        ]);

        res.status(201).json({ message: "Thêm bài học thành công!", lesson: result.rows[0] });
    } catch (error) {
        console.error("Lỗi tạo bài học:", error);
        res.status(500).json({ message: "Lỗi khi tạo bài học mới." });
    }
};

// 3. Cập nhật bài học
exports.updateLesson = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, content_type, content_text, content_url, order_index } = req.body;

        const sql = `
            UPDATE "Lesson" 
            SET title = $1, description = $2, content_type = $3, content_text = $4, content_url = $5, order_index = $6
            WHERE lesson_id = $7 RETURNING *
        `;
        const result = await db.query(sql, [
            title, description, content_type, content_text, content_url, order_index, id
        ]);

        if (result.rows.length === 0) return res.status(404).json({ message: "Không tìm thấy bài học để cập nhật." });

        res.json({ message: "Cập nhật bài học thành công!", lesson: result.rows[0] });
    } catch (error) {
        console.error("Lỗi cập nhật bài học:", error);
        res.status(500).json({ message: "Lỗi khi cập nhật bài học." });
    }
};

// 4. Xóa bài học
exports.deleteLesson = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query('DELETE FROM "Lesson" WHERE lesson_id = $1', [id]);
        
        if (result.rowCount === 0) return res.status(404).json({ message: "Không tìm thấy bài học để xóa." });

        res.json({ message: "Xóa bài học thành công!" });
    } catch (error) {
        console.error("Lỗi xóa bài học:", error);
        res.status(500).json({ message: "Lỗi khi xóa bài học." });
    }
};
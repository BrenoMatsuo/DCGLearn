const db = require('../data/database');

// 1. Lấy tất cả bài tập (Danh sách tổng quát)
exports.getAllAssessments = async (req, res) => {
    try {
        const sql = 'SELECT * FROM "Assessment" ORDER BY created_at DESC';
        const result = await db.query(sql);
        res.json(result.rows);
    } catch (error) {
        console.error("Lỗi lấy danh sách bài thi:", error);
        res.status(500).json({ message: "Lỗi lấy danh sách bài thi từ Database." });
    }
};

// 2. Lấy CHI TIẾT bài tập kèm CÂU HỎI ĐÃ XÁO TRỘN (Dành cho học sinh làm bài)
exports.getAssessmentDetails = async (req, res) => {
    try {
        const { id } = req.params;

        // Lấy thông tin chung của bài thi
        const assessmentResult = await db.query('SELECT * FROM "Assessment" WHERE assessment_id = $1', [id]);
        if (assessmentResult.rows.length === 0) return res.status(404).json({ message: "Không tìm thấy bài thi." });

        const assessment = assessmentResult.rows[0];

        // Lấy danh sách câu hỏi ĐÃ XÁO TRỘN NGẪU NHIÊN
        const questionsSql = 'SELECT * FROM "Question" WHERE assessment_id = $1 ORDER BY RANDOM()';
        const questionsResult = await db.query(questionsSql, [id]);
        const questions = questionsResult.rows;

        // Với mỗi câu hỏi, lấy danh sách các lựa chọn (cũng xáo trộn luôn)
        for (let q of questions) {
            const optionsSql = 'SELECT option_id, option_text FROM "Option" WHERE question_id = $1 ORDER BY RANDOM()';
            const optionsResult = await db.query(optionsSql, [q.question_id]);
            q.options = optionsResult.rows;
        }

        res.json({ ...assessment, questions });
    } catch (error) {
        console.error("Lỗi lấy chi tiết đề thi:", error);
        res.status(500).json({ message: "Lỗi hệ thống khi tải đề thi." });
    }
};

// 3. Giáo viên tạo bài tập mới
exports.createAssessment = async (req, res) => {
    const client = await db.getClient();
    try {
        const { courseId, title, description, timeLimit, questions } = req.body;

        // Bắt đầu một Transaction trên kết nối riêng
        await client.query('BEGIN');

        // A. Lưu thông tin bài tập
        const assessmentSql = `
            INSERT INTO "Assessment" (course_id, title, description, time_limit, created_at)
            VALUES ($1, $2, $3, $4, CURRENT_DATE) RETURNING assessment_id
        `;
        const assessmentRes = await client.query(assessmentSql, [courseId, title, description, timeLimit]);
        const assessmentId = assessmentRes.rows[0].assessment_id;

        // B. Lưu từng câu hỏi và lựa chọn
        for (let q of questions) {
            const questionSql = `
                INSERT INTO "Question" (assessment_id, question_text, question_type)
                VALUES ($1, $2, $3) RETURNING question_id
            `;
            const questionRes = await client.query(questionSql, [assessmentId, q.text, q.type]);
            const questionId = questionRes.rows[0].question_id;

            for (let opt of q.options) {
                const optionSql = `
                    INSERT INTO "Option" (question_id, option_text, is_correct)
                    VALUES ($1, $2, $3)
                `;
                await client.query(optionSql, [questionId, opt.text, opt.isCorrect]);
            }
        }

        await client.query('COMMIT');
        res.status(201).json({ message: "Tạo bài thi thành công!", assessmentId });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Lỗi tạo bài thi:", error);
        res.status(500).json({ message: "Lỗi hệ thống khi tạo bài thi." });
    } finally {
        // Trả kết nối về cho Pool
        client.release();
    }
};

// 4. Xem thống kê (Dành cho Giảng viên)
...
    }
};

// 5. Cập nhật thông tin bài thi (Chỉ sửa thông tin chung)
exports.updateAssessment = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, timeLimit } = req.body;

        const sql = `
            UPDATE "Assessment" 
            SET title = $1, description = $2, time_limit = $3 
            WHERE assessment_id = $4 RETURNING *
        `;
        const result = await db.query(sql, [title, description, timeLimit, id]);

        if (result.rows.length === 0) return res.status(404).json({ message: "Không tìm thấy bài thi." });

        res.json({ message: "Cập nhật bài thi thành công!", assessment: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi khi cập nhật bài thi." });
    }
};

// 6. Xóa bài thi (Xóa sạch toàn bộ dữ liệu liên quan)
exports.deleteAssessment = async (req, res) => {
    const client = await db.getClient();
    try {
        const { id } = req.params;

        await client.query('BEGIN');

        // A. Xóa chi tiết câu trả lời của học sinh trước
        await client.query(`
            DELETE FROM "SubmissionAnswer" 
            WHERE submission_id IN (SELECT submission_id FROM "Submission" WHERE assessment_id = $1)
        `, [id]);

        // B. Xóa các bài nộp
        await client.query('DELETE FROM "Submission" WHERE assessment_id = $1', [id]);

        // C. Xóa các Options (Đáp án)
        await client.query(`
            DELETE FROM "Option" 
            WHERE question_id IN (SELECT question_id FROM "Question" WHERE assignment_id = $1)
        `, [id]);

        // D. Xóa các Questions (Câu hỏi)
        await client.query('DELETE FROM "Question" WHERE assignment_id = $1', [id]);

        // E. Cuối cùng xóa bài thi
        const result = await client.query('DELETE FROM "Assessment" WHERE assessment_id = $1', [id]);

        if (result.rowCount === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: "Không tìm thấy bài thi để xóa." });
        }

        await client.query('COMMIT');
        res.json({ message: "Đã xóa bài thi và toàn bộ dữ liệu liên quan thành công!" });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Lỗi xóa bài thi:", error);
        res.status(500).json({ message: "Lỗi hệ thống khi xóa bài thi." });
    } finally {
        client.release();
    }
};
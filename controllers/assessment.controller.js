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
exports.getStatsByAssessment = async (req, res) => {
    try {
        const { id } = req.params;

        const sql = `
            SELECT s.*, u.name as student_name
            FROM "Submission" s
            JOIN "User" u ON s.student_id = u.user_id
            WHERE s.assessment_id = $1
            ORDER BY s.submitted_at DESC
        `;
        const result = await db.query(sql, [id]);

        res.json({
            submissions: result.rows.map(s => ({
                name: s.student_name,
                time: s.submitted_at,
                score: s.score,
                status: "Hoàn thành"
            }))
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi khi lấy thống kê." });
    }
};
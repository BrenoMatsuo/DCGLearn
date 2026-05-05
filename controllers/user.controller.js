const db = require('../data/database');
const bcrypt = require('bcryptjs');

// 1. Lấy thông tin cá nhân của người dùng hiện tại
exports.getProfile = async (req, res) => {
    try {
        const userId = req.user.userId;
        const sql = `
            SELECT u.user_id, u.name, u.email, u.created_at, r.name as role_name
            FROM "User" u
            JOIN "Role" r ON u.role_id = r.role_id
            WHERE u.user_id = $1
        `;
        const result = await db.query(sql, [userId]);
        const user = result.rows[0];

        if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng." });

        res.json({
            message: 'Lấy thông tin cá nhân thành công',
            user: {
                id: user.user_id,
                name: user.name,
                email: user.email,
                role: user.role_name
            }
        });
    } catch (error) {
        console.error("Lỗi lấy thông tin cá nhân:", error);
        res.status(500).json({ message: "Lỗi hệ thống khi lấy thông tin." });
    }
};

// 2. Lấy danh sách toàn bộ người dùng (Dành cho Admin)
exports.getAllUsers = async (req, res) => {
    try {
        const sql = `
            SELECT u.user_id, u.name, u.email, r.name as role_name
            FROM "User" u
            JOIN "Role" r ON u.role_id = r.role_id
            ORDER BY u.user_id ASC
        `;
        const result = await db.query(sql);

        res.json({
            message: 'Danh sách người dùng hệ thống',
            users: result.rows.map(u => ({
                id: u.user_id,
                name: u.name,
                email: u.email,
                role: u.role_name
            }))
        });
    } catch (error) {
        console.error("Lỗi lấy danh sách người dùng:", error);
        res.status(500).json({ message: "Lỗi hệ thống." });
    }
};

// 3. Thay đổi vai trò người dùng (Admin)
exports.updateUserRole = async (req, res) => {
    try {
        const { userId } = req.params;
        const { role } = req.body; // role truyền vào là tên: 'Teacher', 'Student'

        // A. Lấy role_id từ tên role
        const roleResult = await db.query('SELECT role_id FROM "Role" WHERE name = $1', [role]);
        if (roleResult.rows.length === 0) return res.status(400).json({ message: "Vai trò không hợp lệ." });
        const roleId = roleResult.rows[0].role_id;

        // B. Cập nhật vào bảng User
        const sql = 'UPDATE "User" SET role_id = $1 WHERE user_id = $2 RETURNING *';
        const result = await db.query(sql, [roleId, userId]);

        if (result.rows.length === 0) return res.status(404).json({ message: "Không tìm thấy người dùng." });

        res.json({ message: "Cập nhật vai trò thành công!", user: { id: userId, role } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi hệ thống khi cập nhật vai trò." });
    }
};

// 4. Đặt lại mật khẩu (Admin)
exports.resetPassword = async (req, res) => {
    try {
        const { userId } = req.params;
        const { newPassword } = req.body;

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const sql = 'UPDATE "User" SET password_hash = $1 WHERE user_id = $2';
        const result = await db.query(sql, [hashedPassword, userId]);

        if (result.rowCount === 0) return res.status(404).json({ message: "Không tìm thấy người dùng." });

        res.json({ message: "Đặt lại mật khẩu thành công!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi khi đặt lại mật khẩu." });
    }
};

// 5. Xóa người dùng (Admin)
exports.deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const result = await db.query('DELETE FROM "User" WHERE user_id = $1', [userId]);

        if (result.rowCount === 0) return res.status(404).json({ message: "Không tìm thấy người dùng." });

        res.json({ message: "Đã xóa người dùng khỏi hệ thống." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi khi xóa người dùng (Có thể người dùng này đang có dữ liệu liên quan)." });
    }
};
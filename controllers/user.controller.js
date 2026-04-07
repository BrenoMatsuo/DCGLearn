const { readData } = require('../data/db'); // Chỉ cần hàm đọc

exports.getProfile = (req, res) => {
    // 1. Đọc dữ liệu từ file
    const db = readData();
    
    // 2. Tìm user đang đăng nhập
    const user = db.users.find(u => u.id === req.user.userId);
    
    if (!user) {
        return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    res.json({
        message: 'Lấy thông tin cá nhân thành công',
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        }
    });
};

exports.getAllUsers = (req, res) => {
    const db = readData();
    
    // Lọc bỏ mật khẩu trước khi gửi về cho an toàn
    const safeUsers = db.users.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role
    }));

    res.json({
        message: 'Danh sách người dùng hệ thống',
        users: safeUsers
    });
};
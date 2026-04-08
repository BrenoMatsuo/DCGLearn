const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { readData, writeData } = require('../data/db'); // Gọi công cụ đọc/ghi

exports.register = async (req, res) => {
    try {
        const { name, email, role, password } = req.body;

        if (!name || !email || !role || !password) {
            return res.status(400).json({ message: 'Vui lòng điền đầy đủ tất cả các trường!' });
        }

        // 1. Đọc dữ liệu từ file JSON
        const db = readData();

        // 2. Kiểm tra email trùng
        const existingUser = db.users.find(u => u.email === email);
        if (existingUser) {
            return res.status(400).json({ message: 'Email này đã được đăng ký!' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = {
            id: Date.now(),
            name,
            email,
            role: role.trim(),
            password: hashedPassword
        };

        // 3. Thêm user mới vào mảng và Ghi lại vào file JSON
        db.users.push(newUser);
        writeData(db);

        res.status(201).json({ message: 'Đăng ký tài khoản thành công!' });
    } catch (error) {
        console.error("Lỗi đăng ký:", error);
        res.status(500).json({ message: 'Lỗi máy chủ khi đăng ký.' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Đọc dữ liệu từ file JSON
        const db = readData();

        // 2. Tìm user
        const user = db.users.find(u => u.email === email);
        if (!user) {
            return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng!' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng!' });
        }

        // CẬP NHẬT: Thêm trường 'name' vào Payload của JWT để đồng bộ hóa dữ liệu định danh
        const token = jwt.sign(
            { 
                userId: user.id, 
                name: user.name, 
                role: user.role 
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Đăng nhập thành công!',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error("Lỗi đăng nhập:", error);
        res.status(500).json({ message: 'Lỗi máy chủ khi đăng nhập.' });
    }
};
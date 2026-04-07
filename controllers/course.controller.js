const fs = require('fs');
const path = require('path');

const coursesPath = path.join(__dirname, '../data/courses.json');

exports.getAllCourses = (req, res) => {
    try {
        const data = fs.readFileSync(coursesPath, 'utf-8');
        const courses = JSON.parse(data);
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: "Lỗi lấy danh sách khóa học" });
    }
};
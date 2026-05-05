# 📘 TÀI LIỆU API DCGLEARN (ĐẦY ĐỦ 26 ENDPOINTS)

**Base URL:** `http://localhost:3000`

---

## 🔐 1. XÁC THỰC (AUTH) - 2 APIs
- `POST /api/auth/register`: Đăng ký tài khoản mới.
- `POST /api/auth/login`: Đăng nhập & lấy JWT Token.

## 👤 2. NGƯỜI DÙNG (USER) - 5 APIs
- `GET /api/user/profile`: Xem thông tin cá nhân (Cần Token).
- `GET /api/user/all`: [ADMIN] Liệt kê toàn bộ người dùng.
- `PUT /api/user/role/:userId`: [ADMIN] Đổi vai trò (Học viên/Giảng viên/Admin).
- `PUT /api/user/reset-password/:userId`: [ADMIN] Đặt lại mật khẩu mới.
- `DELETE /api/user/:userId`: [ADMIN] Xóa tài khoản vĩnh viễn.

## 📚 3. KHÓA HỌC (COURSES) - 5 APIs
- `GET /api/courses/all`: Xem tất cả khóa học (Public).
- `GET /api/courses/:id`: Xem chi tiết 1 khóa học.
- `POST /api/courses`: [GV/ADMIN] Tạo khóa học mới.
- `PUT /api/courses/:id`: [GV-CHỦ/ADMIN] Cập nhật thông tin khóa học.
- `DELETE /api/courses/:id`: [GV-CHỦ/ADMIN] Xóa khóa học.

## 📖 4. BÀI HỌC (LESSONS) - 4 APIs
- `GET /api/lessons/course/:courseId`: Xem danh sách bài học của khóa.
- `POST /api/lessons`: [GV-CHỦ/ADMIN] Thêm bài giảng (Video/Content).
- `PUT /api/lessons/:id`: [GV-CHỦ/ADMIN] Sửa nội dung bài giảng.
- `DELETE /api/lessons/:id`: [GV-CHỦ/ADMIN] Xóa bài giảng.

## 🎓 5. ĐĂNG KÝ HỌC (ENROLLMENTS) - 2 APIs
- `POST /api/enrollments/enroll`: [HỌC VIÊN] Đăng ký vào một khóa học.
- `GET /api/enrollments/my-courses`: [HỌC VIÊN] Xem các lớp mình đã tham gia.

## ✍️ 6. BÀI TẬP (ASSIGNMENTS) - 3 APIs
- `GET /api/assignments/all`: Xem danh sách tất cả bài tập.
- `POST /api/assignments`: [GV/ADMIN] Tạo bài tập trắc nghiệm mới.
- `GET /api/assignments/:id/stats`: [GV-CHỦ/ADMIN] Xem thống kê bài nộp thực tế.

## 📝 7. NỘP BÀI (SUBMISSIONS) - 3 APIs
- `POST /api/submissions/submit`: [HỌC VIÊN] Nộp bài & Tự động chấm điểm.
- `GET /api/submissions/assignment/:assignmentId`: [GV-CHỦ/ADMIN] Xem danh sách bài làm của HS.
- `PUT /api/submissions/grade/:submissionId`: [GV-CHỦ/ADMIN] Chấm điểm thủ công & Nhận xét.

## 📈 8. TIẾN ĐỘ (PROGRESS) - 1 API
- `GET /api/progress/course/:courseId`: [HỌC VIÊN] Lấy % tiến độ hoàn thành khóa học.

---
*Ghi chú: [GV-CHỦ] là Giảng viên tạo ra tài nguyên đó mới có quyền sửa/xóa.*

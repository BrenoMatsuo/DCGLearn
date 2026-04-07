// 1. Cấu hình chung
const API_URL = '/api'; // Dùng đường dẫn tương đối để tránh lỗi CORS khi chạy trên cùng Port

// 2. Kiểm tra quyền truy cập (Auth Guard) cho trang Dashboard
// Nếu file script.js này dùng chung cho toàn bộ web, ta cần kiểm tra trang hiện tại
const isDashboard = window.location.pathname.includes('dashboard');
const token = localStorage.getItem('token');
const userStr = localStorage.getItem('user');
const user = userStr ? JSON.parse(userStr) : null;

if (isDashboard && (!token || !user)) {
    window.location.href = '/login'; // Chặn truy cập trái phép vào dashboard
}

// 3. Khởi tạo các phần tử DOM (Dùng Optional Chaining để tránh lỗi nếu không tìm thấy)
const dom = {
    loginForm: document.getElementById('login-form'),
    registerForm: document.getElementById('registerForm') || document.getElementById('register-form'),
    userName: document.getElementById('userName'),
    userRole: document.getElementById('userRole'),
    courseContainer: document.getElementById('courseContainer'),
    logoutBtn: document.getElementById('logoutBtn') || document.getElementById('logout-btn'),
    msgDiv: document.getElementById('message') || document.getElementById('register-error')
};

// 4. Các hàm xử lý Logic
async function fetchWithToken(endpoint, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
    const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
    return await res.json();
}

// Hàm hiển thị danh sách khóa học (Dành cho Dashboard)
async function displayCourses() {
    if (!dom.courseContainer) return;

    try {
        const response = await fetch(`${API_URL}/courses/all`); // Giả định bạn có route này
        const data = await response.json();
        const courses = data.courses || [];

        dom.courseContainer.innerHTML = courses.length ? '' : '<p>Hiện chưa có khóa học nào.</p>';

        courses.forEach(course => {
            const courseCard = `
                <div class="course-card">
                    <img src="${course.image || 'https://via.placeholder.com/300x150'}" alt="${course.title}" style="width:100%; border-radius:10px;">
                    <div class="course-info" style="padding: 15px;">
                        <span class="badge" style="background:#e3f2fd; color:#1e88e5; padding:4px 8px; border-radius:5px; font-size:12px;">
                            ${course.instructor || 'Giảng viên'}
                        </span>
                        <h3 style="margin: 10px 0;">${course.title}</h3>
                        <p style="color:#607d8b; font-size:14px; margin-bottom:15px;">${course.description}</p>
                        <button class="btn-primary" onclick="enrollCourse(${course.id})" style="width:100%; padding:10px; border:none; background:#1e88e5; color:white; border-radius:8px; cursor:pointer;">
                            Đăng ký học <i class="fas fa-arrow-right"></i>
                        </button>
                    </div>
                </div>
            `;
            dom.courseContainer.insertAdjacentHTML('beforeend', courseCard);
        });
    } catch (error) {
        console.error("Lỗi khi tải khóa học:", error);
        dom.courseContainer.innerHTML = '<p>Không thể tải danh sách khóa học lúc này.</p>';
    }
}

function enrollCourse(id) {
    alert("Đang đăng ký khóa học ID: " + id + ". Tính năng này sẽ sớm ra mắt!");
}

// 5. Thiết lập sự kiện (Event Listeners)
document.addEventListener('DOMContentLoaded', () => {
    // Hiển thị thông tin user nếu đang ở Dashboard
    if (isDashboard && user) {
        if (dom.userName) dom.userName.textContent = user.name;
        if (dom.userRole) dom.userRole.textContent = user.role;
        displayCourses();
    }

    // Xử lý Đăng ký
    if (dom.registerForm) {
        dom.registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = dom.registerForm.querySelector('button[type="submit"]');
            const formData = {
                name: document.getElementById('name')?.value || document.getElementById('reg-name')?.value,
                email: document.getElementById('email')?.value || document.getElementById('reg-email')?.value,
                role: document.getElementById('role')?.value || document.getElementById('reg-role')?.value,
                password: document.getElementById('password')?.value || document.getElementById('reg-password')?.value
            };

            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';

            try {
                const res = await fetch(`${API_URL}/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                const data = await res.json();

                if (res.ok) {
                    dom.msgDiv.innerHTML = `<div style="color:green">✅ ${data.message}</div>`;
                    setTimeout(() => window.location.href = '/login', 1500);
                } else {
                    dom.msgDiv.innerHTML = `<div style="color:red">❌ ${data.message}</div>`;
                    btn.disabled = false;
                    btn.innerText = 'Đăng ký tài khoản';
                }
            } catch (err) {
                dom.msgDiv.innerHTML = `<div style="color:red">❌ Lỗi kết nối server!</div>`;
                btn.disabled = false;
                btn.innerText = 'Đăng ký tài khoản';
            }
        });
    }

    // Xử lý Đăng xuất
    if (dom.logoutBtn) {
        dom.logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('Bạn muốn đăng xuất?')) {
                localStorage.clear();
                window.location.href = '/login';
            }
        });
    }
});

document.addEventListener('DOMContentLoaded', () => {
    // ... (Giữ nguyên phần code lấy user từ localStorage đã có của bạn) ...

    const userMenuBtn = document.getElementById('userMenuBtn');
    const userDropdown = document.getElementById('userDropdown');

    // Toggle hiện/ẩn menu khi click vào nút
    userMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Ngăn sự kiện click lan ra ngoài
        userDropdown.classList.toggle('show');
    });

    // Đóng menu nếu click bất kỳ đâu ngoài menu
    window.addEventListener('click', () => {
        if (userDropdown.classList.contains('show')) {
            userDropdown.classList.remove('show');
        }
    });

    // Xử lý đăng xuất (Cập nhật lại selector vì nút nằm trong dropdown)
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm("Bạn có chắc chắn muốn đăng xuất không?")) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login'; 
            }
        });
    }
});
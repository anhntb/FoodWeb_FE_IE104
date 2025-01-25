const API_URL = "http://localhost:3000/api";

async function login(username, password) {
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({username, password}),
        });

        const data = await response.json();

        if (data.success) {
            localStorage.setItem("currentUser", username);
            localStorage.setItem("userId", data.user.id);
            window.location.href = "../TrangChu/TrangChu.html";
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error("Lỗi đăng nhập:", error);
        alert("Lỗi đăng nhập!");
    }
}

async function register(username, password, email) {
    try {
        const response = await fetch(`${API_URL}/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({username, password, email}),
        });

        const data = await response.json();

        if (data.success) {
            window.location.href = "../dangnhap/dangnhap.html";
            alert("Đăng ký thành công!");
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error("Lỗi đăng ký:", error);
        alert("Lỗi đăng ký!");
    }
}

async function forgotPassword(email) {
    console.log("forgotPassword");
    try {
        const response = await fetch(`${API_URL}/forgot-password`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({email}),
        });

        const data = await response.json();

        if (data.success) {
            sessionStorage.setItem("emailForReset", email);
            window.location.href = "../nhap-ma-code/ma-code.html";
            alert("Mã code đã được gửi đến email của bạn");
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error("Lỗi gửi mã code:", error);
        alert("Lỗi gửi mã code!" + error);
    }
}

async function verifyCode(email, code) {
    try {
        const response = await fetch(`${API_URL}/verify-code`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({email, code}),
        });

        const data = await response.json();

        if (data.success) {
            sessionStorage.setItem("codeVerified", true);
            window.location.href = "../cap-nhat-mat-khau-moi/cap-nhat-mat-khau.html";
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error("Lỗi xác thực mã code:", error);
        alert("Lỗi xác thực mã code!");
    }
}

async function resetPassword(email, newPassword) {
    try {
        const response = await fetch(`${API_URL}/reset-password`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({email, newPassword}),
        });

        const data = await response.json();

        if (data.success) {
            window.location.href = "../dangnhap/dangnhap.html";
            alert("Đặt lại mật khẩu thành công!");
        } else {
            console.log(data);
            alert(data.message);
        }
    } catch (error) {
        console.error("Lỗi đặt lại mật khẩu:", error);
        alert("Lỗi đặt lại mật khẩu!");
    }
}


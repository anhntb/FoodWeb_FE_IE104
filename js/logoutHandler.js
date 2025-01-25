function logout() {
    localStorage.removeItem("userId");
    window.location.href = "../TrangChu/TrangChu.html";
    alert("Đăng xuất thành công");
}

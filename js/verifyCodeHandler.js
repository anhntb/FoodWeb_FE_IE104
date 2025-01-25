document.addEventListener("DOMContentLoaded", () => {
    const email = sessionStorage.getItem("emailForReset");
    if (!email) {
        alert("Vui lòng thực hiện các bước xác thực trước");
        window.location.href = "../quen-mat-khau/quenmatkhau.html";
        return;
    }

    const verifyCodeForm = document.getElementById("verifyCodeForm");
    const verifyCodeBtn = document.getElementById("verifyCodeBtn");
    verifyCodeBtn.disabled = true;

    verifyCodeForm.addEventListener("input", () => {
        const code = document.getElementById("code").value;
        verifyCodeBtn.disabled = code === "";
    });

    verifyCodeForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const code = document.getElementById("code").value;
        await verifyCode(email, code);
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const email = sessionStorage.getItem("emailForReset");
    const isVerified = sessionStorage.getItem("codeVerified");

    if (!email || !isVerified) {
        alert("Vui lòng thực hiện các bước xác thực trước");
        window.location.href = "../quen-mat-khau/quenmatkhau.html";
        return;
    }

    const resetPasswordForm = document.getElementById("resetPasswordForm");
    const resetPasswordBtn = document.getElementById("resetPasswordBtn");
    resetPasswordBtn.disabled = true;

    resetPasswordForm.addEventListener("input", () => {
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;
        const isFormValid =
            password !== "" &&
            confirmPassword !== "" &&
            password === confirmPassword &&
            isValidPassword(password).isValid;

        resetPasswordBtn.disabled = !isFormValid;
    });

    resetPasswordBtn.addEventListener("mouseover", async () => {
        const confirmPassword = document.getElementById("confirmPassword").value;
        const password = document.getElementById("password").value;

        if (resetPasswordBtn.disabled) {
            if (
                password === "" ||
                confirmPassword === ""
            ) {
                document.getElementById("popup").style.display = "block";
                document.getElementById("popup-message").innerHTML = "Phải điền tất cả";
            } else if (password !== confirmPassword) {
                document.getElementById("popup").style.display = "block";
                document.getElementById("popup-message").innerHTML =
                    "Mật khẩu không khớp";
            } else if (!isValidPassword(password).isValid) {
                document.getElementById("popup").style.display = "block";
                document.getElementById("popup-message").innerHTML =
                    isValidPassword(password).message;
            }
        }
    });

    resetPasswordBtn.addEventListener("mouseout", async () => {
        document.getElementById("popup").style.display = "none";
    });

    resetPasswordForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const password = document.getElementById("password").value;
        await resetPassword(email, password);
    });
});

function isValidPassword(password) {
    const isValid =
        /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*]).{8,20}$/.test(password);
    return {
        isValid: isValid,
        message: isValid
            ? ""
            : "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt",
    };
}

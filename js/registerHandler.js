document.addEventListener("DOMContentLoaded", async () => {
    const registerForm = document.getElementById("registerForm");
    const registerBtn = document.getElementById("register-btn");

    registerBtn.disabled = true;

    registerForm.addEventListener("input", () => {
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;
        const email = document.getElementById("email").value;

        const isFormValid =
            username !== "" &&
            email !== "" &&
            password !== "" &&
            confirmPassword !== "" &&
            password === confirmPassword &&
            isValidPassword(password).isValid;

        registerBtn.disabled = !isFormValid;
    });

    registerBtn.addEventListener("mouseover", async () => {
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;
        const email = document.getElementById("email").value;

        if (registerBtn.disabled) {
            if (
                username === "" ||
                email === "" ||
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

    registerBtn.addEventListener("mouseout", async () => {
        document.getElementById("popup").style.display = "none";
    });

    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;
        const email = document.getElementById("email").value;

        await register(username, password, email);
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

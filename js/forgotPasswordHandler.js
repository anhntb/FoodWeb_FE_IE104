document.addEventListener("DOMContentLoaded", async () => {
    const forgotPasswordForm = document.getElementById("forgotPasswordForm");
    const sendEmailBtn = document.getElementById("sendEmailBtn");
    sendEmailBtn.disabled = true;

    forgotPasswordForm.addEventListener("input", () => {
        const email = document.getElementById("email").value;
        const isValidForm = email !== "";
        sendEmailBtn.disabled = !isValidForm;
    });

    forgotPasswordForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("email").value;
        await forgotPassword(email);
    });
});


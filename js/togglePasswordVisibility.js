document.addEventListener("DOMContentLoaded", function () {
    const passwordFields = document.querySelectorAll('.password-field');

    passwordFields.forEach(field => {
        const input = field.querySelector('input');
        const toggleIcon = field.querySelector('.toggle-password');

        if (!input || !toggleIcon) return;

        toggleIcon.addEventListener('click', function () {
            const type = input.type === 'password' ? 'text' : 'password';
            input.type = type;

            if (type === 'text') {
                this.classList.remove('ri-eye-off-line');
                this.classList.add('ri-eye-line');
            } else {
                this.classList.remove('ri-eye-line');
                this.classList.add('ri-eye-off-line');
            }

            input.focus();
        });
    });

    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmPassword');

    if (password && confirmPassword) {
        password.addEventListener('input', function () {
            if (confirmPassword.value) {
                if (this.value === confirmPassword.value) {
                    confirmPassword.style.borderColor = '#4CAF50';
                } else {
                    confirmPassword.style.borderColor = '#f44336';
                }
            }
        });

        confirmPassword.addEventListener('input', function () {
            if (this.value) {
                if (this.value === password.value) {
                    this.style.borderColor = '#4CAF50';
                } else {
                    this.style.borderColor = '#f44336';
                }
            } else {
                this.style.borderColor = '#ccc';
            }
        });
    }
});

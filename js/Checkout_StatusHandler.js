document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get('status');
    const statusContainer = document.getElementById('status-container');

    if (status === 'success') {
        statusContainer.innerHTML = `
            <div class="container container--success">
                <i class="ri-checkbox-circle-fill"></i>
                <p>Chúc mừng bạn đã đặt hàng thành công</p>
            </div>
        `;
    } else {
        statusContainer.innerHTML = `
            <div class="container container--fail">
                <i class="ri-error-warning-fill"></i>
                <p>Thanh toán thất bại! Vui lòng thử lại!</p>
            </div>
        `;
    }

    setTimeout(() => {
        window.location.href = '../TrangChu/TrangChu.html';
    }, 5000);
}); 
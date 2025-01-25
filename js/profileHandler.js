const API_URL = "http://localhost:3000/api";

document.addEventListener("DOMContentLoaded", async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
        alert("Vui lòng đăng nhập");
        window.location.href = "../dangnhap/dangnhap.html";
        return;
    }

    await loadUserInfo(userId);

    document.querySelectorAll(".nav-btn").forEach((button) => {
        button.addEventListener("click", () => {
            document
                .querySelectorAll(".nav-btn")
                .forEach((btn) => btn.classList.remove("active"));
            button.classList.add("active");

            const sectionId = button.getAttribute("data-section");
            loadContent(sectionId);
        });
    });

    await loadContent("detail-info");
});

async function loadUserInfo(userId) {
    try {
        const response = await fetch(`${API_URL}/get-info/${userId}`);
        const data = await response.json();

        if (data.success) {
            const avatarImg = document.querySelector(".info__user-image");
            avatarImg.src = data.avatar ? data.avatar : "../assets/logo/logo.jpg";
            window.userData = data;
        }
    } catch (error) {
        console.error("Lỗi khi tải thông tin:", error);
    }
}

async function loadContent(sectionId) {
    const dynamicContent = document.getElementById("dynamic-content");

    switch (sectionId) {
        case "detail-info":
            dynamicContent.innerHTML = `
                <div id="detail-info">
                    <h2>THÔNG TIN CÁ NHÂN</h2>
                    <div>
                        <label>Họ và tên:</label>
                        <input class="detail-info__name" type="text" value="${
                window.userData?.profile?.fullName || ""
            }" required>
                    </div>
                    <div>
                        <label>Tên đăng nhập:</label>
                        <input class="detail-info__username" type="text" value="${
                window.userData?.username || ""
            }" readonly disabled>
                    </div>
                    <div>
                        <label>Địa chỉ gmail:</label>
                        <input class="detail-info__email" type="email" value="${
                window.userData?.email || ""
            }" readonly disabled>
                    </div>
                    <div>
                        <label>Số điện thoại:</label>
                        <input class="detail-info__phone-number" type="tel" value="${
                window.userData?.profile?.phone || ""
            }" required>
                    </div>
                    <div>
                        <label>Ngày/tháng/năm sinh:</label>
                        <input class="detail-info__birthday" type="date" value="${
                window.userData?.profile?.birthday || ""
            }" required>
                    </div>
                    <div>
                        <label>Giới tính:</label>
                        <input class="detail-info__gender" name="gender" id="male" type="radio" ${
                window.userData?.profile?.gender === "male"
                    ? "checked"
                    : ""
            } required>
                        <label for="male">Nam</label>
                        <input class="detail-info__gender" name="gender" id="female" type="radio" ${
                window.userData?.profile?.gender === "female"
                    ? "checked"
                    : ""
            } required>
                        <label for="female">Nữ</label>
                    </div>
                    <button class="detail-info__btn" type="submit">Cập nhật</button>
                </div>
            `;
            break;

        case "voucher-container":
            const voucherContent = await loadVouchers();
            dynamicContent.innerHTML = `
          <div id="voucher-container">
            <h2>KHO VOUCHER CỦA TÔI</h2>
            <div>
                <label>Mã voucher:</label>
                <input class="voucher-container__input" type="text" placeholder="Nhập mã voucher">
                <button class="voucher-container__save-btn" type="submit">Lưu</button>
            </div>
            ${voucherContent}
        </div>
      `;
            break;

        case "track-order":
            dynamicContent.innerHTML = `
                <div id="track-order">
                    <h2>THEO DÕI ĐƠN HÀNG</h2>
                    <nav class="track-order__nav">
                        <a href="#" data-order="all" class="order-nav-btn active">Tất cả</a>
                        <a href="#" data-order="awaiting" class="order-nav-btn">Chờ thanh toán</a>
                        <a href="#" data-order="completed" class="order-nav-btn">Hoàn thành</a>
                        <a href="#" data-order="cancelled" class="order-nav-btn">Đã hủy</a>
                        <a href="#" data-order="return-refund" class="order-nav-btn">Trả hàng/Hoàn tiền</a>
                    </nav>
                    <div id="order-content">
                    
                    </div>
                </div>
            `;
            setupOrderNav();
            break;
    }

    setupContentEventListeners(sectionId);
}

function setupOrderNav() {
    document.querySelectorAll(".order-nav-btn").forEach((button) => {
        button.addEventListener("click", (e) => {
            e.preventDefault();

            document
                .querySelectorAll(".order-nav-btn")
                .forEach((btn) => btn.classList.remove("active"));

            button.classList.add("active");

            const orderType = button.getAttribute("data-order");
            loadOrderContent(orderType);
        });
    });

    loadOrderContent("all");
}

async function loadOrderContent(orderType) {
    const orderContent = document.getElementById("order-content");
    const userId = localStorage.getItem("userId");

    try {
        const response = await getOrderHistory(userId);

        const orderHistory = response.orderHistory || [];
        let filteredOrders;

        switch (orderType) {
            case "awaiting":
                filteredOrders = orderHistory.filter(
                    (order) => order.status === "awaiting"
                );
                break;
            case "completed":
                filteredOrders = orderHistory.filter(
                    (order) => order.status === "completed"
                );
                break;
            case "cancelled":
                filteredOrders = orderHistory.filter(
                    (order) => order.status === "cancelled"
                );
                break;
            case "return-refund":
                filteredOrders = orderHistory.filter(
                    (order) => order.status === "refunded"
                );
                break;
            default:
                filteredOrders = orderHistory;
        }


        if (!filteredOrders || filteredOrders.length === 0) {
            orderContent.innerHTML = "<p>Không có đơn hàng nào</p>";
            return;
        }

        orderContent.innerHTML = filteredOrders
            .map((order) => createOrderHTML(order))
            .join("");
    } catch (error) {
        console.error("Lỗi khi tải đơn hàng:", error);
        orderContent.innerHTML = "<p>Có lỗi xảy ra khi tải đơn hàng</p>";
    }
}

function createOrderHTML(order) {
    const status = getStatusText(order.status);
    const showActionButtons = order.status === "awaiting";
    const showReviewButton = order.status === "completed";
    const showBuyAgainButton = order.status === "completed" || order.status === "cancelled";

    const orderItems = order.items.map(item => `
    <div class="order-item">
      <div class="order-item__detail">
        <img class="order-item__img" src="${item.image || '../assets/logo/logo.jpg'}">
        <div class="order-item__info">
          <p class="order-item__name">${item.name}</p>
          <p class="order-item__quantity">x${item.quantity}</p>
          <p class="order-item__price">${formatPrice(item.price)}đ</p>
        </div>
      </div>
      ${showReviewButton ? `
        <button class="review-btn" onclick="location.href='../DanhGiaSP/DanhGiaSP.html?foodId=${item.foodId}&orderId=${order.id}'">
          Đánh giá
        </button>
      ` : ''}
    </div>
  `).join('');

    return `
    <div class="order-info">
      <div class="order-info__items">
        ${orderItems}
      </div>
      
      <div class="order-info__summary">
        <p class="order-info__date">
          ${formatDate(order.orderDate)}
        </p>
        <p class="order-info__val">Thành tiền: ${formatPrice(order.totalAmount)}đ</p>
        <div class="order-info__status">
          <label>${status}</label>
          <div class="order-info__btn-container">
            ${showActionButtons ? `
              <button>Liên hệ Shop</button>
              <button>Hủy đơn hàng</button>
            ` : ''}
            ${showBuyAgainButton ? `
              <button onclick="buyAgain(${order.id})">Mua lại</button>
            ` : ''}
          </div>
        </div>
      </div>
    </div>
  `;
}

function getStatusText(status) {
    switch (status) {
        case "awaiting":
            return "Chờ thanh toán";
        case "completed":
            return "Đã hoàn thành";
        case "cancelled":
            return "Đã hủy";
        case "refunded":
            return "Đang xử lý hoàn tiền";
        default:
            return status;
    }
}

function formatPrice(price) {
    return price.toLocaleString("vi-VN");
}

function setupContentEventListeners(sectionId) {
    if (sectionId === "detail-info") {
        const updateBtn = document.querySelector(".detail-info__btn");
        updateBtn.disabled = true;

        const inputs = document.querySelectorAll(
            ".detail-info__name, .detail-info__phone-number, .detail-info__birthday, .detail-info__gender"
        );

        const initValues = Array.from(inputs).map((input) =>
            input.type === "radio" ? input.checked : input.value
        );

        const checkChangeValue = () => {
            const isChange = Array.from(inputs).some((input, index) => {
                if (input.type === "tel") {
                    return isValidPhone(input.value) && input.value !== initValues[index];
                }

                if (input.type === "radio") {
                    return input.checked !== initValues[index];
                }
                return input.value !== initValues[index];
            });
            updateBtn.disabled = !isChange;
        };

        inputs.forEach((input) => {
            input.addEventListener("input", checkChangeValue);
            if (input.type === "radio") {
                input.addEventListener("change", checkChangeValue);
            }
        });

        if (updateBtn) {
            updateBtn.addEventListener("click", updateProfile);
        }
    }
}

async function updateProfile() {
    const nameInput = document.querySelector(".detail-info__name");
    const phoneInput = document.querySelector(".detail-info__phone-number");
    const birthdayInput = document.querySelector(".detail-info__birthday");
    const genderInputs = document.querySelectorAll(".detail-info__gender");
    const userId = localStorage.getItem("userId");

    const selectedGender = Array.from(genderInputs).find(
        (item) => item.checked
    )?.id;

    try {
        const response = await fetch(`${API_URL}/update-info`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                userId: parseInt(userId),
                fullName: nameInput.value,
                phone: phoneInput.value,
                birthday: birthdayInput.value,
                gender: selectedGender,
            }),
        });

        const data = await response.json();
        if (data.success) {
            alert("Cập nhật thông tin thành công!");
            window.location.reload();
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error("Lỗi khi cập nhật thông tin:", error);
        alert("Có lỗi xảy ra khi cập nhật thông tin!");
    }
}


async function loadVouchers() {
    try {
        const userId = localStorage.getItem("userId");
        const response = await fetch(`${API_URL}/vouchers/${userId}`);
        const data = await response.json();

        if (!data.vouchers || data.vouchers.length === 0) return "";

        return data.vouchers
            .map(
                (voucher) => `
      <div class="voucher-container__ticket">
          <img class="voucher-container__img" src="${
                    voucher.image
                }" alt="Voucher Image">
          <div class="voucher-container__info">
              <span class="voucher-container__code">${voucher.code}</span>
              <span class="voucher-container__description">${
                    voucher.description
                }</span>
              <span class="voucher-container__expiry">HSD: ${new Date(
                    voucher.expiredDate
                ).toLocaleDateString("vi-VN")}</span>
          </div>
      </div>
    `
            )
            .join("");
    } catch (error) {
        console.error("Lỗi khi tải voucher:", error);
        alert("Có lỗi xảy ra khi tải voucher!" + error.message);
    }
}

async function getOrderHistory(userId) {
    try {
        const response = await fetch(`${API_URL}/order-history/${userId}`);
        const data = await response.json();

        if (!data.success) {
            alert(data.message);
        }

        return data;
    } catch (error) {
        console.error("Lỗi khi lấy lịch sử đơn hàng:", error);

    }
}

async function buyAgain(orderId) {
    try {
        const userId = localStorage.getItem("userId");
        const response = await fetch(`${API_URL}/order-history/${userId}`);
        const data = await response.json();

        const order = data.orderHistory.find((item) => item.id === orderId);

        const purchaseItems = order.items.map((item) => ({
            foodId: item.foodId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
        }));
        localStorage.setItem("checkoutItems", JSON.stringify(purchaseItems));
        window.location.href = "../ThanhToan/ThanhToan.html";
    } catch (error) {
        console.error("Lỗi khi mua lại:", error);
    }
}

function formatDate(isoDate) {
    const options = {
        timeZone: "Asia/Ho_Chi_Minh",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
    };

    const GMT7 = new Date(isoDate).toLocaleDateString("vi-VN", options);
    const [timePart, datePart] = GMT7.split(" ");
    return `${datePart} ${timePart}`;
}

function isValidPhone(phone) {
    return /^[0-9]{10}$/.test(phone);
}

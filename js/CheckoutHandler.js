document.addEventListener("DOMContentLoaded", async () => {
  const nameInput = document.querySelector(".user-info__name");
  const addressInput = document.querySelector(".user-info__address");
  const phoneInput = document.querySelector(".user-info__phone-number");
  const checkoutBtn = document.getElementById("checkout-btn");
  checkoutBtn.disabled = true;

  const userId = localStorage.getItem("userId");
  if (!userId) {
    alert("Vui lòng đăng nhập để thanh toán!");
    window.location.href = "../dangnhap/dangnhap.html";
    return;
  }

  const vouchers = await getUserVouchers(userId);

  const voucherDropdown = document.getElementById("voucher-dropdown");
  vouchers.forEach((voucher) => {
    const voucherElement = document.createElement("div");
    voucherElement.className = "dropdown-item";
    voucherElement.textContent = voucher.code;
    voucherElement.dataset.value = voucher.id;
    voucherElement.addEventListener("click", function () {
      applyVoucher(voucher);
      const dropdown = this.closest(".custom-dropdown");
      dropdown.querySelector(".dropdown-btn").textContent = voucher.code;
      dropdown.classList.remove("open");
    });
    voucherDropdown.appendChild(voucherElement);
  });

  try {
    const checkoutItemsStr = localStorage.getItem("checkoutItems");

    const selectedItems = JSON.parse(checkoutItemsStr);
    if (!Array.isArray(selectedItems) || selectedItems.length === 0) {
      alert("Không có sản phẩm nào được chọn để thanh toán!");
      window.location.href = "../gio-hang/gio-hang.html";
      return;
    }

    await displayCheckoutItems(selectedItems);

    const checkInputs = () => {
      checkoutBtn.disabled = nameInput.value === "" ||
          addressInput.value === "" ||
          phoneInput.value === "" ||
          !isValidPhone(phoneInput.value);
    };

    nameInput.addEventListener("input", checkInputs);
    addressInput.addEventListener("input", checkInputs);
    phoneInput.addEventListener("input", checkInputs);

    checkoutBtn.addEventListener("click", async () => {
      try {
        const foods = await getAllFoods();
        let isValid = true;
        let invalidItems = [];

        for (const item of selectedItems) {
          const food = foods.find((f) => f.id === parseInt(item.foodId));
          if (!food || item.quantity > food.remain) {
            isValid = false;
            invalidItems.push(item.name);
          }
        }
        if (!isValid) {
          alert(
            `Các món sau đã hết hàng hoặc không đủ số lượng: ${invalidItems.join(
              ", "
            )}`
          );
          return;
        }

        await updatePurchasedItems(userId, selectedItems);

        if (localStorage.getItem("checkoutItems")) {
          await deleteMultipleFromCart(
            userId,
            selectedItems.map((item) => item.foodId)
          );
        }

        localStorage.removeItem("checkoutItems");

        window.location.href = "ThanhToan_Status.html?status=success";
      } catch (error) {
        console.error("Lỗi khi thanh toán:", error);
        window.location.href = "ThanhToan_Status.html?status=fail";
      }
    });
  } catch (error) {
    console.error("Lỗi khi tải thông tin món ăn:", error);
  }

  await displayVoucherList();

  document
    .querySelector(".dropdown-btn")
    .addEventListener("click", function () {
      this.closest(".custom-dropdown").classList.toggle("open");
    });

  document.addEventListener("click", function (e) {
    if (!e.target.closest(".custom-dropdown")) {
      document.querySelector(".custom-dropdown").classList.remove("open");
    }
  });
});

async function displayCheckoutItems(items) {
  const tbody = document.getElementById("checkout-items");
  let totalAmount = 0;

  tbody.innerHTML = items
      .map((item) => {
        const amount = item.price * item.quantity;
        totalAmount += amount;
        return `
            <tr>
                <td>${item.name}</td>
                <td>${formatPrice(item.price)}đ</td>
                <td>${item.quantity}</td>
                <td>${formatPrice(amount)}đ</td>
            </tr>
        `;
      })
      .join("");
  document.getElementById("total-amount").textContent = `${formatPrice(
    totalAmount
  )}đ`;
}

function formatPrice(price) {
  return price.toLocaleString("vi-VN");
}

function isValidPhone(phone) {
  return /^[0-9]{10}$/.test(phone);
}

async function updatePurchasedItems(userId, items) {
  try {
    const selectedVoucher = JSON.parse(localStorage.getItem("selectedVoucher"));
    let totalAmount = items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    if (selectedVoucher && totalAmount >= selectedVoucher.minOrder) {
      const discount = Math.floor(
        (totalAmount * selectedVoucher.discountPercent) / 100
      );
      totalAmount -= discount;
    }

    const response = await fetch(`${API_URL}/orders/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: parseInt(userId),
        items,
        orderDate: new Date().toISOString(),
        status: "completed",
        totalAmount: totalAmount,
        appliedVoucher: selectedVoucher ? selectedVoucher.id : null,
      }),
    });

    const data = await response.json();
    if (!data.success) {
      alert(data.message);
    }

    if (selectedVoucher) {
      await fetch(`${API_URL}/vouchers/use`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: parseInt(userId),
          voucherId: selectedVoucher.id,
        }),
      });
    }

    await fetch(`${API_URL}/update-inventory`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ items }),
    });

    localStorage.removeItem("selectedVoucher");
    localStorage.removeItem("originalAmount");
  } catch (error) {
    console.error("Lỗi khi cập nhật đơn hàng:", error);
    alert(error.message);
  }
}

async function getUserVouchers(userId) {
  try {
    const response = await fetch(`${API_URL}/vouchers/${userId}`);
    const data = await response.json();
    return data.vouchers || [];
  } catch (error) {
    console.error("Lỗi khi lấy danh sách voucher:", error);
    return [];
  }
}

function applyVoucher(voucher) {
  const totalAmountElement = document.getElementById("total-amount");
  const totalAmount = parseInt(
    totalAmountElement.textContent.replace("đ", "").replace(/\./g, "")
  );

  if (!localStorage.getItem("originalAmount")) {
    localStorage.setItem("originalAmount", totalAmount.toString());
  }

  if (totalAmount >= voucher.minOrder) {
    const discount = Math.floor((totalAmount * voucher.discountPercent) / 100);
    const newTotal = totalAmount - discount;

    totalAmountElement.innerHTML = `
      <span class="original-price">${formatPrice(totalAmount)}đ</span>
      <span class="new-price">${formatPrice(newTotal)}đ</span>
    `;

    localStorage.setItem("selectedVoucher", JSON.stringify(voucher));
  }
}

async function displayVoucherList() {
  const userId = localStorage.getItem("userId");
  const vouchers = await getUserVouchers(userId);
  const voucherDropdown = document.getElementById("voucher-dropdown");
  const totalAmountElement = document.getElementById("total-amount");
  const totalAmount = parseInt(
    totalAmountElement.textContent.replace("đ", "").replace(/\./g, "")
  );

  voucherDropdown.innerHTML = `
    <div class="dropdown-item" data-value="none">
      <div class="voucher-info">
        <div class="voucher-code">Không áp dụng mã</div>
      </div>
    </div>`;

  voucherDropdown.innerHTML += vouchers
    .filter((voucher) => totalAmount >= voucher.minOrder)
    .map(
      (voucher) => `
      <div class="dropdown-item" data-value="${voucher.id}">
        <div class="voucher-info">
          <div class="voucher-code">${voucher.code}</div>
          <div class="voucher-desc">Giảm ${
            voucher.discountPercent
          }% cho đơn từ ${formatPrice(voucher.minOrder)}đ</div>
        </div>
      </div>
    `
    )
    .join("");

  voucherDropdown.querySelectorAll(".dropdown-item").forEach((item) => {
    item.addEventListener("click", function () {
      const voucherId = this.dataset.value;
      if (voucherId === "none") {
        removeVoucher();
      } else {
        const selectedVoucher = vouchers.find(
          (item) => item.id === parseInt(voucherId)
        );
        applyVoucher(selectedVoucher);
      }

      const dropdownBtn = document.querySelector(".dropdown-btn");
      dropdownBtn.innerHTML =
        this.querySelector(".voucher-code").textContent +
        ' <i class="ri-arrow-down-s-line"></i>';
      document.querySelector(".custom-dropdown").classList.remove("open");
    });
  });
}

function removeVoucher() {
  const totalAmountElement = document.getElementById("total-amount");
  const originalAmount = localStorage.getItem("originalAmount");

  if (originalAmount) {
    totalAmountElement.innerHTML = `${formatPrice(parseInt(originalAmount))}đ`;
    localStorage.removeItem("selectedVoucher");
    localStorage.removeItem("originalAmount");
  }
}

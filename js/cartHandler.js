document.addEventListener("DOMContentLoaded", async () => {
    const cartItemsContainer = document.querySelector("#cart-items");
    const selectAllCheckbox = document.getElementById("select-all");
    const deleteSelectedBtn = document.getElementById("delete-selected");
    const checkoutBtn = document.getElementById("checkout");

    checkoutBtn.disabled = true;
    deleteSelectedBtn.disabled = true;

    try {
        const userId = localStorage.getItem("userId");
        if (!userId) {
            alert("Vui lòng đăng nhập để xem giỏ hàng!");
            window.location.href = "../dangnhap/dangnhap.html";
            return;
        }

        const data = await getCart(userId);

        if (data.success) {
            const cartItems = data.cart.foods;
            loadCartFromLocalStorage(cartItems);
            displayCartItems(cartItems, cartItemsContainer);

            selectAllCheckbox.addEventListener("change", () => {
                const checkboxes = document.querySelectorAll(".item-checkbox");
                checkboxes.forEach((checkbox) => {
                    checkbox.checked = selectAllCheckbox.checked;
                });
                updateTotalPrice();
                updateButtonState();
            });

            deleteSelectedBtn.addEventListener("click", async () => {
                const selectedItems = document.querySelectorAll(
                    ".item-checkbox:checked"
                );
                if (confirm("Bạn có chắc muốn xóa các món ăn đã chọn?")) {
                    const foodIds = Array.from(selectedItems).map(
                        (item) => item.closest(".cart-item").dataset.foodId
                    );

                    try {
                        const result = await deleteMultipleFromCart(userId, foodIds);

                        if (result.success) {
                            selectedItems.forEach((checkbox) => {
                                checkbox.closest(".cart-item").remove();
                            });
                            updateTotalPrice();
                            selectAllCheckbox.checked = false;
                            alert("Đã xóa các món ăn đã chọn!");
                        } else {
                            alert(result.message);
                        }
                    } catch (error) {
                        console.error("Lỗi khi xóa món ăn:", error);
                        alert("Có lỗi xảy ra khi xóa món ăn!");
                    }
                }
            });
        } else {
            alert(data.message);
        }

        checkoutBtn.addEventListener("click", () => {
            const selectedItems = Array.from(
                document.querySelectorAll(".item-checkbox:checked")
            )
                .map((item) => {
                    const row = item.closest(".cart-item");
                    const nameElement = row.querySelector(".product-name");
                    const priceElement = row.querySelector("td:nth-child(3)");
                    const quantityElement = row.querySelector(".quantity-value");

                    console.log("Elements:", nameElement, priceElement, quantityElement);

                    if (!nameElement || !priceElement || !quantityElement) {
                        console.error(
                            "Không tìm thấy phần tử cần thiết trong hàng giỏ hàng."
                        );
                        return null;
                    }

                    const price = parseInt(
                        priceElement.textContent.replace(/[^\d]/g, "")
                    );

                    return {
                        foodId: row.dataset.foodId,
                        name: nameElement.textContent,
                        price: price,
                        quantity: parseInt(quantityElement.value),
                        image: row.querySelector(".product-image").src,
                    };
                })
                .filter((item) => item !== null);

            localStorage.setItem("checkoutItems", JSON.stringify(selectedItems));
            window.location.href = "../ThanhToan/ThanhToan.html";
        });

        setInterval(async () => {
            try {
                await saveCartToLocalStorage();
                console.log("Đã tự động lưu giỏ hàng");
            } catch (error) {
                console.error("Lỗi khi tự động lưu giỏ hàng:", error);
            }
        }, 30000);
    } catch (error) {
        console.error("Lỗi khi tải giỏ hàng:", error);
    }
});

function loadCartFromLocalStorage(cartItems) {
    const storedCart = JSON.parse(localStorage.getItem("cartItems")) || {};
    cartItems.forEach(item => {
        if (storedCart[item.foodId]) {
            item.quantity = storedCart[item.foodId];
        }
    });
}

async function saveCartToLocalStorage() {
    try {
        const userId = localStorage.getItem("userId");
        const cartItems = document.querySelectorAll(".cart-item");
        const storedCart = {};

        cartItems.forEach(item => {
            const foodId = item.dataset.foodId;
            const quantity = item.querySelector(".quantity-value").value;
            storedCart[foodId] = parseInt(quantity);
        });
        localStorage.setItem("cartItems", JSON.stringify(storedCart));

        for (const [foodId, quantity] of Object.entries(storedCart)) {
            await updateCartQuantity(userId, parseInt(foodId), quantity);
        }

        localStorage.removeItem("cartItems");
        localStorage.removeItem("cartItems");
    } catch (error) {
        console.error("Lỗi khi lưu giỏ hàng:", error);
    }
}

window.addEventListener("beforeunload", (event) => {

    saveCartToLocalStorage();
    event.returnValue = '';
});

function updateTotalPrice() {
    const selectedItems = document.querySelectorAll(".item-checkbox:checked");
    let total = 0;

    selectedItems.forEach((item) => {
        const row = item.closest(".cart-item");
        const priceCell = row.querySelector("td:nth-child(5)");
        const priceText = priceCell.textContent;
        const price = parseInt(priceText.replace(/[^\d]/g, ""));
        total += price;
    });

    const totalPriceElement = document.getElementById("total-price");
    totalPriceElement.textContent = `${formatPrice(total)}đ`;
}

function displayCartItems(items, container) {
    container.innerHTML = items
        .map((item) => {
            const itemTotal = item.price * item.quantity;
            return `
          <tr class="cart-item" data-food-id="${item.foodId}">
            <td><input type="checkbox" class="item-checkbox" /></td>
            <td>
              <div class="product-item">
                <img src="${item.image}"class="product-image" />
                <span class="product-name">${item.name}</span>
              </div>
            </td>
            <td>${item.price.toLocaleString()}đ</td>
            <td class="quantity-controls">
              <button class="quantity-btn minus">-</button>
              <input type="number" class="quantity-value" value="${
                item.quantity
            }" min="1">
              <button class="quantity-btn plus">+</button>
            </td>
            <td>${itemTotal.toLocaleString()}đ</td>
          </tr>
        `;
        })
        .join("");

    const quantityCells = container.querySelectorAll(".quantity-controls");
    quantityCells.forEach((cell) => {
        setupQuantityHandlers(cell, () => {
            const row = cell.closest("tr");
            const quantityInput = cell.querySelector(".quantity-value");
            const priceCell = row.querySelector("td:nth-child(3)");
            const price = parseInt(priceCell.textContent.replace(/[^\d]/g, ""));
            const quantity = parseInt(quantityInput.value);
            const totalCell = row.querySelector("td:last-child");
            totalCell.textContent = `${(price * quantity).toLocaleString()}đ`;
            updateTotalPrice();
        });
    });

    const itemCheckboxes = document.querySelectorAll(".item-checkbox");
    itemCheckboxes.forEach((checkbox) => {
        checkbox.addEventListener("change", () => {
            const selectAllCheckbox = document.getElementById("select-all");
            selectAllCheckbox.checked = Array.from(itemCheckboxes).every(
                (cb) => cb.checked
            );
            updateTotalPrice();
            updateButtonState();
        });
    });
}

function formatPrice(price) {
    return price.toLocaleString("vi-VN");
}

function updateButtonState() {
    const checkoutBtn = document.getElementById("checkout");
    const deleteSelectedBtn = document.getElementById("delete-selected");
    const selectedItems = document.querySelectorAll(".item-checkbox:checked");
    checkoutBtn.disabled = selectedItems.length === 0;
    deleteSelectedBtn.disabled = selectedItems.length === 0;
}

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const foodId = urlParams.get("id");
        const data = await getFoodById(foodId);
        console.log(data);

        const quantity = document.getElementById("quantity");
        const minusBtn = document.querySelector(".minus");
        const plusBtn = document.querySelector(".plus");
        const addToCartBtn = document.querySelector(".add-to-cart");
        const buyNowBtn = document.querySelector(".buy-now");

        quantity.addEventListener("input", function () {
            let value = parseInt(this.value) || 1;
            if (value < 1) value = 1;
            if (value > data.remain) value = data.remain;
            this.value = value;
        });

        minusBtn.addEventListener("click", () => {
            let value = parseInt(quantity.value);
            if (value > 1) {
                value--;
                quantity.value = value;
            }
        });

        plusBtn.addEventListener("click", () => {
            let value = parseInt(quantity.value);
            if (value < data.remain) {
                value++;
                quantity.value = value;
            }
        });

        addToCartBtn.addEventListener("click", () => {
            let value = parseInt(quantity.value);
            addToCart(foodId, value);
        });

        buyNowBtn.addEventListener("click", () => {
            let value = parseInt(quantity.value);
            if (value > 0) {
                const purchaseItem = [
                    {
                        foodId: data.id,
                        name: data.name,
                        price: data.price,
                        quantity: value,
                        image: data.image,
                    },
                ];
                localStorage.setItem("checkoutItems", JSON.stringify(purchaseItem));
                window.location.href = "../ThanhToan/ThanhToan.html";
            }
        });

        updateFoodDetail(data);
        if (foodId) {
            await displayReviews(foodId);
        }
    } catch (error) {
        console.error("Lỗi khi tải thông tin món ăn:", error);
    }
});

function updateElement(selector, updateFn) {
    const element = document.querySelector(selector);
    if (element) {
        updateFn(element);
    } else {
        console.log(`Không tìm thấy: ${selector}`);
        alert(`Không tìm thấy: ${selector}`);
    }
}

function updateFoodDetail(food) {
    try {
        updateElement(".product-images img", (item) => (item.src = food.image));

        updateElement(
            ".product-details .name",
            (item) => (item.innerHTML = food.name)
        );

        updateElement(".product-details .product-rating", (item) => {
            item.innerHTML = `
              ${"<i class='ri-star-fill' style='color: #FFD700;'></i>".repeat(food.rating)}
              ${'<i class="ri-star-line" style="color: #FFD700;"></i>'.repeat(5 - food.rating)}
            `;
        });

        updateElement(
            ".product-details .comment",
            (item) => (item.innerHTML = `${food.review} Nhận xét`)
        );

        updateElement(
            ".product-details .sold",
            (item) => (item.innerHTML = `${food.sold} lượt đã bán`)
        );

        updateElement(
            ".product-details .remain",
            (item) => (item.innerHTML = `${food.remain} sản phẩm còn lại`)
        );

        updateElement(
            ".product-details .new-price",
            (item) => (item.innerHTML = `${formatPrice(food.price)}đ`)
        );

        if (food.oldPrice) {
            updateElement(
                ".product-details .old-price",
                (item) => (item.innerHTML = `${formatPrice(food.oldPrice)}đ`)
            );
        }

        updateElement(".product-info table", (item) => {
            let category;
            if (food.category === "dryfood") {
                category = "Món khô";
            } else if (food.category === "soupyfood") {
                category = "Món nước";
            } else if (food.category === "sidefood") {
                category = "Món ăn kèm";
            } else if (food.category === "dessertfood") {
                category = "Món tráng miệng";
            } else {
                category = "Nước giải khát";
            }
            item.innerHTML = `
              <tr>
                <td>Danh mục</td>
                <td>${category}</td>
              </tr>
              <tr>
                <td>Xuất xứ</td>
                <td>${food.details.origin}</td>
              </tr>
              <tr>
                <td>Hương vị</td>
                <td>${food.details.taste}</td>
              </tr>
              <tr>
                <td>Thành phần</td>
                <td>${food.details.ingredients}</td>
              </tr>
              <tr>
                <td>Bảo quản</td>
                <td>${food.details.preservation}</td>
              </tr>
            `;
        });

        updateElement(
            ".product-description p",
            (item) => (item.innerHTML = food.descriptions.description)
        );
        updateElement(".product-description ul", (item) => {
            item.innerHTML = food.descriptions.features
                .map((feature) => `<li>${feature}</li>`)
                .join("");
        });

    } catch (error) {
        console.error("Lỗi khi cập nhật giao diện:", error);
    }
}

function formatPrice(price) {
    return price.toLocaleString("vi-VN");
}

async function displayReviews(foodId) {
    try {
        const response = await fetch(`${API_URL}/reviews/${foodId}`);
        const data = await response.json();

        if (!data.success) {
            alert(data.message);
            return;
        }

        const reviews = data.reviews;

        updateElement(".product-reviews .review-count", (item) => {
            item.innerHTML = `${reviews.length} đánh giá`;
        });

        updateElement(".product-reviews .review-list", (item) => {
            if (!reviews || reviews.length === 0) {
                item.innerHTML = `
          <div class="review">
            <p>Chưa có đánh giá nào cho sản phẩm này</p>
          </div>
        `;
                return;
            }

            item.innerHTML = reviews
                .map(
                    (review) => `
           <div class="review">
            <div class="review-header">
              <p class="review-author">${review.username}</p>
              <p class="review-date">${formatDate(review.createdAt)}</p>
            </div>
            <p class="review-rating">
              ${'<i class="ri-star-fill" style="color: #FFD700;"></i>'.repeat(review.rating)}
              ${'<i class="ri-star-line" style="color: #FFD700;"></i>'.repeat(5 - review.rating)}
            </p>
            <p class="review-text">${review.comment}</p>
            <div class="review-images">
              <img src="${review.image}" alt="Ảnh món ăn">
            </div>
           </div>
        `)
                .join("");
        });
    } catch (error) {
        console.error("Lỗi khi tải đánh giá:", error);
    }
}

function formatDate(dateString) {
    const options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
}

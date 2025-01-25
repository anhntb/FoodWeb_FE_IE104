document.addEventListener("DOMContentLoaded", async () => {
    try {
        const foods = await getAllFoods();
        if (foods) {
            const bestSellers = foods.sort((a, b) => b.sold - a.sold).slice(0, 6);

            const container = document.querySelector(".best-seller-container");
            container.innerHTML = bestSellers
                .map(
                    (food) => `
                <div class="best-seller-container__product">
                    <img src="${food.image}" alt="${food.name}">
                    <p class="product-name">
                        <a href="../Chi-tiet-mon-an/Chi-tiet-mon-an.html?id=${
                        food.id
                    }">${food.name}</a>
                    </p>
                    <div class="product-rating">
                        ${'<i class="ri-star-fill"></i>'.repeat(food.rating)}
                        ${'<i class="ri-star-line"></i>'.repeat(
                        5 - food.rating
                    )}
                        <label>${food.sold} đã bán</label>
                    </div>
                    <div class="product-price">
                        <p class="product-price">Giá: ${food.price.toLocaleString(
                        "vi-VN"
                    )}đ</p>
                        <button class="product-cart" onclick="addToCart(${
                        food.id
                    }, 1)">
                            <i class="ri-shopping-basket-line"></i>
                        </button>
                    </div>
                </div>
            `
                )
                .join("");
        }
    } catch (error) {
        console.error("Lỗi khi tải danh sách món ăn bán chạy:", error);
    }
});

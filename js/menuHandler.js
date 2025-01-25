document.addEventListener("DOMContentLoaded", async () => {
    try {
        const foods = await getAllFoods();

        document.querySelectorAll(".dropdown-btn").forEach((btn) => {
            btn.addEventListener("click", function () {
                const dropdown = this.closest(".custom-dropdown");
                dropdown.classList.toggle("open");
            });
        });

        document.querySelectorAll(".dropdown-item").forEach((item) => {
            item.addEventListener("click", function () {
                const value = this.dataset.value;
                console.log("Selected value:", value);
                const dropdown = this.closest(".custom-dropdown");
                dropdown.classList.remove("open");
            });
        });

        document.addEventListener("click", function (e) {
            if (!e.target.closest(".custom-dropdown")) {
                document.querySelector(".custom-dropdown").classList.remove("open");
            }
        });

        const categories = [
            "dryfood",
            "soupyfood",
            "sidedish",
            "dessert",
            "drinks",
        ];
        categories.forEach((category) => {
            const categoryFoods = foods.filter((food) => food.category === category);
            displayFoods(category, categoryFoods);
        });

        setupSortHandlers(foods);
        scrollLinks();
    } catch (error) {
        console.error("Lỗi khi tải danh sách món ăn:", error);
    }
});

function scrollLinks() {
    if (window.location.hash) {
        setTimeout(() => {
            scrollToTarget(window.location.hash.substring(1));
        }, 100);
    }

    document.querySelectorAll(".scroll-link").forEach((link) => {
        link.addEventListener("click", function (e) {
            e.preventDefault();
            const targetId = this.getAttribute("href").split("#")[1];
            scrollToTarget(targetId);
        });
    });
}

function scrollToTarget(targetId) {
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
        const headerHeight = document.querySelector("#header").offsetHeight;
        const targetPosition =
            targetElement.getBoundingClientRect().top + window.scrollY;
        const offset = headerHeight + 150;

        window.scrollTo({
            top: targetPosition - offset,
            behavior: "smooth",
        });
    }
}

function displayFoods(category, foods) {
    const section = document.querySelector(`[data-category="${category}"]`);
    section.innerHTML = foods
        .map((food) => {
            return `
    <div class="product">
      <div class="product-img">
        <img src="${food.image}" alt="${food.name}">
      </div>
      <div class="product-details">
        <p class="product-name">
          <a href="../Chi-tiet-mon-an/Chi-tiet-mon-an.html?id=${food.id}">
          ${food.name}</a>
        </p>
        <div class="product-rating">
          ${'<i class="ri-star-fill" style="color: #FFD700;"></i>'.repeat(
                food.rating
            )}
          ${'<i class="ri-star-line" style="color: #FFD700;"></i>'.repeat(
                5 - food.rating
            )}
          <br>${food.sold} lượt đã bán
          <br>${food.review} đánh giá
        </div>
        <p class="product-price">Giá: ${food.price.toLocaleString("vi-VN")} 
        VND</p>
      </div>
      <button class="product-cart" onclick="addToCart(${food.id}, 1)">
        <i class="ri-shopping-basket-line"></i>
      </button>
    </div>
  `;
        })
        .join("");
}

function setupSortHandlers(foods) {
    const dropdowns = document.querySelectorAll(".custom-dropdown");
    dropdowns.forEach((dropdown) => {
        const btn = dropdown.querySelector(".dropdown-btn");
        const items = dropdown.querySelectorAll(".dropdown-item");

        items.forEach((item) => {
            item.addEventListener("click", function () {
                const value = this.dataset.value;
                const category =
                    this.closest(".Dryfood").nextElementSibling.dataset.category;
                const categoryFoods = [
                    ...foods.filter((food) => food.category === category),
                ];

                btn.textContent = this.textContent;
                btn.appendChild(document.createElement("i")).className =
                    "ri-arrow-down-s-line";

                if (value === "grid") {
                    categoryFoods.sort((a, b) => a.price - b.price);
                } else {
                    categoryFoods.sort((a, b) => b.price - a.price);
                }

                displayFoods(category, categoryFoods);
                dropdown.classList.remove("open");
            });
        });
    });
}

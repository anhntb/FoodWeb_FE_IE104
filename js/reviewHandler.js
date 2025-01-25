const API_URL = "http://localhost:3000/api";

document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const foodId = urlParams.get("foodId");
    const orderId = urlParams.get("orderId");

    if (!foodId || !orderId) {
        alert("Thông tin sản phẩm không hợp lệ");
        window.location.href = "../gio-hang/gio-hang.html";
        return;
    }

    const userId = localStorage.getItem("userId");
    if (!userId) {
        alert("Vui lòng đăng nhập để đánh giá");
        window.location.href = "../dangnhap/dangnhap.html";
        return;
    }

    try {
        const response = await fetch(`${API_URL}/foods/${foodId}`);
        const data = await response.json();

        if (data.success) {
            document.getElementById("product-image").src = data.food.image;
            document.getElementById("product-name").textContent = data.food.name;
            localStorage.setItem("reviewFoodImage", data.food.image);
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error("Lỗi khi lấy thông tin món ăn:", error);
    }

    let selectedRating = 0;
    const stars = document.querySelectorAll(".stars i");

    stars.forEach((star) => {
        star.addEventListener("mouseover", () => {
            const rating = parseInt(star.dataset.rating);
            updateStars(rating);
        });

        star.addEventListener("mouseout", () => {
            updateStars(selectedRating);
        });

        star.addEventListener("click", () => {
            selectedRating = parseInt(star.dataset.rating);
            updateStars(selectedRating);
        });
    });

    function updateStars(rating) {
        stars.forEach((star) => {
            const starRating = parseInt(star.dataset.rating);
            if (starRating <= rating) {
                star.classList.remove("ri-star-line");
                star.classList.add("ri-star-fill");
            } else {
                star.classList.remove("ri-star-fill");
                star.classList.add("ri-star-line");
            }
        });
    }

    const reviewForm = document.getElementById("reviewForm");
    const completeBtn = document.getElementById("btn-complete");
    completeBtn.disabled = true;
    reviewForm.addEventListener("input", () => {
        const reviewContent = document.getElementById("review-content").value;
        const isValidForm = reviewContent !== "" && selectedRating !== 0;
        completeBtn.disabled = !isValidForm;
    });

    reviewForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const reviewContent = document.getElementById("review-content").value;
        const foodImage = localStorage.getItem("reviewFoodImage");

        try {
            const response = await fetch(`${API_URL}/reviews/add`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userId,
                    foodId,
                    orderId,
                    rating: selectedRating,
                    comment: reviewContent,
                    image: foodImage,
                    createdAt: new Date().toISOString(),
                }),
            });

            const data = await response.json();
            if (data.success) {
                localStorage.removeItem("reviewFoodImage");
                window.location.href = "../TrangCaNhan_TT/TrangCaNhan_TT.html";
                alert("Đánh giá thành công!");
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error("Lỗi khi gửi đánh giá:", error);
        }
    });
});

const API_URL = "http://localhost:3000/api";

async function getAllFoods() {
    try {
        const response = await fetch(`${API_URL}/foods`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });
        const data = await response.json();
        if (data.success) {
            return data.foods;
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error("Lỗi khi lấy danh sách món ăn:", error);
    }
}

async function getFoodById(id) {
    try {
        const response = await fetch(`${API_URL}/foods/${id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });
        const data = await response.json();
        if (data.success) {
            return data.food;
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error("Lỗi khi lấy thông tin món ăn:", error);
    }
}

async function addToCart(foodId, quantity) {
    try {
        const userId = localStorage.getItem("userId");
        if (!userId) {
            alert("Vui lòng đăng nhập để thêm vào giỏ hàng!");
            window.location.href = "../dangnhap/dangnhap.html";
            return;
        }

        const response = await fetch(`${API_URL}/cart/add`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                userId: parseInt(userId),
                foodId: parseInt(foodId),
                quantity: parseInt(quantity),
            }),
        });

        const data = await response.json();
        if (data.success) {
            alert("Thêm vào giỏ hàng thành công!");
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error("Lỗi khi thêm vào giỏ hàng:", error);
        alert("Có lỗi xảy ra khi thêm vào giỏ hàng!");
    }
}

async function getCart(userId) {
    try {
        const response = await fetch(`${API_URL}/cart/${userId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Lỗi khi lấy giỏ hàng:", error);
    }
}

async function updateCartQuantity(userId, foodId, quantity) {
    try {
        const response = await fetch(`${API_URL}/cart/update`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({userId, foodId, quantity}),
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Lỗi khi cập nhật giỏ hàng:", error);
    }
}

async function deleteMultipleFromCart(userId, foodIds) {
    try {
        const response = await fetch(`${API_URL}/cart/delete-multiple`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({userId, foodIds}),
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Lỗi khi xóa món ăn khỏi giỏ hàng:", error);
    }
}

const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
const app = express();
const open = require("open");

// Thiết lập transporter để gửi email
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "guimacodeie104@gmail.com",
        pass: "yosqkefxbgcrkrsd",
    },
});

// Cấu hình middleware để xử lý dữ liệu
app.use(
    cors({
        origin: [
            "http://127.0.0.1:5500", // LiveServer Vscode
            "http://localhost:63342", // Intellij nhưng hiện đang bị lỗi
        ],
        methods: ["GET", "POST"],
        credentials: true,
    })
);
app.use(express.json());

// Cấu hình port
const PORT = 3000;
// Khởi động server
app.listen(PORT, () => {
    console.log(`Server started at http://localhost:${PORT}`);
});

// Đường dẫn đến dữ liệu
const dataPath = path.join(__dirname, "../data");

// Hàm để đọc dữ liệu từ file JSON
async function readJSON(filename) {
    const filePath = path.join(dataPath, filename);
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data);
}

// Hàm để ghi dữ liệu vào file JSON
async function writeJSON(filename, data) {
    const filePath = path.join(dataPath, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// Login
app.post("/api/login", async (req, res) => {
    try {
        const {username, password} = req.body;
        const {users} = await readJSON("users.json");

        const user = users.find(
            (item) => item.username === username && item.password === password
        );

        if (user) {
            res.json({
                success: true,
                user: {
                    id: user.id,
                    username: user.username,
                },
            });
        } else {
            res.status(401).json({
                success: false,
                message: "Sai tên đăng nhập hoặc mật khẩu",
            });
        }
    } catch (error) {
        console.error("Lỗi khi đăng nhập:", error);
        res.status(500).json({success: false, message: "Lỗi khi đăng nhập"});
    }
});

// Register
app.post("/api/register", async (req, res) => {
    try {
        const {username, password, email} = req.body;

        const data = await readJSON("users.json");

        if (data.users.find((item) => item.username === username)) {
            return res.status(400).json({
                success: false,
                message: "Tên đăng nhập đã tồn tại",
            });
        }

        if (data.users.find((item) => item.email === email)) {
            return res.status(400).json({
                success: false,
                message: "Email đã tồn tại",
            });
        }

        const newUser = {
            id: data.users.length + 1,
            username,
            password,
            email,
        };

        data.users.push(newUser);
        await writeJSON("users.json", data);

        res.json({
            success: true,
            message: "Đăng ký thành công",
        });
    } catch (error) {
        res.status(500).json({success: false, message: "Lỗi server"});
    }
});

// Gửi mã xác nhận
const resetCodes = new Map();
app.post("/api/forgot-password", async (req, res) => {
    try {
        const {email} = req.body;
        const data = await readJSON("users.json");
        const user = data.users.find((item) => item.email === email);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Tài khoản không tồn tại",
            });
        }

        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

        resetCodes.set(email, {
            code: resetCode,
            expiry: Date.now() + 300000, // 5 phút
        });

        const mailOptions = {
            from: "guimacodeie104@gmail.com",
            to: email,
            subject: "Mã xác nhận đặt lại mật khẩu, hết hạn sau 5 phút",
            text: resetCode,
        };

        try {
            await transporter.sendMail(mailOptions);
            res.json({
                success: true,
                message: "Mã xác nhận đã được gửi đến email của bạn",
            });
        } catch (emailError) {
            console.error("Lỗi khi gửi email:", emailError);
            res.status(500).json({
                success: false,
                message: "Lỗi khi gửi email",
            });
        }
    } catch (error) {
        console.error("Lỗi khi gửi email:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi khi gửi email",
        });
    }
});

// Xác thực mã xác nhận
app.post("/api/verify-code", async (req, res) => {
    try {
        const {email, code} = req.body;
        const resetData = resetCodes.get(email);

        if (!resetData || resetData.code !== code) {
            return res.status(400).json({
                success: false,
                message: "Mã xác nhận không đúng",
            });
        }

        if (Date.now() > resetData.expiry) {
            resetCodes.delete(email);
            return res.status(400).json({
                success: false,
                message: "Mã xác nhận đã hết hạn",
            });
        }

        res.json({
            success: true,
            message: "Mã xác nhận hợp lệ",
        });
    } catch (error) {
        console.error("Lỗi khi xác nhận mã:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi khi xác nhận mã",
        });
    }
});

// Reset Password
app.post("/api/reset-password", async (req, res) => {
    try {
        const {email, newPassword} = req.body;

        const data = await readJSON("users.json");
        const user = data.users.find((item) => item.email === email);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy người dùng",
            });
        }

        user.password = newPassword;
        await writeJSON("users.json", data);

        res.json({
            success: true,
            message: "Đã cập nhật mật khẩu mới",
        });
    } catch (error) {
        console.error("Lỗi khi cập nhật mật khẩu:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi khi cập nhật mật khẩu",
        });
    }
});

// Cập nhật thông tin cá nhân người dùng
app.post("/api/update-info", async (req, res) => {
    try {
        const {userId, fullName, phone, birthday, gender} = req.body;
        const data = await readJSON("users.json");
        const user = data.users.find((item) => item.id === userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy người dùng",
            });
        }

        user.profile = {
            fullName,
            phone,
            birthday,
            gender,
        };

        await writeJSON("users.json", data);

        res.json({
            success: true,
            message: "Đã cập nhật thông tin cá nhân",
        });
    } catch (error) {
        console.error("Lỗi khi cập nhật thông tin cá nhân:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi khi cập nhật thông tin cá nhân",
        });
    }
});

// Lấy thông tin cá nhân người dùng
app.get("/api/get-info/:userId", async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const data = await readJSON("users.json");
        const user = data.users.find((item) => item.id === parseInt(userId));

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy người dùng",
            });
        }

        res.json({
            success: true,
            profile: user.profile || null,
            email: user.email,
            username: user.username,
            avatar: user.avatar,
        });
    } catch (error) {
        console.error("Lỗi khi lấy thông tin cá nhân:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi khi lấy thông tin cá nhân",
        });
    }
});

// Lấy tất cả món ăn
app.get("/api/foods", async (req, res) => {
    try {
        const data = await readJSON("foods.json");
        res.json({
            success: true,
            foods: data.foods,
        });
    } catch (error) {
        console.error("Lỗi khi lấy tất cả món ăn:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi khi lấy tất cả món ăn",
        });
    }
});

// Lấy món ăn theo ID
app.get("/api/foods/:id", async (req, res) => {
    try {
        const foodId = parseInt(req.params.id);
        const foodsData = await readJSON("foods.json");
        const reviewsData = await readJSON("reviews.json");
        const food = foodsData.foods.find((item) => item.id === foodId);
        const reviews = reviewsData.reviews.filter(
            (item) => item.foodId === foodId
        );

        if (!food) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy món ăn",
            });
        }

        food.rating = calculateAverageRating(reviews);
        food.review = reviews.length;

        const usersData = await readJSON("users.json");
        const reviewUser = reviews.map((review) => {
            const user = usersData.users.find((item) => item.id === review.userId);
            return {
                ...review,
                avatar: user.avatar,
            };
        });

        res.json({
            success: true,
            food: {...food, reviews: reviewUser},
        });
    } catch (error) {
        console.error("Lỗi khi lấy món ăn:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi khi lấy món ăn",
        });
    }
});

// Thêm món ăn vào giỏ hàng
app.post("/api/cart/add", async (req, res) => {
    try {
        const {userId, foodId, quantity} = req.body;
        const cartData = await readJSON("cart.json");
        const foodData = await readJSON("foods.json");

        const food = foodData.foods.find((item) => item.id === foodId);
        if (!food) {
            return res.json({
                success: false,
                message: "Không tìm thấy món ăn",
            });
        }

        let userCart = cartData.carts.find((item) => item.userId === userId);

        if (!userCart) {
            userCart = {
                userId,
                foods: [],
            };
            cartData.carts.push(userCart);
        }

        const existingItem = userCart.foods.find((item) => item.foodId === foodId);

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            userCart.foods.push({
                foodId,
                quantity,
                name: food.name,
                price: food.price,
                image: food.image,
            });
        }

        await writeJSON("cart.json", cartData);

        res.json({
            success: true,
            message: "Thêm vào giỏ hàng thành công",
        });
    } catch (error) {
        console.error("Lỗi khi thêm vào giỏ hàng:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi khi thêm vào giỏ hàng",
        });
    }
});

// Lấy giỏ hàng của người dùng
app.get("/api/cart/:userId", async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const cartData = await readJSON("cart.json");
        const userCart = cartData.carts.find((item) => item.userId === userId);

        if (!userCart) {
            return res.json({
                success: true,
                cart: {
                    userId: userId,
                    items: [],
                },
            });
        }

        res.json({
            success: true,
            cart: userCart,
        });
    } catch (error) {
        console.error("Lỗi khi lấy giỏ hàng:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi khi lấy giỏ hàng",
        });
    }
});

// Xử lý cập nhật số lượng của món ăn trong giỏ hàng
app.post("/api/cart/update", async (req, res) => {
    try {
        const {userId, foodId, quantity} = req.body;

        const parsedUserId = parseInt(userId);
        const parsedFoodId = parseInt(foodId);
        const parsedQuantity = parseInt(quantity);

        const cartData = await readJSON("cart.json");
        const userCart = cartData.carts.find(
            (item) => item.userId === parsedUserId
        );

        if (!userCart) {
            return res.json({
                success: false,
                message: "Không tìm thấy giỏ hàng",
            });
        }

        const cartItem = userCart.foods.find(
            (item) => item.foodId === parsedFoodId
        );

        if (!cartItem) {
            return res.json({
                success: false,
                message: "Không tìm thấy món ăn trong giỏ hàng",
            });
        }

        cartItem.quantity = parsedQuantity;
        await writeJSON("cart.json", cartData);

        res.json({
            success: true,
            message: "Cập nhật số lượng thành công",
        });
    } catch (error) {
        console.error("Lỗi khi cập nhật số lượng:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi khi cập nhật số lượng",
        });
    }
});

// Xóa các món ăn trong giỏ hàng
app.post("/api/cart/delete-multiple", async (req, res) => {
    try {
        const {userId, foodIds} = req.body;
        const cartData = await readJSON("cart.json");

        const userCart = cartData.carts.find(
            (item) => item.userId === parseInt(userId)
        );
        if (!userCart) {
            return res.json({
                success: false,
                message: "Không tìm thấy giỏ hàng",
            });
        }

        userCart.foods = userCart.foods.filter(
            (item) => !foodIds.includes(item.foodId.toString())
        );

        await writeJSON("cart.json", cartData);

        res.json({
            success: true,
            message: "Xóa thành công",
        });
    } catch (error) {
        console.error("Lỗi khi xóa món ăn khỏi giỏ hàng:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi khi xóa món ăn khỏi giỏ hàng",
        });
    }
});

// Cập nhật số lượng còn lại và số lượng đã bán của món ăn
app.post("/api/update-inventory", async (req, res) => {
    try {
        const {items} = req.body;
        const foodsData = await readJSON("foods.json");

        items.forEach((item) => {
            const food = foodsData.foods.find((f) => f.id === parseInt(item.foodId));
            if (food) {
                food.remain -= item.quantity;
                food.sold += item.quantity;
            }
        });

        await writeJSON("foods.json", foodsData);

        res.json({
            success: true,
            message: "Cập nhật số lượng thành công",
        });
    } catch (error) {
        console.error("Lỗi khi cập nhật số lượng:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi khi cập nhật số lượng",
        });
    }
});

// Lấy danh sách voucher của người dùng
app.get("/api/vouchers/:userId", async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const vouchersData = await readJSON("vouchers.json");
        const userVouchersData = await readJSON("user_vouchers.json");

        const userVoucherList = userVouchersData.userVouchers.find(
            (item) => item.userId === userId
        );

        if (!userVoucherList) {
            return res.json({
                success: true,
                vouchers: [],
            });
        }

        const userVouchers = userVoucherList.vouchers
            .map((voucherId) => {
                return vouchersData.vouchers.find((item) => item.id === voucherId);
            })
            .filter((voucher) => voucher !== undefined);

        const activeVouchers = userVouchers.filter((voucher) => {
            const isExpired = new Date(voucher.expiredDate) < new Date();
            return voucher.status === "active" && !isExpired;
        });

        res.json({
            success: true,
            vouchers: activeVouchers,
        });
    } catch (error) {
        console.error("Lỗi khi lấy danh sách voucher của người dùng:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi khi lấy danh sách voucher của người dùng",
        });
    }
});

// Lấy tất cả voucher còn có thể sử dụng
app.get("/api/vouchers", async (req, res) => {
    try {
        const vouchersData = await readJSON("vouchers.json");

        const activeVouchers = vouchersData.vouchers.filter((voucher) => {
            const isExpired = new Date(voucher.expiredDate) < new Date();
            return voucher.status === "active" && !isExpired;
        });

        res.json({
            success: true,
            vouchers: activeVouchers,
        });
    } catch (error) {
        console.error("Lỗi khi lấy danh sách voucher:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi khi lấy danh sách voucher",
        });
    }
});

// Lấy theo dõi đơn hàng của người dùng
app.get("/api/order-history/:userId", async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const ordersData = await readJSON("orders.json");

        if (!ordersData || !ordersData.orders) {
            return res.json({
                success: true,
                orderHistory: [],
            });
        }

        const userOrders = ordersData.orders.filter(
            (item) => item.userId === userId
        );

        res.json({
            success: true,
            orderHistory: userOrders,
        });
    } catch (error) {
        console.error("Lỗi khi lấy lịch sử đơn hàng:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi khi lấy lịch sử đơn hàng",
        });
    }
});

// Thêm đơn hàng vào theo dõi đơn hàng khi thanh toán thành công
app.post("/api/orders/add", async (req, res) => {
    try {
        const {userId, items, orderDate, status, totalAmount} = req.body;
        const ordersData = await readJSON("orders.json");

        const newOrder = {
            id: ordersData.orders.length + 1,
            userId,
            items,
            orderDate,
            status,
            totalAmount,
        };

        ordersData.orders.push(newOrder);
        await writeJSON("orders.json", ordersData);

        res.json({
            success: true,
            message: "Đã thêm đơn hàng thành công",
        });
    } catch (error) {
        console.error("Lỗi khi thêm đơn hàng:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi khi thêm đơn hàng",
        });
    }
});

// Thêm đánh giá cho món ăn
app.post("/api/reviews/add", async (req, res) => {
    try {
        const {userId, foodId, orderId, rating, comment, image, createdAt} =
            req.body;

        const reviewsData = await readJSON("reviews.json");
        const foodsData = await readJSON("foods.json");

        const existingReview = reviewsData.reviews.find(
            (item) =>
                item.userId === parseInt(userId) &&
                item.foodId === parseInt(foodId) &&
                item.orderId === parseInt(orderId)
        );

        if (existingReview) {
            return res.json({
                success: false,
                message: "Bạn đã đánh giá món ăn này trong đơn hàng rồi",
            });
        }

        const newReview = {
            id: reviewsData.reviews.length + 1,
            userId: parseInt(userId),
            foodId: parseInt(foodId),
            orderId: parseInt(orderId),
            rating,
            comment,
            image,
            createdAt,
        };
        reviewsData.reviews.push(newReview);

        const food = foodsData.foods.find((item) => item.id === parseInt(foodId));
        if (food) {
            const foodReviews = reviewsData.reviews.filter(
                (item) => item.foodId === parseInt(foodId)
            );
            const totalRating = foodReviews.reduce(
                (sum, item) => sum + item.rating,
                0
            );
            food.rating = Math.round(totalRating / foodReviews.length);
            food.review = foodReviews.length;
        }

        await writeJSON("reviews.json", reviewsData);
        await writeJSON("foods.json", foodsData);

        res.json({
            success: true,
            message: "Đánh giá thành công",
        });
    } catch (error) {
        console.error("Lỗi khi thêm đánh giá:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi khi thêm đánh giá",
        });
    }
});

// Lấy danh sách đánh giá của món ăn
app.get("/api/reviews/:foodId", async (req, res) => {
    try {
        const foodId = req.params.foodId;
        const reviewsData = await readJSON("reviews.json");
        const usersData = await readJSON("users.json");

        const foodReviews = reviewsData.reviews
            .filter((item) => item.foodId.toString() === foodId)
            .map((item) => {
                const user = usersData.users.find((u) => u.id === item.userId);
                return {
                    ...item,
                    username: user.username,
                };
            });

        res.json({
            success: true,
            reviews: foodReviews,
        });
    } catch (error) {
        console.error("Lỗi khi lấy danh sách đánh giá:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi khi lấy danh sách đánh giá",
        });
    }
});

// Sử dụng voucher khi thanh toán
app.post("/api/vouchers/use", async (req, res) => {
    try {
        const {userId, voucherId} = req.body;
        const userVouchersData = await readJSON("user_vouchers.json");

        const userVoucherIndex = userVouchersData.userVouchers.findIndex(
            (item) => item.userId === userId
        );

        if (userVoucherIndex !== -1) {
            const voucherIndex =
                userVouchersData.userVouchers[userVoucherIndex].vouchers.indexOf(
                    voucherId
                );
            if (voucherIndex !== -1) {
                userVouchersData.userVouchers[userVoucherIndex].vouchers.splice(
                    voucherIndex,
                    1
                );
                await writeJSON("user_vouchers.json", userVouchersData);
            }
        }

        res.json({
            success: true,
            message: "Đã cập nhật trạng thái voucher",
        });
    } catch (error) {
        console.error("Lỗi khi cập nhật trạng thái voucher:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi khi cập nhật trạng thái voucher",
        });
    }
});

// Tính điểm đánh giá trung bình
function calculateAverageRating(reviews) {
    if (!reviews || reviews.length === 0) return 0;
    const sum = reviews.reduce((total, review) => total + review.rating, 0);
    return Math.round(sum / reviews.length);
}

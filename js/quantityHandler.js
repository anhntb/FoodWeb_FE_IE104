function setupQuantityHandlers(container, onQuantityChange) {
    const quantityInput = container.querySelector(".quantity-value");
    const minusBtn = container.querySelector(".minus");
    const plusBtn = container.querySelector(".plus");

    function updateQuantity(value) {
        const foodId = container.closest(".cart-item").dataset.foodId;
        const storedCart = JSON.parse(localStorage.getItem("cartItems")) || {};
        storedCart[foodId] = value;
        localStorage.setItem("cartItems", JSON.stringify(storedCart));
        quantityInput.value = value;
        onQuantityChange(value);
    }

    quantityInput.addEventListener("input", function () {
        let value = parseInt(this.value) || 1;
        if (value < 1) value = 1;
        updateQuantity(value);
    });

    minusBtn.addEventListener("click", () => {
        let value = parseInt(quantityInput.value);
        if (value > 1) {
            value--;
            updateQuantity(value);
        }
    });

    plusBtn.addEventListener("click", () => {
        let value = parseInt(quantityInput.value);
        value++;
        updateQuantity(value);
    });
}

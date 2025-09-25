document.addEventListener('DOMContentLoaded', async function() {
    const navbar = document.querySelector('.navbar');
    let lastScrollTop = 0;

    // Navbar hide/show on scroll
    window.addEventListener('scroll', function() {
        let currentScroll = window.pageYOffset || document.documentElement.scrollTop;
        if (currentScroll > 100) {
            if (currentScroll > lastScrollTop) {
                navbar.classList.add('hidden');
            } else {
                navbar.classList.remove('hidden');
            }
        }
        lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;

        // Trigger animations
        const animatedSections = document.querySelectorAll('section.animate__animated[data-animation]');
        animatedSections.forEach(section => {
            const rect = section.getBoundingClientRect();
            const windowHeight = window.innerHeight || document.documentElement.clientHeight;
            if (rect.top >= 0 && rect.top < windowHeight - 100 && !section.classList.contains('animated-once')) {
                section.classList.add('animate__animated', `animate__${section.getAttribute('data-animation')}`);
                section.classList.add('animated-once');
                section.removeAttribute('data-animation');
            }
        });
    }, false);

    // Trigger initial animations
    const initialAnimatedSections = document.querySelectorAll('section.animate__animated[data-animation]');
    initialAnimatedSections.forEach(section => {
        const rect = section.getBoundingClientRect();
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;
        if (rect.top >= 0 && rect.top < windowHeight - 100 && !section.classList.contains('animated-once')) {
            section.classList.add('animate__animated', `animate__${section.getAttribute('data-animation')}`);
            section.classList.add('animated-once');
            section.removeAttribute('data-animation');
        }
    });

    // ---------------- Fetch and Display Products ----------------
    const productsContainer = document.getElementById('dynamic-product-grid');
    const loadingElement = document.getElementById('products-loading');
    const errorElement = document.getElementById('products-error');

    try {
        const productsResponse = await fetch('http://localhost:8080/api/products', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}` }
        });

        if (!productsResponse.ok) throw new Error('Failed to fetch products');

        const products = await productsResponse.json();
        loadingElement.style.display = 'none';

        if (products && products.length > 0) {
            productsContainer.innerHTML = products.map(product => {
                const priceNumber = Number(product.price);
                const formattedPrice = priceNumber ? `NPR ${priceNumber.toFixed(2)}` : 'Price on request';

                return `
                <div class="product-card animate__animated" data-animation="fadeInUp">
                    <img src="${product.imageUrl}" alt="${product.title}" class="product-image">
                    <div class="product-details">
                        <div class="product-price">${formattedPrice}</div>
                        <div class="product-description">${product.description}</div>
                        <div class="product-actions">
                            <a href="productdetail.html?productId=${product.id}" class="shop-btn view-details">View Details</a>
                            <button class="shop-btn add-to-cart"
                                data-product-id="${product.id}"
                                data-product-name="${product.title}"
                                data-product-price="${priceNumber || 0}"
                                data-product-image="${product.imageUrl}">
                                Add to Cart
                            </button>
                        </div>
                    </div>
                </div>
                `;
            }).join('');

            initializeAddToCartButtons();
        } else {
            productsContainer.innerHTML = '<div class="text-center w-100"><p>No products available at the moment.</p></div>';
        }
    } catch (err) {
        console.error('Error loading products:', err);
        loadingElement.style.display = 'none';
        errorElement.style.display = 'block';
    }

    // ---------------- Cart Management ----------------
    let cart = [];

    async function loadCart() {
        const token = localStorage.getItem('authToken');
        if (!token) return;

        try {
            const res = await fetch('http://localhost:8080/api/cart', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to load cart');
            const data = await res.json();

            if (data.success) {
                cart = data.cart.map(item => ({
                    id: item.id,
                    productId: item.product.id,
                    name: item.product.title,
                    price: parseFloat(item.product.price),
                    quantity: item.quantity,
                    image: item.product.imageUrl
                }));
                updateCartDisplay();
            }
        } catch (err) {
            console.error('Failed to load cart', err);
        }
    }

    function updateCartDisplay() {
        const cartItemsContainer = document.getElementById('cart-items');
        const cartCountBadge = document.getElementById('cart-count');
        const cartTotalElement = document.getElementById('cart-total');

        cartItemsContainer.innerHTML = '';
        let total = 0;
        cart.forEach((item, index) => {
            total += item.price * item.quantity;
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item d-flex align-items-center mb-3 p-3 border-bottom';
            cartItem.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="cart-item-image me-3" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;">
                <div class="cart-item-details flex-grow-1">
                    <h6 class="mb-1">${item.name}</h6>
                    <p class="mb-1 text-secondary">Rs. ${item.price.toLocaleString()}</p>
                    <div class="cart-quantity d-flex align-items-center">
                        <button class="btn btn-sm btn-outline-secondary cart-quantity-btn" data-action="decrease" data-index="${index}">-</button>
                        <input type="number" class="form-control form-control-sm mx-2 cart-quantity-input" value="${item.quantity}" min="1" style="width: 60px; text-align: center;" data-index="${index}">
                        <button class="btn btn-sm btn-outline-secondary cart-quantity-btn" data-action="increase" data-index="${index}">+</button>
                    </div>
                </div>
                <button class="btn btn-sm btn-outline-danger ms-3 cart-remove-btn" data-index="${index}"><i class="fas fa-trash"></i></button>
            `;
            cartItemsContainer.appendChild(cartItem);
        });

        cartCountBadge.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartTotalElement.textContent = `Rs. ${total.toLocaleString()}`;
    }

    function initializeAddToCartButtons() {
        const addToCartButtons = document.querySelectorAll('.add-to-cart');
        addToCartButtons.forEach(button => {
            button.addEventListener('click', async () => {
                const token = localStorage.getItem('authToken');
                if (!token) {
                    showToast('Please log in first to add items to your cart.', 'error');
                    setTimeout(() => window.location.href = '/login.html', 1000);
                    return;
                }

                const productId = button.dataset.productId;
                const quantity = 1;

                try {
                    const res = await fetch('http://localhost:8080/api/cart/add', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ productId, quantity })
                    });

                    const data = await res.json();
                    if (data.success) {
                        await loadCart();
                        showToast('Item added to cart!', 'success');
                        const cartOffcanvas = new bootstrap.Offcanvas(document.getElementById('cartOffcanvas'));
                        cartOffcanvas.show();
                    } else {
                        showToast(data.message || 'Failed to add item.', 'error');
                    }
                } catch (err) {
                    console.error('Add to cart failed', err);
                    showToast('Add to cart failed!', 'error');
                }
            });
        });
    }

    // Cart quantity and remove handlers
    const cartItemsContainer = document.getElementById('cart-items');
    cartItemsContainer.addEventListener('click', async (e) => {
        const token = localStorage.getItem('authToken');
        if (!token) return;

        if (e.target.closest('.cart-quantity-btn')) {
            const button = e.target.closest('.cart-quantity-btn');
            const index = parseInt(button.dataset.index);
            const action = button.dataset.action;
            let newQty = cart[index].quantity;
            if (action === 'increase') newQty++;
            else if (action === 'decrease' && newQty > 1) newQty--;
            const productId = cart[index].productId;

            try {
                await fetch('http://localhost:8080/api/cart/update', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ productId, quantity: newQty })
                });
                await loadCart();
            } catch (err) {
                console.error('Failed to update cart', err);
            }
        } else if (e.target.closest('.cart-remove-btn')) {
            const index = parseInt(e.target.closest('.cart-remove-btn').dataset.index);
            const productId = cart[index].productId;

            try {
                await fetch(`http://localhost:8080/api/cart/remove/${productId}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                await loadCart();
            } catch (err) {
                console.error('Failed to remove cart item', err);
            }
        }
    });

    cartItemsContainer.addEventListener('change', async (e) => {
        if (e.target.classList.contains('cart-quantity-input')) {
            const index = parseInt(e.target.dataset.index);
            const value = parseInt(e.target.value);
            if (value >= 1) {
                const token = localStorage.getItem('authToken');
                if (!token) return;
                const productId = cart[index].productId;

                try {
                    await fetch('http://localhost:8080/api/cart/update', {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ productId, quantity: value })
                    });
                    await loadCart();
                } catch (err) {
                    console.error('Failed to update cart', err);
                    e.target.value = cart[index].quantity;
                }
            } else {
                e.target.value = cart[index].quantity;
            }
        }
    });

    // Checkout modal
    document.getElementById('checkout-btn').addEventListener('click', () => {
        if (cart.length === 0) {
            showToast('Your cart is empty!', 'error');
            return;
        }
        const checkoutModal = new bootstrap.Modal(document.getElementById('checkoutModal'));
        checkoutModal.show();
    });

    // Order placement
    document.getElementById('placeOrder').addEventListener('click', async () => {
        const name = document.getElementById('name').value;
        const address = document.getElementById('address').value;
        const phone = document.getElementById('phone').value;
        const paymentMethod = document.querySelector('input[name="payment"]:checked')?.value;

        if (!name || !address || !phone || !paymentMethod) {
            showToast('Please fill all required fields.', 'error');
            return;
        }

        const token = localStorage.getItem('authToken');
        if (!token) {
            showToast('Please log in to place order.', 'error');
            return;
        }

        try {
            const res = await fetch('http://localhost:8080/api/orders/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    customerName: name,
                    customerPhone: phone,
                    deliveryAddress: address,
                    paymentMethod: paymentMethod
                })
            });

            const data = await res.json();
            if (data.success) {
                showToast(`Order placed successfully! Order #${data.orderNumber}`, 'success');
                cart = [];
                updateCartDisplay();
                document.getElementById('name').value = '';
                document.getElementById('address').value = '';
                document.getElementById('phone').value = '';
                bootstrap.Modal.getInstance(document.getElementById('checkoutModal')).hide();
                bootstrap.Offcanvas.getInstance(document.getElementById('cartOffcanvas')).hide();
            } else {
                showToast(data.message || 'Failed to place order.', 'error');
            }
        } catch (err) {
            console.error('Order failed:', err);
            showToast('Failed to place order. Please try again.', 'error');
        }
    });

    // Initialize cart display
    await loadCart();
});

// ---------------- Toast ----------------
function showToast(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast-message ${type}`;
    toast.style.cssText = `
        background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#ffc107'};
        color: #fff;
        padding: 12px 20px;
        margin-top: 10px;
        border-radius: 8px;
        box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        opacity: 0;
        transform: translateY(-20px);
        transition: all 0.5s ease;
        min-width: 200px;
        font-weight: 500;
    `;
    toast.textContent = message;
    container.appendChild(toast);

    requestAnimationFrame(() => {
        toast.style.opacity = 1;
        toast.style.transform = 'translateY(0)';
    });

    setTimeout(() => {
        toast.style.opacity = 0;
        toast.style.transform = 'translateY(-20px)';
        toast.addEventListener('transitionend', () => toast.remove());
    }, duration);
}

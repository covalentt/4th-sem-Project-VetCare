document.addEventListener('DOMContentLoaded', async function() {
    const navbar = document.querySelector('.navbar');
    let lastScrollTop = 0;
    let cart = [];
    let currentProduct = null;

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
    }, false);

    // Get product ID from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('productId');

    // ---------------- Load Product Details ----------------
    if (productId) {
        try {
            // First try to get all products and find the specific one
            const productsResponse = await fetch('http://localhost:8080/api/products', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}` }
            });

            if (productsResponse.ok) {
                const products = await productsResponse.json();
                currentProduct = products.find(p => p.id.toString() === productId.toString());

                if (currentProduct) {
                    populateProductDetails(currentProduct);
                    // Load related products (exclude current product)
                    const relatedProducts = products.filter(p => p.id !== currentProduct.id).slice(0, 4);
                    populateRelatedProducts(relatedProducts);
                } else {
                    // Product not found, use default/static content
                    console.log('Product not found in API, using static content');
                    setDefaultProductContent();
                }
            } else {
                // API call failed, use static content
                console.log('API call failed, using static content');
                setDefaultProductContent();
            }
        } catch (err) {
            console.error('Error loading product:', err);
            // On error, use static content instead of redirecting
            setDefaultProductContent();
        }
    } else {
        // No productId parameter, use static content
        setDefaultProductContent();
    }

    // ---------------- Cart Management ----------------
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

    // ---------------- Product Detail Functions ----------------
    function populateProductDetails(product) {
        // Update page title
        document.title = `${product.title} | Vet Care Nepal`;

        // Update section header
        const sectionHeader = document.querySelector('.section-header h2');
        const sectionSubtitle = document.querySelector('.section-header .section-subtitle');
        if (sectionHeader) sectionHeader.textContent = product.title;
        if (sectionSubtitle) sectionSubtitle.textContent = product.description || 'Premium quality product for your pet';

        // Update main product image
        const mainImage = document.getElementById('main-product-image');
        if (mainImage) {
            mainImage.src = product.imageUrl;
            mainImage.alt = product.title;
        }

        // Update thumbnails (use same image for now, will be enhanced when you add multiple images)
        const thumbnails = document.querySelectorAll('.product-thumbnail');
        thumbnails.forEach(thumbnail => {
            thumbnail.setAttribute('data-image', product.imageUrl);
            const img = thumbnail.querySelector('img');
            if (img) {
                img.src = product.imageUrl;
                img.alt = product.title;
            }
        });

        // Update product info
        const priceNumber = Number(product.price);
        const formattedPrice = priceNumber ? `Rs. ${priceNumber.toLocaleString()}` : 'Price on request';
        const priceElement = document.querySelector('.product-price');
        if (priceElement) priceElement.textContent = formattedPrice;

        // Update description
        const descriptionText = document.querySelector('.product-description p');
        if (descriptionText) {
            descriptionText.textContent = product.description || 'High-quality product designed for your pet\'s comfort and well-being.';
        }

        // Update meta information
        const metaItems = document.querySelectorAll('.meta-item');
        if (metaItems[0]) {
            const metaValue = metaItems[0].querySelector('.meta-value');
            if (metaValue) metaValue.textContent = `In Stock (${product.stock || 12} items)`;
        }
        if (metaItems[1]) {
            const metaValue = metaItems[1].querySelector('.meta-value');
            if (metaValue) metaValue.textContent = `${product.sku || 'PET-' + product.id}`;
        }
        if (metaItems[2]) {
            const metaValue = metaItems[2].querySelector('.meta-value');
            if (metaValue) metaValue.textContent = product.category || 'Pet Products';
        }

        // Update tab content
        updateTabContent(product);
    }

    function setDefaultProductContent() {
        // Set default static content when API fails or product not found
        currentProduct = {
            id: 'static',
            title: 'Pet Comfort Bed',
            price: 2499,
            description: 'Premium comfort for your furry friend',
            imageUrl: '/image/petcomfortbedbrown.jpg',
            category: 'Pet Furniture',
            stock: 12
        };
        populateProductDetails(currentProduct);
    }

    function updateTabContent(product) {
        // Update description tab
        const descriptionTab = document.querySelector('#description');
        if (descriptionTab) {
            const descriptionTitle = descriptionTab.querySelector('h3');
            const descriptionContent = descriptionTab.querySelector('p');

            if (descriptionTitle) descriptionTitle.textContent = `${product.title} Details`;
            if (descriptionContent) {
                descriptionContent.textContent = product.description || 'Premium quality product designed specifically for your pet\'s needs.';
            }
        }

        // Update specifications tab
        const specificationsTab = document.querySelector('#specifications');
        if (specificationsTab) {
            const specsList = specificationsTab.querySelector('.specifications-list');
            if (specsList) {
                specsList.innerHTML = `
                    <li>
                        <div class="spec-label">Product Name</div>
                        <div class="spec-value">${product.title}</div>
                    </li>
                    <li>
                        <div class="spec-label">Price</div>
                        <div class="spec-value">Rs. ${Number(product.price).toLocaleString()}</div>
                    </li>
                    <li>
                        <div class="spec-label">Category</div>
                        <div class="spec-value">${product.category || 'Pet Products'}</div>
                    </li>
                    <li>
                        <div class="spec-label">SKU</div>
                        <div class="spec-value">${product.sku || 'PET-' + product.id}</div>
                    </li>
                    <li>
                        <div class="spec-label">Availability</div>
                        <div class="spec-value">In Stock (${product.stock || 12} items)</div>
                    </li>
                    <li>
                        <div class="spec-label">Care Instructions</div>
                        <div class="spec-value">Follow manufacturer's guidelines for optimal use</div>
                    </li>
                    <li>
                        <div class="spec-label">Country of Origin</div>
                        <div class="spec-value">Nepal</div>
                    </li>
                    <li>
                        <div class="spec-label">Warranty</div>
                        <div class="spec-value">1 year warranty on manufacturing defects</div>
                    </li>
                `;
            }
        }

        // Reviews tab keeps its static content for now
    }

    function populateRelatedProducts(products) {
        const relatedProductsContainer = document.querySelector('.related-products');
        if (!relatedProductsContainer || products.length === 0) return;

        relatedProductsContainer.innerHTML = products.map(product => {
            const priceNumber = Number(product.price);
            const formattedPrice = priceNumber ? `Rs. ${priceNumber.toLocaleString()}` : 'Price on request';

            return `
                <div class="shop-card">
                    <div class="product-image">
                        <img src="${product.imageUrl}" alt="${product.title}">
                    </div>
                    <h4>${product.title}</h4>
                    <div class="product-price">${formattedPrice}</div>
                    <a href="productdetail.html?productId=${product.id}" class="shop-btn">View Product</a>
                </div>
            `;
        }).join('');
    }

    // ---------------- Product Interactions ----------------

    // Thumbnail Image Switching
    const thumbnails = document.querySelectorAll('.product-thumbnail');
    const mainImage = document.getElementById('main-product-image');

    thumbnails.forEach(thumbnail => {
        thumbnail.addEventListener('click', function() {
            thumbnails.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            const newImageSrc = this.getAttribute('data-image');
            if (mainImage && newImageSrc) {
                mainImage.src = newImageSrc;
            }
        });
    });

    // Quantity Input Handling
    const decreaseBtn = document.getElementById('decrease-quantity');
    const increaseBtn = document.getElementById('increase-quantity');
    const quantityInput = document.getElementById('quantity');

    if (decreaseBtn && increaseBtn && quantityInput) {
        decreaseBtn.addEventListener('click', () => {
            let value = parseInt(quantityInput.value);
            if (value > 1) {
                quantityInput.value = value - 1;
            }
        });

        increaseBtn.addEventListener('click', () => {
            let value = parseInt(quantityInput.value);
            quantityInput.value = value + 1;
        });
    }

    // Add to Cart
    const addToCartBtn = document.getElementById('add-to-cart');
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', async () => {
            const token = localStorage.getItem('authToken');
            if (!token) {
                showToast('Please log in first to add items to your cart.', 'error');
                setTimeout(() => window.location.href = '/login.html', 1000);
                return;
            }

            if (!currentProduct || currentProduct.id === 'static') {
                showToast('Product information not available for cart.', 'error');
                return;
            }

            const quantity = parseInt(quantityInput?.value || 1);

            try {
                const res = await fetch('http://localhost:8080/api/cart/add', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ productId: currentProduct.id, quantity })
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
    }

    // Buy Now
    const buyNowBtn = document.getElementById('buy-now');
    if (buyNowBtn) {
        buyNowBtn.addEventListener('click', async () => {
            const token = localStorage.getItem('authToken');
            if (!token) {
                showToast('Please log in first to make a purchase.', 'error');
                setTimeout(() => window.location.href = '/login.html', 1000);
                return;
            }

            if (!currentProduct || currentProduct.id === 'static') {
                showToast('Product information not available for purchase.', 'error');
                return;
            }

            // Add to cart first, then open checkout
            const quantity = parseInt(quantityInput?.value || 1);
            try {
                const res = await fetch('http://localhost:8080/api/cart/add', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ productId: currentProduct.id, quantity })
                });

                const data = await res.json();
                if (data.success) {
                    await loadCart();
                    const checkoutModal = new bootstrap.Modal(document.getElementById('checkoutModal'));
                    checkoutModal.show();
                } else {
                    showToast(data.message || 'Failed to proceed to checkout.', 'error');
                }
            } catch (err) {
                console.error('Buy now failed', err);
                showToast('Failed to proceed to checkout!', 'error');
            }
        });
    }

    // Attribute Selection
    const colorOptions = document.querySelectorAll('.color-option');
    const sizeOptions = document.querySelectorAll('.size-option');

    colorOptions.forEach(option => {
        option.addEventListener('click', () => {
            colorOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
        });
    });

    sizeOptions.forEach(option => {
        option.addEventListener('click', () => {
            sizeOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
        });
    });

    // Initialize cart display
    await loadCart();
});

// ---------------- Toast Function ----------------
function showToast(message, type = 'info', duration = 3000) {
    // Create toast container if it doesn't exist
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            align-items: flex-end;
        `;
        document.body.appendChild(container);
    }

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
// Profile Page JavaScript Functionality

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the profile page
    initializeProfilePage();

    // Smart Navbar - Same as home page
    initializeSmartNavbar();

    // Profile navigation
    initializeProfileNavigation();

    // Appointments tabs
    initializeAppointmentsTabs();

    // Avatar selection
    initializeAvatarSelection();

    // Forms handling
    initializeForms();

    // Password toggles
    initializePasswordToggles();

    // Load dynamic data
    loadProfileData();
});

// Smart Navbar functionality (same as home page)
function initializeSmartNavbar() {
    const navbar = document.querySelector('.navbar');
    let lastScrollTop = 0;

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
}

// Profile navigation between sections
function initializeProfileNavigation() {
    const navLinks = document.querySelectorAll('.profile-nav-link');
    const contentSections = document.querySelectorAll('.profile-content');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();

            // Skip if it's the logout link
            if (this.classList.contains('logout-link')) return;

            const targetSection = this.getAttribute('data-section');

            // Remove active class from all nav links and content sections
            navLinks.forEach(nav => nav.classList.remove('active'));
            contentSections.forEach(content => content.classList.remove('active'));

            // Add active class to clicked nav link
            this.classList.add('active');

            // Show target content section
            const targetContent = document.getElementById(`${targetSection === 'overview' ? 'profile-overview' : targetSection === 'orders' ? 'order-history' : targetSection === 'appointments' ? 'appointments' : 'settings'}`);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });
}

// Appointments tabs functionality
function initializeAppointmentsTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const appointmentsContents = document.querySelectorAll('.appointments-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');

            // Remove active class from all tab buttons and content
            tabButtons.forEach(btn => btn.classList.remove('active'));
            appointmentsContents.forEach(content => content.classList.remove('active'));

            // Add active class to clicked tab
            this.classList.add('active');

            // Show target content
            const targetContent = document.getElementById(`${targetTab}-appointments`);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });
}

// Avatar selection functionality
function initializeAvatarSelection() {
    const avatarOptions = document.querySelectorAll('.avatar-option');
    const currentAvatar = document.getElementById('currentAvatar');
    const saveAvatarBtn = document.getElementById('saveAvatar');
    const navProfileImage = document.getElementById('navProfileImage');
    const sidebarProfileImage = document.getElementById('sidebarProfileImage');

    let selectedAvatar = '/image/avatar 1.jpg'; // Default

    avatarOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Remove active class from all options
            avatarOptions.forEach(opt => opt.classList.remove('active'));

            // Add active class to selected option
            this.classList.add('active');

            // Get selected avatar path
            selectedAvatar = this.getAttribute('data-avatar');

            // Update current avatar preview
            currentAvatar.src = selectedAvatar;
        });
    });

    // Save avatar functionality
    saveAvatarBtn.addEventListener('click', async function() {
        const token = localStorage.getItem('authToken');
        if (!token) {
            showNotification('No authentication token found. Please log in again.', 'error');
            window.location.href = 'login.html';
            return;
        }

        try {
            // Send to backend (PATCH /api/users/me)
            const res = await fetch('http://localhost:8080/api/users/me', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ avatar_url: selectedAvatar }) // Match database column name
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(`Failed to update avatar: ${errorData.message || res.statusText}`);
            }

            const data = await res.json();

            // Update local storage
            const user = JSON.parse(localStorage.getItem('loggedInUser')) || {};
            user.avatar_url = selectedAvatar; // Match database column name
            localStorage.setItem('loggedInUser', JSON.stringify(user));

            // Update all avatar images
            navProfileImage.src = selectedAvatar;
            sidebarProfileImage.src = selectedAvatar;
            currentAvatar.src = selectedAvatar;

            showNotification('Avatar updated successfully!', 'success');
        } catch (err) {
            showNotification(`Failed to update avatar: ${err.message}. Please try again.`, 'error');
            console.error('Avatar update error:', err);
        }
    });
}

// Forms handling
function initializeForms() {
    // Personal Information Form
    const personalInfoForm = document.getElementById('personalInfoForm');
    personalInfoForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const formData = {
            name: document.getElementById('fullName').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            address: document.getElementById('address').value
        };

        // Get stored user data for comparison
        const storedUser = JSON.parse(localStorage.getItem('loggedInUser')) || {};

        // Validate email
        if (!validateEmail(formData.email)) {
            showNotification('Invalid email address', 'error');
            return;
        }

        // Only validate phone if it has changed
        if (formData.phone !== storedUser.phone && formData.phone && !validatePhone(formData.phone)) {
            showNotification('Invalid phone number', 'error');
            return;
        }

        const token = localStorage.getItem('authToken');
        if (!token) {
            showNotification('No authentication token found. Please log in again.', 'error');
            window.location.href = 'login.html';
            return;
        }

        try {
            // Send to backend (PATCH /api/users/me)
            const res = await fetch('http://localhost:8080/api/users/me', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    address: formData.address
                })
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(`Failed to update information: ${errorData.message || res.statusText}`);
            }

            const data = await res.json();

            // Update local storage
            localStorage.setItem('loggedInUser', JSON.stringify(data.user));

            // Update UI
            populateUserInfo(data.user);

            showNotification('Personal information updated successfully!', 'success');
        } catch (err) {
            showNotification(`Failed to update information: ${err.message}. Please try again.`, 'error');
            console.error('Update error:', err);
        }
    });

    // Password Change Form
    const passwordForm = document.getElementById('passwordForm');
    passwordForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // Basic validation
        if (newPassword !== confirmPassword) {
            showNotification('New passwords do not match!', 'error');
            return;
        }

        if (newPassword.length < 8 || !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(newPassword)) {
            showNotification('Password must be 8+ chars, include uppercase, lowercase, number & special char', 'error');
            return;
        }

        const token = localStorage.getItem('authToken');
        if (!token) {
            showNotification('No authentication token found. Please log in again.', 'error');
            window.location.href = 'login.html';
            return;
        }

        try {
            // Send to backend (POST /api/auth/change-password)
            const res = await fetch('http://localhost:8080/api/auth/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ currentPassword, newPassword })
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(`Failed to change password: ${errorData.message || res.statusText}`);
            }

            showNotification('Password changed successfully!', 'success');
            passwordForm.reset();
        } catch (err) {
            showNotification(`Failed to change password: ${err.message}. Please check current password and try again.`, 'error');
            console.error('Password change error:', err);
        }
    });
}

// Password toggle functionality
function initializePasswordToggles() {
    document.querySelectorAll('.password-toggle').forEach(toggle => {
        toggle.addEventListener('click', () => {
            const input = toggle.parentElement.querySelector('input');
            const type = input.type === 'password' ? 'text' : 'password';
            input.type = type;
            toggle.querySelector('i').classList.toggle('fa-eye');
            toggle.querySelector('i').classList.toggle('fa-eye-slash');
        });
    });
}

// Order and Appointment actions
function initializeProfilePage() {
    // Cancel Order functionality
    document.addEventListener('click', async function(e) {
        if (e.target.textContent === 'Cancel Order') {
            const orderId = e.target.dataset.orderId;
            if (confirm('Are you sure you want to cancel this order?')) {
                const token = localStorage.getItem('authToken');
                try {
                    // Send to backend (assume PATCH /api/orders/{id}/cancel)
                    const res = await fetch(`http://localhost:8080/api/orders/${orderId}/cancel`, {
                        method: 'PATCH',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (!res.ok) throw new Error('Failed to cancel order');

                    const orderCard = e.target.closest('.order-card');
                    const statusElement = orderCard.querySelector('.status');
                    statusElement.textContent = 'Cancelled';
                    statusElement.className = 'status';
                    statusElement.style.background = '#f8d7da';
                    statusElement.style.color = '#721c24';

                    e.target.remove();
                    showNotification('Order cancelled successfully!', 'success');

                    // Reload orders
                    populateOrders();
                    populateOverview();
                } catch (err) {
                    showNotification('Failed to cancel order.', 'error');
                }
            }
        }

        // Cancel Appointment functionality
        if (e.target.textContent === 'Cancel') {
            const apptId = e.target.dataset.apptId;
            if (confirm('Are you sure you want to cancel this appointment?')) {
                const token = localStorage.getItem('authToken');
                try {
                    // Send to backend (assume PATCH /api/appointments/{id}/cancel)
                    const res = await fetch(`http://localhost:8080/api/appointments/${apptId}/cancel`, {
                        method: 'PATCH',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (!res.ok) throw new Error('Failed to cancel appointment');

                    const appointmentCard = e.target.closest('.appointment-card');
                    const statusElement = appointmentCard.querySelector('.status');
                    statusElement.textContent = 'Cancelled';
                    statusElement.className = 'status';
                    statusElement.style.background = '#f8d7da';
                    statusElement.style.color = '#721c24';

                    e.target.remove();
                    showNotification('Appointment cancelled successfully!', 'success');

                    // Reload appointments
                    populateAppointments();
                    populateOverview();
                } catch (err) {
                    showNotification('Failed to cancel appointment.', 'error');
                }
            }
        }

        // Reschedule functionality
        if (e.target.textContent === 'Reschedule') {
            showNotification('Reschedule functionality would open a date picker modal', 'info');
            // Here you would open a modal or redirect to booking page with prefilled data
        }

        // Reorder functionality
        if (e.target.textContent === 'Reorder') {
            const orderId = e.target.dataset.orderId;
            showNotification('Items added to cart! Redirecting to checkout...', 'success');
            // Here you would send to backend POST /api/orders/reorder/{id} and redirect
        }

        // View Details functionality
        if (e.target.textContent === 'View Details') {
            showNotification('Detailed view would open in a modal or new page', 'info');
            // Here you would show detailed order/appointment information
        }
    });
}

// Load profile data (replace sample with actual API fetches later)
async function loadProfileData() {
    const token = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('loggedInUser');

    if (!token || !storedUser) {
        window.location.href = 'login.html';
        return;
    }

    let user;
    try {
        // Fetch fresh user data from backend (assume GET /api/users/me)
        const res = await fetch('http://localhost:8080/api/users/me', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch user data');
        const data = await res.json();
        user = data.user;
        localStorage.setItem('loggedInUser', JSON.stringify(user));
    } catch (err) {
        // Fallback to stored user if fetch fails
        user = JSON.parse(storedUser);
        showNotification('Using cached user data. Some information may be outdated.', 'warning');
    }

    populateUserInfo(user);

    // Load orders and appointments (replace with fetches)
    const orders = await getOrders(token);
    const appointments = await getAppointments(token);

    // Populate sections
    populateOverview(orders, appointments);
    populateOrders(orders);
    populateAppointments(appointments);
}

// Helper to populate user info across the page
function populateUserInfo(user) {
    document.getElementById('sidebarUserName').textContent = user.name || '';
    document.getElementById('sidebarUserEmail').textContent = user.email || '';
    document.getElementById('sidebarProfileImage').src = user.avatar_url || '/image/avatar 1.jpg';
    document.getElementById('navProfileImage').src = user.avatar_url || '/image/avatar 1.jpg';
    document.querySelector('.profile-name').textContent = user.name || '';

    // Settings form
    document.getElementById('fullName').value = user.name || '';
    document.getElementById('email').value = user.email || '';
    document.getElementById('phone').value = user.phone || '';
    document.getElementById('address').value = user.address || '';
    document.getElementById('currentAvatar').src = user.avatar_url || '/image/avatar 1.jpg';

    // Select current avatar option
    const avatarOptions = document.querySelectorAll('.avatar-option');
    avatarOptions.forEach(opt => {
        if (opt.getAttribute('data-avatar') === user.avatar_url) {
            opt.classList.add('active');
        } else {
            opt.classList.remove('active');
        }
    });
}

// Fetch or mock orders
async function getOrders(token) {
    // try {
    //     const res = await fetch('http://localhost:8080/api/orders', {
    //         headers: { 'Authorization': `Bearer ${token}` }
    //     });
    //     if (!res.ok) throw new Error();
    //     return await res.json();
    // } catch {
    // Mock data fallback
    return [
        {
            id: 'VET2025001',
            date: 'January 15, 2025',
            status: 'delivered',
            items: [{ image: '/image/shop1 1.png', name: 'Pet Toys Bundle', qty: 2, price: 1500 }]
        },
        {
            id: 'VET2025002',
            date: 'January 10, 2025',
            status: 'processing',
            items: [{ image: '/image/shop2 1.png', name: 'Premium Pet Collar', qty: 1, price: 800 }]
        }
    ];
    // }
}

async function getAppointments(token) {
    // try {
    //     const res = await fetch('http://localhost:8080/api/appointments', {
    //         headers: { 'Authorization': `Bearer ${token}` }
    //     });
    //     if (!res.ok) throw new Error();
    //     return await res.json();
    // } catch {
    const currentDate = new Date('2025-09-09');
    return [
        {
            id: 'APPT001',
            type: 'Health Checkup',
            date: 'January 25, 2025',
            time: '10:00 AM - 11:00 AM',
            doctor: 'Dr. Sharma',
            status: 'confirmed',
            isPast: new Date('2025-01-25') < currentDate
        },
        {
            id: 'APPT002',
            type: 'Pet Grooming',
            date: 'January 30, 2025',
            time: '2:00 PM - 3:00 PM',
            doctor: 'Pet Groomer',
            status: 'pending',
            isPast: new Date('2025-01-30') < currentDate
        },
        {
            id: 'APPT003',
            type: 'Vaccination',
            date: 'December 20, 2024',
            time: '3:00 PM - 3:30 PM',
            doctor: 'Dr. Patel',
            status: 'completed',
            isPast: true
        }
    ];
    // }
}

// Populate overview section
function populateOverview(orders, appointments) {
    const statsContainer = document.getElementById('statsContainer');
    statsContainer.innerHTML = '';

    const stats = [
        { icon: 'fa-shopping-bag', value: orders.length, title: 'Total Orders' },
        { icon: 'fa-calendar-check', value: appointments.length, title: 'Appointments' },
        { icon: 'fa-heart', value: 3, title: 'Registered Pets' } // Assume fixed or fetch separately
    ];

    stats.forEach(stat => {
        statsContainer.innerHTML += `
            <div class="col-lg-4 col-md-6 mb-4">
                <div class="stats-card">
                    <div class="stats-icon">
                        <i class="fas ${stat.icon}"></i>
                    </div>
                    <div class="stats-info">
                        <h3>${stat.value}</h3>
                        <p>${stat.title}</p>
                    </div>
                </div>
            </div>
        `;
    });

    // Recent orders (last 2)
    const recentOrdersContainer = document.getElementById('recentOrdersContainer');
    recentOrdersContainer.innerHTML = '';
    orders.slice(0, 2).forEach(order => {
        recentOrdersContainer.innerHTML += `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="fas fa-shopping-cart"></i>
                </div>
                <div class="activity-details">
                    <h5>${order.items[0].name}</h5>
                    <p>Ordered on ${order.date}</p>
                    <span class="status ${order.status}">${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
                </div>
            </div>
        `;
    });

    // Upcoming appointments (next 2 non-past)
    const recentAppointmentsContainer = document.getElementById('recentAppointmentsContainer');
    recentAppointmentsContainer.innerHTML = '';
    const upcoming = appointments.filter(a => !a.isPast).slice(0, 2);
    upcoming.forEach(appt => {
        recentAppointmentsContainer.innerHTML += `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="fas fa-stethoscope"></i>
                </div>
                <div class="activity-details">
                    <h5>${appt.type}</h5>
                    <p>${appt.date} at ${appt.time}</p>
                    <span class="status ${appt.status}">${appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}</span>
                </div>
            </div>
        `;
    });
}

// Populate orders section
function populateOrders(orders) {
    const ordersContainer = document.getElementById('ordersContainer');
    ordersContainer.innerHTML = '';

    orders.forEach(order => {
        let itemsHtml = '';
        order.items.forEach(item => {
            itemsHtml += `
                <div class="item">
                    <img src="${item.image}" alt="${item.name}">
                    <div class="item-details">
                        <h5>${item.name}</h5>
                        <p>Quantity: ${item.qty}</p>
                    </div>
                    <div class="item-price">Rs. ${item.price}</div>
                </div>
            `;
        });

        const actions = order.status === 'processing' ? `
            <button class="btn btn-outline-primary" data-order-id="${order.id}">View Details</button>
            <button class="btn btn-danger" data-order-id="${order.id}">Cancel Order</button>
        ` : `
            <button class="btn btn-outline-primary" data-order-id="${order.id}">View Details</button>
            <button class="btn btn-primary" data-order-id="${order.id}">Reorder</button>
        `;

        ordersContainer.innerHTML += `
            <div class="order-card">
                <div class="order-header">
                    <div class="order-id">
                        <strong>Order #${order.id}</strong>
                        <span class="order-date">${order.date}</span>
                    </div>
                    <div class="order-status">
                        <span class="status ${order.status}">${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
                    </div>
                </div>
                <div class="order-items">
                    ${itemsHtml}
                </div>
                <div class="order-actions">
                    ${actions}
                </div>
            </div>
        `;
    });
}

// Populate appointments section
function populateAppointments(appointments) {
    const upcomingContainer = document.getElementById('upcoming-appointments');
    const pastContainer = document.getElementById('past-appointments');
    upcomingContainer.innerHTML = '';
    pastContainer.innerHTML = '';

    const upcoming = appointments.filter(a => !a.isPast);
    const past = appointments.filter(a => a.isPast);

    const populate = (container, appts, isPast) => {
        appts.forEach(appt => {
            const iconClass = appt.type === 'Health Checkup' ? 'fa-stethoscope' : appt.type === 'Pet Grooming' ? 'fa-cut' : 'fa-syringe';
            const actions = isPast ? `
                <span class="status ${appt.status}">${appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}</span>
                <button class="btn btn-outline-primary btn-sm" data-appt-id="${appt.id}">View Report</button>
                <button class="btn btn-primary btn-sm" data-appt-id="${appt.id}">Book Again</button>
            ` : `
                <span class="status ${appt.status}">${appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}</span>
                <button class="btn btn-outline-primary btn-sm" data-appt-id="${appt.id}">Reschedule</button>
                <button class="btn btn-danger btn-sm" data-appt-id="${appt.id}">Cancel</button>
            `;

            container.innerHTML += `
                <div class="appointment-card ${isPast ? 'completed' : ''}">
                    <div class="appointment-info">
                        <div class="appointment-icon">
                            <i class="fas ${iconClass}"></i>
                        </div>
                        <div class="appointment-details">
                            <h4>${appt.type}</h4>
                            <p><i class="fas fa-calendar"></i> ${appt.date}</p>
                            <p><i class="fas fa-clock"></i> ${appt.time}</p>
                            <p><i class="fas fa-user-md"></i> ${appt.doctor}</p>
                        </div>
                    </div>
                    <div class="appointment-actions">
                        ${actions}
                    </div>
                </div>
            `;
        });
    };

    populate(upcomingContainer, upcoming, false);
    populate(pastContainer, past, true);
}

// Logout functionality
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        // Clear any stored user data
        localStorage.removeItem('loggedInUser');
        localStorage.removeItem('authToken');
        sessionStorage.clear();

        // Show logout message
        showNotification('Logging out...', 'info');

        // Redirect to login page after a short delay
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
    }
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notification if any
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${getNotificationIcon(type)}"></i>
            <span>${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;

    // Add notification styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        background: ${getNotificationColor(type)};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        animation: slideInRight 0.3s ease;
        max-width: 400px;
        word-wrap: break-word;
    `;

    // Add to page
    document.body.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Helper function for notification icons
function getNotificationIcon(type) {
    switch(type) {
        case 'success': return 'fa-check-circle';
        case 'error': return 'fa-exclamation-circle';
        case 'warning': return 'fa-exclamation-triangle';
        default: return 'fa-info-circle';
    }
}

// Helper function for notification colors
function getNotificationColor(type) {
    switch(type) {
        case 'success': return '#28a745';
        case 'error': return '#dc3545';
        case 'warning': return '#ffc107';
        default: return '#17a2b8';
    }
}

// Add notification animations to CSS dynamically
function addNotificationStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
        
        .notification-content {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .notification-content i:first-child {
            font-size: 1.2rem;
        }
        
        .notification-content span {
            flex: 1;
            font-weight: 500;
        }
        
        .notification-close {
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            font-size: 1rem;
            padding: 0;
            margin-left: 10px;
            opacity: 0.8;
            transition: opacity 0.3s ease;
        }
        
        .notification-close:hover {
            opacity: 1;
        }
    `;
    document.head.appendChild(style);
}

// Initialize notification styles
addNotificationStyles();

// Handle responsive menu toggle
function handleResponsiveMenu() {
    const navbarToggler = document.querySelector('.navbar-toggler');
    const navbarCollapse = document.querySelector('.navbar-collapse');

    if (navbarToggler && navbarCollapse) {
        navbarToggler.addEventListener('click', function() {
            navbarCollapse.classList.toggle('show');
        });

        // Close menu when clicking on nav links (mobile)
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', function() {
                if (window.innerWidth < 992) {
                    navbarCollapse.classList.remove('show');
                }
            });
        });
    }
}

// Initialize responsive menu
handleResponsiveMenu();

// Handle profile dropdown
function initializeProfileDropdown() {
    const profileDropdown = document.getElementById('profileDropdown');
    const dropdownMenu = document.querySelector('.profile-dropdown-menu');

    if (profileDropdown && dropdownMenu) {
        profileDropdown.addEventListener('click', function(e) {
            e.stopPropagation();
            dropdownMenu.classList.toggle('show');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', function() {
            dropdownMenu.classList.remove('show');
        });

        // Prevent dropdown from closing when clicking inside
        dropdownMenu.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }
}

// Initialize profile dropdown
initializeProfileDropdown();

// Smooth scrolling for internal links
function initializeSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Initialize smooth scrolling
initializeSmoothScrolling();

// Form validation helpers
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePhone(phone) {
    // Remove spaces, dashes, or other common separators
    const cleanedPhone = phone.replace(/[\s-]/g, '');
    // Allow 10-digit numbers, optionally starting with +977
    const phoneRegex = /^(\+977)?[0-9]{10}$/;
    return phoneRegex.test(cleanedPhone);
}

function validatePassword(password) {
    return password.length >= 6;
}

// Enhanced form validation
function enhanceFormValidation() {
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const newPasswordInput = document.getElementById('newPassword');
    const confirmPasswordInput = document.getElementById('confirmPassword');

    // Real-time email validation
    if (emailInput) {
        emailInput.addEventListener('blur', function() {
            if (this.value && !validateEmail(this.value)) {
                this.classList.add('is-invalid');
                showNotification('Please enter a valid email address', 'error');
            } else {
                this.classList.remove('is-invalid');
            }
        });
    }

    // Real-time phone validation
    if (phoneInput) {
        phoneInput.addEventListener('blur', function() {
            if (this.value && !validatePhone(this.value)) {
                this.classList.add('is-invalid');
                showNotification('Please enter a valid phone number', 'error');
            } else {
                this.classList.remove('is-invalid');
            }
        });
    }

    // Real-time password validation
    if (newPasswordInput) {
        newPasswordInput.addEventListener('input', function() {
            const strength = calculatePasswordStrength(this.value);
            updatePasswordStrengthIndicator(strength);
            if (this.value && (this.value.length < 8 || !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(this.value))) {
                this.classList.add('is-invalid');
            } else {
                this.classList.remove('is-invalid');
            }
            // Trigger confirm password validation
            if (confirmPasswordInput && confirmPasswordInput.value) {
                confirmPasswordInput.dispatchEvent(new Event('input'));
            }
        });
    }

    // Real-time confirm password validation
    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', function() {
            if (newPasswordInput && this.value && this.value !== newPasswordInput.value) {
                this.classList.add('is-invalid');
            } else {
                this.classList.remove('is-invalid');
            }
        });
    }
}

// Password strength calculator
function calculatePasswordStrength(password) {
    let strength = 0;

    if (password.length >= 6) strength++;
    if (password.length >= 10) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    return strength;
}

// Update password strength indicator
function updatePasswordStrengthIndicator(strength) {
    let strengthText = '';
    let strengthColor = '';

    switch(strength) {
        case 0:
        case 1:
            strengthText = 'Very Weak';
            strengthColor = '#dc3545';
            break;
        case 2:
            strengthText = 'Weak';
            strengthColor = '#fd7e14';
            break;
        case 3:
            strengthText = 'Fair';
            strengthColor = '#ffc107';
            break;
        case 4:
            strengthText = 'Good';
            strengthColor = '#28a745';
            break;
        case 5:
        case 6:
            strengthText = 'Strong';
            strengthColor = '#198754';
            break;
    }

    // Update or create strength indicator
    let indicator = document.getElementById('passwordStrengthIndicator');
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = 'passwordStrengthIndicator';
        indicator.style.cssText = 'margin-top: 5px; font-size: 0.85rem; font-weight: 500;';
        document.getElementById('newPassword').parentElement.parentElement.appendChild(indicator);
    }

    indicator.textContent = `Password Strength: ${strengthText}`;
    indicator.style.color = strengthColor;
}

// Initialize enhanced form validation
enhanceFormValidation();

// Local storage helpers for user preferences
function saveUserPreference(key, value) {
    try {
        localStorage.setItem(`vetcare_${key}`, JSON.stringify(value));
    } catch (e) {
        console.warn('Could not save user preference:', e);
    }
}

function getUserPreference(key, defaultValue = null) {
    try {
        const value = localStorage.getItem(`vetcare_${key}`);
        return value ? JSON.parse(value) : defaultValue;
    } catch (e) {
        console.warn('Could not get user preference:', e);
        return defaultValue;
    }
}

// Save form data to localStorage (for better UX)
function initializeFormPersistence() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        const inputs = form.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"]');
        inputs.forEach(input => {
            const savedValue = getUserPreference(input.id);
            if (savedValue) {
                input.value = savedValue;
            }
            input.addEventListener('input', () => {
                saveUserPreference(input.id, input.value);
            });
        });
    });
}

// Initialize form persistence
initializeFormPersistence();
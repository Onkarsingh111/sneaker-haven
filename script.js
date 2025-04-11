// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    updateUserStatus();
    updateCartCount();
    if (document.getElementById('register-form')) handleRegisterForm();
    if (document.getElementById('signin-form')) handleSigninForm();
    if (document.getElementById('contact-form')) handleContactForm();
    if (document.getElementById('cart-items')) displayCart();
    if (document.getElementById('order-list')) displayOrders();
    if (document.querySelector('.carousel')) initCarousel();
});

// Update user status
function updateUserStatus() {
    const userStatus = document.getElementById('user-status');
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (loggedInUser) {
        userStatus.innerHTML = `Welcome, ${loggedInUser}! <a href="#" onclick="signOut()">Sign Out</a>`;
    } else {
        userStatus.innerHTML = `Welcome, Guest! <a href="register.html">Sign In</a>`;
    }
}

// Handle registration
function handleRegisterForm() {
    const form = document.getElementById('register-form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('reg-username').value;
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-password').value;
        const message = document.getElementById('register-message');

        if (!username || !email || !password) {
            message.textContent = 'Please fill all fields!';
            message.style.color = 'red';
            return;
        }

        let users = JSON.parse(localStorage.getItem('users')) || [];
        if (users.some(user => user.email === email)) {
            message.textContent = 'Email already exists!';
            message.style.color = 'red';
            return;
        }

        users.push({ username, email, password });
        localStorage.setItem('users', JSON.stringify(users));
        message.textContent = 'Account created! Please sign in.';
        message.style.color = 'green';
        form.reset();
    });
}

// Handle sign-in
function handleSigninForm() {
    const form = document.getElementById('signin-form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('signin-email').value;
        const password = document.getElementById('signin-password').value;
        const message = document.getElementById('signin-message');

        if (!email || !password) {
            message.textContent = 'Please fill all fields!';
            message.style.color = 'red';
            return;
        }

        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            localStorage.setItem('loggedInUser', user.username);
            message.textContent = 'Signed in! Redirecting...';
            message.style.color = 'green';
            setTimeout(() => window.location.href = 'index.html', 1000);
        } else {
            message.textContent = 'Invalid credentials!';
            message.style.color = 'red';
        }
    });
}

// Sign out
function signOut() {
    localStorage.removeItem('loggedInUser');
    updateUserStatus();
    window.location.href = 'index.html';
}

// Add to cart
function addToCart(id, name, price) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItem = cart.find(item => item.id === id);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ id, name, price, quantity: 1 });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    alert(`${name} added to cart!`);
}

// Update cart count
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.querySelectorAll('#cart-count').forEach(el => el.textContent = count);
}

// Display cart
function displayCart() {
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    const cartEmpty = document.getElementById('cart-empty');
    const checkoutButton = document.getElementById('checkout-button');
    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    if (cart.length === 0) {
        cartEmpty.style.display = 'block';
        checkoutButton.disabled = true;
        cartTotal.textContent = 'Total: $0.00';
        return;
    }

    cartEmpty.style.display = 'none';
    checkoutButton.disabled = false;
    cartItems.innerHTML = '';
    let total = 0;

    cart.forEach(item => {
        total += item.price * item.quantity;
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
            <span>${item.name} (x${item.quantity})</span>
            <span>$${(item.price * item.quantity).toFixed(2)}</span>
            <button onclick="removeFromCart(${item.id})">Remove</button>
        `;
        cartItems.appendChild(div);
    });

    cartTotal.textContent = `Total: $${total.toFixed(2)}`;
    checkoutButton.onclick = () => checkout();
}

// Remove from cart
function removeFromCart(id) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart = cart.filter(item => item.id !== id);
    localStorage.setItem('cart', JSON.stringify(cart));
    displayCart();
    updateCartCount();
}

// Checkout
function checkout() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart.length === 0) return;

    const loggedInUser = localStorage.getItem('loggedInUser');
    if (!loggedInUser) {
        alert('Please sign in to place an order!');
        window.location.href = 'register.html';
        return;
    }

    let orders = JSON.parse(localStorage.getItem('orders')) || [];
    const order = {
        user: loggedInUser,
        items: cart,
        total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
        date: new Date().toLocaleString()
    };
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));
    localStorage.removeItem('cart');
    alert('Order placed successfully!');
    window.location.href = 'orders.html';
}

// Display orders
function displayOrders() {
    const orderList = document.getElementById('order-list');
    const orderMessage = document.getElementById('order-message');
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const loggedInUser = localStorage.getItem('loggedInUser');

    if (!loggedInUser) {
        orderMessage.textContent = 'Please sign in to view orders!';
        orderMessage.style.color = 'red';
        return;
    }

    const userOrders = orders.filter(order => order.user === loggedInUser);
    if (userOrders.length === 0) {
        orderMessage.textContent = 'No orders yet!';
        return;
    }

    orderList.innerHTML = '';
    userOrders.forEach(order => {
        const div = document.createElement('div');
        div.className = 'order-item';
        div.innerHTML = `
            <p><strong>Order Date:</strong> ${order.date}</p>
            <p><strong>Items:</strong> ${order.items.map(item => `${item.name} (x${item.quantity})`).join(', ')}</p>
            <p><strong>Total:</strong> $${order.total.toFixed(2)}</p>
        `;
        orderList.appendChild(div);
    });
}

// Handle contact form
function handleContactForm() {
    const form = document.getElementById('contact-form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('contact-name').value;
        const email = document.getElementById('contact-email').value;
        const messageText = document.getElementById('contact-message').value;
        const message = document.getElementById('contact-message');

        if (!name || !email || !messageText) {
            message.textContent = 'Please fill all fields!';
            message.style.color = 'red';
            return;
        }

        message.textContent = 'Message sent! We’ll get back to you soon.';
        message.style.color = 'green';
        form.reset();
    });
}

// Initialize carousel
function initCarousel() {
    const track = document.querySelector('.carousel-track');
    const items = document.querySelectorAll('.carousel-item');
    const prevButton = document.querySelector('.carousel-prev');
    const nextButton = document.querySelector('.carousel-next');
    let currentIndex = 0;
    const itemWidth = items[0].offsetWidth + 20; // Include padding

    function updateCarousel() {
        track.style.transform = `translateX(-${currentIndex * itemWidth}px)`;
    }

    prevButton.addEventListener('click', () => {
        if (currentIndex > 0) {
            currentIndex--;
            updateCarousel();
        }
    });

    nextButton.addEventListener('click', () => {
        if (currentIndex < items.length - Math.floor(track.parentElement.offsetWidth / itemWidth)) {
            currentIndex++;
            updateCarousel();
        }
    });

    // Auto-scroll every 5 seconds
    setInterval(() => {
        if (currentIndex < items.length - Math.floor(track.parentElement.offsetWidth / itemWidth)) {
            currentIndex++;
        } else {
            currentIndex = 0;
        }
        updateCarousel();
    }, 5000);
}
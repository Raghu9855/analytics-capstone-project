document.addEventListener('DOMContentLoaded', () => {

  // --- Real State Management for Cart ---
  let cart = JSON.parse(localStorage.getItem('techtrend_cart')) || [];

  // DOM Elements for Cart
  const cartIconWrapper = document.getElementById('cart-icon-wrapper');
  const cartBadge = document.getElementById('cart-badge');
  const cartOverlay = document.getElementById('cart-overlay');
  const cartDrawer = document.getElementById('cart-drawer');
  const closeCartBtn = document.getElementById('close-cart');
  const cartItemsContainer = document.getElementById('cart-items-container');
  const cartTotalPrice = document.getElementById('cart-total-price');
  const checkoutBtn = document.getElementById('checkout-btn');

  // Utility: Create Toast Notifications
  const toastContainer = document.createElement('div');
  toastContainer.id = 'toast-container';
  document.body.appendChild(toastContainer);

  function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span style="font-size: 1.2rem;">✓</span> ${message}`;

    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('fade-out');
      toast.addEventListener('animationend', () => toast.remove());
    }, 3000);
  }

  // Mobile menu toggle
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');

  if (hamburger) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });
  }

  // --- Cart Functionality ---
  function updateCartUI() {
    if (!cartBadge || !cartItemsContainer || !cartTotalPrice) return;

    cartBadge.innerText = cart.length;

    if (cart.length === 0) {
      cartItemsContainer.innerHTML = '<p style="text-align:center; color: var(--text-light); margin-top: 2rem;">Your cart is empty.</p>';
      cartTotalPrice.innerText = '$0.00';
      return;
    }

    cartItemsContainer.innerHTML = '';
    let total = 0;

    cart.forEach((item, index) => {
      total += parseFloat(item.price);
      const cartItemEl = document.createElement('div');
      cartItemEl.className = 'cart-item';
      cartItemEl.innerHTML = `
        <div class="cart-item-info">
          <h4>${item.name}</h4>
          <span class="cart-price">$${item.price.toFixed(2)}</span>
        </div>
        <button class="remove-item" data-index="${index}">Remove</button>
      `;
      cartItemsContainer.appendChild(cartItemEl);
    });

    cartTotalPrice.innerText = `$${total.toFixed(2)}`;

    // Add remove listeners
    document.querySelectorAll('.remove-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = e.target.getAttribute('data-index');
        const removedItem = cart.splice(idx, 1)[0];
        localStorage.setItem('techtrend_cart', JSON.stringify(cart));

        // Push remove from cart to GTM
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: 'remove_from_cart',
          ecommerce: {
            currency: 'USD',
            value: removedItem.price,
            items: [{
              item_name: removedItem.name,
              price: removedItem.price,
              quantity: 1
            }]
          }
        });

        updateCartUI();
        showToast(`${removedItem.name} removed from cart`);
      });
    });
  }

  function toggleCart() {
    if (!cartDrawer) return;
    const isActive = cartDrawer.classList.contains('active');
    if (isActive) {
      cartDrawer.classList.remove('active');
      cartOverlay.classList.remove('active');
    } else {
      updateCartUI();
      cartDrawer.classList.add('active');
      cartOverlay.classList.add('active');

      // GA4 view_cart event
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: 'view_cart' });
    }
  }

  if (cartIconWrapper) cartIconWrapper.addEventListener('click', toggleCart);
  if (closeCartBtn) closeCartBtn.addEventListener('click', toggleCart);
  if (cartOverlay) cartOverlay.addEventListener('click', toggleCart);

  // Initialize UI correctly
  updateCartUI();

  // --- GA/GTM Enhanced E-Commerce Integration ---

  // 1. "Add to Cart" Logic
  const addToCartBtns = document.querySelectorAll('.btn-add-to-cart');
  addToCartBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();

      const productTitle = btn.closest('.product-card')?.querySelector('h3')?.innerText ||
        document.getElementById('product-details-title')?.innerText || 'Unknown Product';
      const priceText = btn.closest('.product-card')?.querySelector('.price')?.innerText ||
        document.getElementById('product-details-price')?.innerText || '$0.00';

      const productPrice = parseFloat(priceText.replace('$', ''));

      // Real state update
      cart.push({ name: productTitle, price: productPrice });
      localStorage.setItem('techtrend_cart', JSON.stringify(cart));
      updateCartUI();

      // GA4 add_to_cart push
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: 'add_to_cart',
        ecommerce: {
          currency: 'USD',
          value: productPrice,
          items: [{
            item_name: productTitle,
            price: productPrice,
            quantity: 1
          }]
        }
      });

      showToast(`${productTitle} added to cart`);

      // Briefly open cart to show it was added
      if (!cartDrawer.classList.contains('active')) {
        toggleCart();
        setTimeout(() => toggleCart(), 2000);
      }
    });
  });

  // 2. Checkout Logic (Mini Cart checkout button or Direct "Buy Now")
  function handleCheckout(itemsToCheckout) {
    if (!itemsToCheckout || itemsToCheckout.length === 0) {
      showToast('No items to checkout!');
      return;
    }

    let totalValue = itemsToCheckout.reduce((sum, item) => sum + item.price, 0);
    const ecommerceItems = itemsToCheckout.map(item => ({
      item_name: item.name,
      price: item.price,
      quantity: 1
    }));

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'begin_checkout',
      ecommerce: {
        currency: 'USD',
        value: totalValue,
        items: ecommerceItems
      }
    });

    showToast('Redirecting to secure checkout...');
    setTimeout(() => {
      // Simulate successful purchase and empty cart
      cart = [];
      localStorage.setItem('techtrend_cart', JSON.stringify(cart));
      updateCartUI();
      toggleCart();

      window.dataLayer.push({ event: 'purchase_simulated', value: totalValue });
      alert('Mock Purchase Complete. DataLayer recorded purchase!');
    }, 1500);
  }

  // Cart Drawer Checkout
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => handleCheckout(cart));
  }

  // Direct Product Page "Buy Now"
  const buyNowBtn = document.querySelector('.btn-buy-now');
  if (buyNowBtn) {
    buyNowBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const productTitle = document.getElementById('product-details-title')?.innerText || 'Premium Wireless Headphones';
      const priceText = document.getElementById('product-details-price')?.innerText || '$149.99';
      const productPrice = parseFloat(priceText.replace('$', ''));

      handleCheckout([{ name: productTitle, price: productPrice }]);
    });
  }

  // 3. Form Submissions
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;

      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: 'form_submission',
        form_name: 'Contact Us',
        user_name: name,
        user_email: email
      });

      showToast('Message sent via contact form');
      contactForm.reset();
    });
  }

  const newsletterForm = document.querySelector('.newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = newsletterForm.querySelector('input').value;

      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: 'newsletter_signup',
        user_email: email
      });

      showToast('Subscribed to newsletter successfully');
      newsletterForm.reset();
    });
  }

  // 4. Search Bar
  const searchForms = document.querySelectorAll('.search-bar');
  searchForms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const query = form.querySelector('input').value;
      if (!query) return;

      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: 'search',
        search_term: query
      });

      showToast(`Searching for "${query}"`);
    });
  });

  // 5. Scroll Depth Tracking
  let scrolled50 = false;
  window.addEventListener('scroll', () => {
    if (!scrolled50 && (window.scrollY + window.innerHeight >= document.body.scrollHeight / 2)) {
      scrolled50 = true;
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: 'scroll_depth',
        depth: '50%'
      });
      console.log('Fired 50% scroll_depth trigger');
    }
  });

});

document.addEventListener('DOMContentLoaded', () => {

  // Mobile menu toggle
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');

  if (hamburger) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });
  }

  // --- GA/GTM Tracking Simulation ---
  
  // Track "Add to Cart" button clicks
  const addToCartBtns = document.querySelectorAll('.btn-add-to-cart');
  addToCartBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const productTitle = btn.closest('.product-card')?.querySelector('h3')?.innerText || 'Unknown Product';
      const productPrice = btn.closest('.product-card')?.querySelector('.price')?.innerText || '0.00';
      
      console.log('GTM/GA Event Simulated:', {
        event: 'add_to_cart',
        ecommerce: {
          items: [{
            item_name: productTitle,
            price: productPrice,
            quantity: 1
          }]
        }
      });
      alert(`${productTitle} added to cart! Check console for tracking data.`);
    });
  });

  // Track "Buy Now" button click on product details
  const buyNowBtn = document.querySelector('.btn-buy-now');
  if (buyNowBtn) {
    buyNowBtn.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('GTM/GA Event Simulated:', {
        event: 'begin_checkout',
        ecommerce: {
          items: [{
            item_name: 'Premium Wireless Headphones',
            price: '149.99',
            quantity: 1
          }]
        }
      });
      alert('Proceeding to Checkout! Check console for tracking data.');
    });
  }

  // Track Contact Form Submission
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      
      console.log('GTM/GA Event Simulated:', {
        event: 'form_submission',
        form_name: 'Contact Us',
        user_name: name,
        user_email: email
      });
      
      alert('Thank you for contacting us! We will get back to you soon.');
      contactForm.reset();
    });
  }

  // Track Newsletter Submissions
  const newsletterForm = document.querySelector('.newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = newsletterForm.querySelector('input').value;
      
      console.log('GTM/GA Event Simulated:', {
        event: 'newsletter_signup',
        user_email: email
      });
      
      alert('Subscribed successfully!');
      newsletterForm.reset();
    });
  }

  // Track Search Bar Usage
  const searchForm = document.querySelector('.search-bar');
  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const query = searchForm.querySelector('input').value;
      
      console.log('GTM/GA Event Simulated:', {
        event: 'search',
        search_term: query
      });
      
      alert(`Searching for: ${query}`);
    });
  }

  // Basic scroll tracking implementation (e.g. 50% depth)
  let scrolled50 = false;
  window.addEventListener('scroll', () => {
    if (!scrolled50 && (window.scrollY + window.innerHeight >= document.body.scrollHeight / 2)) {
      scrolled50 = true;
      console.log('GTM/GA Event Simulated:', {
        event: 'scroll_depth',
        depth: '50%'
      });
    }
  });

});

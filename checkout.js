document.addEventListener("DOMContentLoaded", function() {
  const directData = localStorage.getItem('direct_checkout_data');
  const cartList = document.getElementById("checkout-cart-items");
  const subtotalEl = document.getElementById("checkout-total");   // Subtotal
  const deliveryEl = document.getElementById("delivery-charges"); // Delivery Charges
  const grandTotalEl = document.getElementById("grand-total");    // Grand Total

  let subtotal = 0;
  let deliveryCharges = 200; // 👈 fixed charges (aap chaaho to dynamic bhi bana sakte ho)

  function renderCart(cart) {
    cartList.innerHTML = '';
    subtotal = 0;

    cart.forEach(item => {
      const li = document.createElement("li");
      li.innerHTML = `
        ${item.name} - Rs. ${item.price} × ${item.quantity} = Rs. ${(item.price * item.quantity).toFixed(2)}
      `;
      cartList.appendChild(li);
      subtotal += item.price * item.quantity;
    });

    // Values set karna
    subtotalEl.textContent = subtotal.toFixed(2);
    deliveryEl.textContent = deliveryCharges.toFixed(2);
    grandTotalEl.textContent = (subtotal + deliveryCharges).toFixed(2);
  }

  // 1. Direct checkout data
  if (directData) {
    const directCart = JSON.parse(directData);
    renderCart(directCart);
    localStorage.removeItem('direct_checkout_data');
    return;
  }

  // 2. Normal cart
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  if (cart.length === 0) {
    cartList.innerHTML = "<li>Your cart is empty</li>";
    subtotalEl.textContent = "0";
    deliveryEl.textContent = "0";
    grandTotalEl.textContent = "0";
  } else {
    renderCart(cart);
  }
});


// =====================
// Order Submit Function
// =====================
function submitOrder(event) {
  event.preventDefault(); 

  const fname = document.getElementById("fname").value.trim();
  const lname = document.getElementById("lname").value.trim();
  const phone = document.getElementById("contact").value.trim();
  const address = document.getElementById("address").value.trim();
  const city = document.getElementById("city").value.trim();
  const postal = document.getElementById("postal").value.trim();
  const email = document.getElementById("email").value.trim();
  const notes = document.getElementById("notes").value.trim();

  const cart =
    JSON.parse(localStorage.getItem("cart")) ||
    JSON.parse(localStorage.getItem("direct_checkout_data")) ||
    [];

  if (!fname || !lname || !phone || !address || !city || !postal || cart.length === 0) {
    alert("Please fill all required fields and ensure cart is not empty.");
    return;
  }

  // Subtotal calculate karna
  let subtotal = 0;
  cart.forEach(item => subtotal += item.price * item.quantity);
  let deliveryCharges = 200;
  let grandTotal = subtotal + deliveryCharges;

  const orderData = {
    name: `${fname} ${lname}`,
    phone: phone,
    address: `${address}, ${city}, ${postal}`,
    email: email,
    notes: notes,
    cart: cart,
    subtotal: subtotal,
    delivery_charges: deliveryCharges,
    grand_total: grandTotal
  };

  fetch("https://loris-website-production.up.railway.app/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(orderData)
  })
  .then(res => res.json())
  .then(data => {
    if (data.error) {
      alert("Failed: " + data.error);
    } else {
      alert("Order placed successfully! ID: " + data.order_id);

      document.getElementById("checkout-form").reset();
      localStorage.removeItem("cart");

      if (typeof updateCartUI === "function") {
        updateCartUI();
      } else {
        const cartContainer = document.getElementById("cart-items");
        if (cartContainer) {
          cartContainer.innerHTML = "<p>Your cart is empty.</p>";
        }
      }
    }
  })
  .catch(err => {
    console.error(err);
    alert("Failed to place order");
  });
}

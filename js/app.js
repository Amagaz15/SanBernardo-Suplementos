const WHATSAPP_NUMBER = "5492257521555";

let cart = JSON.parse(localStorage.getItem("cart")) || [];

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function openCart() {
  document.getElementById("cartPanel").classList.add("open");
  document.getElementById("cartOverlay").classList.add("open");
}

function closeCart() {
  document.getElementById("cartPanel").classList.remove("open");
  document.getElementById("cartOverlay").classList.remove("open");
}

function addToCart(name, brand, price) {
  const existingProduct = cart.find(
    item => item.name === name && item.brand === brand
  );

  if (existingProduct) {
    existingProduct.quantity++;
  } else {
    cart.push({
      name: name,
      brand: brand,
      price: price,
      quantity: 1
    });
  }

  saveCart();
  renderCart();
}

function removeFromCart(index) {
  cart.splice(index, 1);

  saveCart();
  renderCart();
}

function increaseQuantity(index) {
  cart[index].quantity++;

  saveCart();
  renderCart();
}

function decreaseQuantity(index) {
  cart[index].quantity--;

  if (cart[index].quantity <= 0) {
    cart.splice(index, 1);
  }

  saveCart();
  renderCart();
}

function renderCart() {
  const cartItems = document.getElementById("cartItems");
  const cartCount = document.getElementById("cartCount");
  const cartTotal = document.getElementById("cartTotal");

  cartCount.textContent = cart.reduce((total, item) => {
    return total + item.quantity;
  }, 0);

  if (cart.length === 0) {
    cartItems.innerHTML = `<p class="empty-cart">Tu carrito está vacío.</p>`;
    cartTotal.textContent = "$0";
    return;
  }

  let total = 0;
  let html = "";

  cart.forEach((item, index) => {
    const subtotal = item.price * item.quantity;
    total += subtotal;

    const priceText =
      item.price > 0
        ? `$${subtotal.toLocaleString("es-AR")}`
        : "A consultar";

    html += `
      <div class="cart-item">
        <h4>${item.name}</h4>
        <p>${item.brand} · ${priceText}</p>

        <div class="cart-item-controls">
          <button onclick="decreaseQuantity(${index})">−</button>
          <span>${item.quantity}</span>
          <button onclick="increaseQuantity(${index})">+</button>
          <button class="remove" onclick="removeFromCart(${index})">Eliminar</button>
        </div>
      </div>
    `;
  });

  cartItems.innerHTML = html;

  cartTotal.textContent =
    total > 0 ? `$${total.toLocaleString("es-AR")}` : "A consultar";
}

function sendOrderToWhatsApp() {
  const customerName = document.getElementById("customerName").value.trim();
  const customerAddress = document.getElementById("customerAddress").value.trim();
  const deliveryType = document.getElementById("deliveryType").value;
  const paymentMethod = document.getElementById("paymentMethod").value;

  if (cart.length === 0) {
    alert("Primero agregá productos al carrito.");
    return;
  }

  if (!customerName) {
    markError("customerName");
    alert("Ingresá tu nombre.");
    return;
  }

  if (deliveryType === "Envío" && !customerAddress) {
    markError("customerAddress");
    alert("Ingresá la dirección de entrega.");
    return;
  }

  let message = "Hola! Quiero hacer este pedido:%0A%0A";

  message += `👤 Cliente: ${encodeURIComponent(customerName)}%0A`;
  message += `🚚 Modalidad: ${encodeURIComponent(deliveryType)}%0A`;
  message += `💳 Pago: ${encodeURIComponent(paymentMethod)}%0A`;

  if (deliveryType === "Envío") {
    message += `📍 Dirección: ${encodeURIComponent(customerAddress)}%0A`;
  }

  message += "%0A🛒 Productos:%0A";

  let total = 0;

  cart.forEach(item => {
    const subtotal = item.price * item.quantity;
    total += subtotal;

    const priceText =
      item.price > 0
        ? `$${subtotal.toLocaleString("es-AR")}`
        : "A consultar";

    message += `• ${item.quantity}x ${encodeURIComponent(item.name)} (${encodeURIComponent(item.brand)}) — ${encodeURIComponent(priceText)}%0A`;
  });

  if (total > 0) {
    message += `%0A💰 Total estimado: $${total.toLocaleString("es-AR")}`;
  } else {
    message += "%0A💰 Total: A consultar";
  }

  message += "%0A%0A¿Me confirmás disponibilidad y costo de envío?";

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;

  window.open(whatsappUrl, "_blank");
}

function markError(inputId) {
  const input = document.getElementById(inputId);

  input.focus();
  input.style.borderColor = "#ef4444";

  setTimeout(() => {
    input.style.borderColor = "";
  }, 2000);
}

function filterProducts(category, button) {
  const products = document.querySelectorAll(".product-card");
  const filters = document.querySelectorAll(".filter");

  filters.forEach(filter => {
    filter.classList.remove("active");
  });

  button.classList.add("active");

  products.forEach(product => {
    const productCategory = product.dataset.category;

    if (category === "all" || productCategory === category) {
      product.style.display = "block";
    } else {
      product.style.display = "none";
    }
  });
}

renderCart();

(() => {
  "use strict";

  // Namespaced browser-storage key and upper bound used to keep saved cart quantities valid.
  const CART_KEY = "nextlevel-cart-v1";
  const MAX_QUANTITY = 1000000;
  // Loads package data supplied by packages.js and indexes it for constant-time ID lookups.
  const packages = Array.isArray(window.NL_PACKAGES) ? window.NL_PACKAGES : [];
  const packageById = new Map(packages.map((item) => [item.id, item]));
  let storageAvailable = true;

  // Reads and validates the saved cart; unavailable or malformed storage yields an empty cart.
  function loadCart() {
    try {
      const raw = window.localStorage.getItem(CART_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(parsed)) return [];
      return parsed
        .filter((entry) => entry && packageById.has(entry.id))
        .map((entry) => ({ id: entry.id, quantity: validQuantity(entry.quantity) }));
    } catch {
      storageAvailable = false;
      return [];
    }
  }

  // Converts a stored or entered quantity to a positive safe integer within the supported limit.
  function validQuantity(value) {
    const quantity = Number(value);
    return Number.isSafeInteger(quantity) && quantity > 0 ? Math.min(quantity, MAX_QUANTITY) : 1;
  }

  // Initializes in-memory cart state from browser storage.
  let cart = loadCart();

  // Persists cart changes and refreshes the shared badge, clear control, and storage warning.
  function saveCart() {
    try {
      window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch {
      storageAvailable = false;
    }
    updateBadges();
    updateClearButton();
    const storageNote = document.getElementById("storage-note");
    if (storageNote) storageNote.hidden = storageAvailable;
  }

  // Formats an amount as a whole-rand value using the South African number convention.
  function formatPrice(amount) {
    return `R${new Intl.NumberFormat("en-ZA", { maximumFractionDigits: 0 }).format(amount)}`;
  }

  // Adds quantities across every cart entry for the navigation badge and summary.
  function itemCount() {
    return cart.reduce((total, item) => total + item.quantity, 0);
  }

  // Updates every cart-count badge and its accessible label.
  function updateBadges() {
    document.querySelectorAll("[data-cart-count]").forEach((badge) => {
      badge.textContent = String(itemCount());
      badge.setAttribute("aria-label", `${itemCount()} items in cart`);
    });
  }

  // Disables the remove-all control when the cart has no entries.
  function updateClearButton() {
    const button = document.querySelector("[data-clear-cart]");
    if (button) button.disabled = cart.length === 0;
  }

  // Adds one unit of a known package, reports the result, and refreshes the cart view.
  function addToCart(id) {
    if (!packageById.has(id)) return;
    const existing = cart.find((item) => item.id === id);
    if (existing) existing.quantity = Math.min(existing.quantity + 1, MAX_QUANTITY);
    else cart.push({ id, quantity: 1 });
    saveCart();
    const status = document.getElementById("course-status");
    if (status) {
      const selected = packageById.get(id);
      status.textContent = `${selected.name} added to your cart. This is an estimate only.`;
    }
    renderCart();
  }

  // Validates and stores a changed quantity, then refreshes the cart view.
  function updateQuantity(id, value) {
    const item = cart.find((entry) => entry.id === id);
    if (!item) return;
    const quantity = Number(value);
    item.quantity = Number.isSafeInteger(quantity) && quantity > 0 ? Math.min(quantity, MAX_QUANTITY) : 1;
    saveCart();
    renderCart();
  }

  // Removes the selected package entry and refreshes persisted cart state and display.
  function removeFromCart(id) {
    cart = cart.filter((item) => item.id !== id);
    saveCart();
    renderCart();
  }

  // Builds a package-card element using text nodes so package copy is not interpreted as HTML.
  function cardFor(item) {
    const card = document.createElement("article");
    card.className = `course-card${item.id === "friends-family" ? " course-featured" : ""}`;
    const top = document.createElement("div");
    top.className = "course-card-top";
    const number = document.createElement("span");
    number.className = "package-number";
    number.textContent = item.number;
    const glyph = document.createElement("span");
    glyph.className = "package-glyph";
    glyph.setAttribute("aria-hidden", "true");
    glyph.textContent = item.glyph;
    top.append(number, glyph);

    const category = document.createElement("p");
    category.className = "course-category";
    category.textContent = item.categoryLabel;
    const title = document.createElement("h3");
    title.textContent = item.name;
    const description = document.createElement("p");
    description.className = "package-detail";
    description.textContent = item.detail;
    const audience = document.createElement("p");
    audience.className = "package-audience";
    audience.textContent = item.audience;
    const price = document.createElement("p");
    price.className = "package-price";
    const priceLabel = document.createElement("small");
    priceLabel.textContent = "FROM";
    const priceText = document.createElement("span");
    priceText.className = "price-amount";
    priceText.textContent = formatPrice(item.price);
    const unit = document.createElement("span");
    unit.className = "price-unit";
    unit.textContent = ` / ${item.unit}`;
    price.append(priceLabel, priceText, unit);
    const button = document.createElement("button");
    button.className = "button add-button";
    button.type = "button";
    button.dataset.addToCart = item.id;
    button.textContent = "Add to cart";
    card.append(top, category, title, description, audience, price, button);
    return card;
  }

  // Filters package data by the current search and category, then updates the catalog and empty state.
  function renderCourses() {
    const grid = document.getElementById("course-grid");
    if (!grid) return;
    const query = (document.getElementById("course-search")?.value || "").trim().toLowerCase();
    const category = document.getElementById("course-filter")?.value || "all";
    const filtered = packages.filter((item) => {
      const matchesCategory = category === "all" || item.category === category;
      const text = `${item.name} ${item.detail} ${item.audience} ${item.categoryLabel}`.toLowerCase();
      return matchesCategory && text.includes(query);
    });
    grid.replaceChildren(...filtered.map(cardFor));
    const count = document.getElementById("course-count");
    if (count) count.textContent = `${filtered.length} ${filtered.length === 1 ? "package" : "packages"} shown`;
    const empty = document.getElementById("course-empty");
    if (empty) empty.hidden = filtered.length > 0;
  }

  // Renders filtered cart rows while calculating totals from every cart entry, including hidden rows.
  function renderCart() {
    const list = document.getElementById("cart-items");
    if (!list) return;
    const search = (document.getElementById("cart-search")?.value || "").trim().toLowerCase();
    const category = document.getElementById("cart-filter")?.value || "all";
    const allItems = cart.map((entry) => ({ ...entry, product: packageById.get(entry.id) })).filter((entry) => entry.product);
    const visible = allItems.filter(({ product }) => {
      const text = `${product.name} ${product.detail} ${product.categoryLabel}`.toLowerCase();
      return (category === "all" || product.category === category) && text.includes(search);
    });

    list.replaceChildren();
    for (const { id, quantity, product } of visible) {
      const row = document.createElement("article");
      row.className = "cart-line";
      const info = document.createElement("div");
      info.className = "cart-line-info";
      const label = document.createElement("p");
      label.className = "package-number";
      label.textContent = `${product.number} · ${product.categoryLabel}`;
      const name = document.createElement("h3");
      name.textContent = product.name;
      const unit = document.createElement("p");
      unit.className = "cart-unit";
      unit.textContent = `${formatPrice(product.price)} / ${product.unit}`;
      info.append(label, name, unit);

      const quantityField = document.createElement("label");
      quantityField.className = "field quantity-field";
      const quantityLabel = document.createElement("span");
      quantityLabel.textContent = "Quantity";
      const input = document.createElement("input");
      input.type = "number";
      input.min = "1";
      input.max = String(MAX_QUANTITY);
      input.step = "1";
      input.inputMode = "numeric";
      input.value = String(quantity);
      input.setAttribute("aria-label", `Quantity for ${product.name}`);
      input.dataset.quantityFor = id;
      quantityField.append(quantityLabel, input);

      const total = document.createElement("p");
      total.className = "line-total";
      const totalLabel = document.createElement("span");
      totalLabel.textContent = "Line starting total";
      const totalAmount = document.createElement("strong");
      totalAmount.textContent = formatPrice(product.price * quantity);
      total.append(totalLabel, totalAmount);

      const remove = document.createElement("button");
      remove.className = "remove-button";
      remove.type = "button";
      remove.dataset.removeFromCart = id;
      remove.setAttribute("aria-label", `Remove ${product.name} from cart`);
      remove.textContent = "Remove";
      row.append(info, quantityField, total, remove);
      list.append(row);
    }

    const total = allItems.reduce((sum, { quantity, product }) => sum + product.price * quantity, 0);
    const count = document.getElementById("cart-count");
    if (count) count.textContent = `${visible.length} of ${allItems.length} ${allItems.length === 1 ? "package" : "packages"} shown`;
    const summaryItems = document.getElementById("summary-items");
    if (summaryItems) summaryItems.textContent = String(itemCount());
    const subtotal = document.getElementById("cart-subtotal");
    if (subtotal) subtotal.textContent = formatPrice(total);
    const empty = document.getElementById("cart-empty");
    const filteredEmpty = document.getElementById("cart-filter-empty");
    const isEmpty = allItems.length === 0;
    if (empty) empty.hidden = !isEmpty;
    if (filteredEmpty) filteredEmpty.hidden = isEmpty || visible.length > 0;
    list.hidden = isEmpty || visible.length === 0;
    const storageNote = document.getElementById("storage-note");
    if (storageNote) storageNote.hidden = storageAvailable;
  }

  // Delegates package-add, item-remove, and remove-all button actions from the document.
  document.addEventListener("click", (event) => {
    const add = event.target.closest("[data-add-to-cart]");
    if (add) addToCart(add.dataset.addToCart);
    const remove = event.target.closest("[data-remove-from-cart]");
    if (remove) removeFromCart(remove.dataset.removeFromCart);
    const clear = event.target.closest("[data-clear-cart]");
    if (clear) {
      cart = [];
      saveCart();
      renderCart();
    }
  });

  // Handles quantity edits and category changes for both the catalog and cart.
  document.addEventListener("change", (event) => {
    if (event.target.matches("[data-quantity-for]")) updateQuantity(event.target.dataset.quantityFor, event.target.value);
    if (event.target.id === "course-filter") renderCourses();
    if (event.target.id === "cart-filter") renderCart();
  });
  // Refreshes visible results immediately as the user types in either search field.
  document.addEventListener("input", (event) => {
    if (event.target.id === "course-search") renderCourses();
    if (event.target.id === "cart-search") renderCart();
  });

  // Renders only the page-specific view whose controls exist, then synchronizes shared cart UI.
  const courseSearch = document.getElementById("course-search");
  if (courseSearch) renderCourses();
  const cartSearch = document.getElementById("cart-search");
  if (cartSearch) renderCart();
  updateBadges();
  updateClearButton();

  // This static preview does not send form data; prevent navigation and explain the limitation in-page.
  const enquiryForm = document.getElementById("enquiry-form");
  if (enquiryForm) {
    enquiryForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const status = document.getElementById("form-status");
      if (status) status.textContent = "Your details are filled in, but this static preview cannot deliver the enquiry. A verified arena email or form destination must be connected before messages can be sent.";
    });
  }
})();

// All three pages read and write the same array under this one key.
const storageKey = "inventoryTrackerProducts";
let products = loadProducts();

function showMessage(elementId, text, isError) {
  const message = document.getElementById(elementId);
  message.textContent = text;
  message.className = "message";
  if (isError) {
    message.className = "message error";
  }
  message.hidden = text === "";
}

function validQuantity(quantity) {
  return Number.isSafeInteger(quantity) && quantity >= 0;
}

function validPrice(price) {
  return typeof price === "number" && Number.isFinite(price) && price >= 0;
}

function loadProducts() {
  try {
    const savedData = localStorage.getItem(storageKey);
    if (savedData === null) {
      return [];
    }
    const savedProducts = JSON.parse(savedData);
    if (!Array.isArray(savedProducts)) {
      throw new Error("Saved data must be an array.");
    }
    const validProducts = [];
    // Check saved objects too: browser storage can be edited outside the app.
    for (let i = 0; i < savedProducts.length; i++) {
      const product = savedProducts[i];
      if (product !== null && typeof product === "object" &&
          typeof product.name === "string" && product.name.trim() !== "" &&
          typeof product.category === "string" && product.category.trim() !== "" &&
          validQuantity(product.quantity) && validPrice(product.unitPrice) &&
          Number.isFinite(product.quantity * product.unitPrice)) {
        validProducts.push(product);
      }
    }
    if (validProducts.length !== savedProducts.length) {
      showMessage("storage-message", "Some saved products were invalid and have been left out. Your next successful save will keep only valid products.", true);
    }
    return validProducts;
  } catch (error) {
    showMessage("storage-message", "Saved inventory could not be read. Showing an empty inventory. If browser storage is available, the next save will start a new list.", true);
    return [];
  }
}

function saveProducts() {
  try {
    // JSON turns the array into text because localStorage stores text only.
    localStorage.setItem(storageKey, JSON.stringify(products));
    showMessage("storage-message", "", false);
    return true;
  } catch (error) {
    showMessage("storage-message", "Could not save your changes. Browser storage may be full or blocked. Your change has not been saved; please try again.", true);
    return false;
  }
}

function formatMoney(amount) {
  return "KSh " + amount.toLocaleString("en-KE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

// textContent displays names literally instead of treating them as HTML code.
function createTextElement(tagName, text, className) {
  const element = document.createElement(tagName);
  element.textContent = text;
  if (className) {
    element.className = className;
  }
  return element;
}

function stockStatus(quantity) {
  if (quantity < 5) {
    return "Low stock";
  }
  return "In stock";
}

function showDashboard() {
  let totalQuantity = 0;
  let totalValue = 0;
  let lowStockCount = 0;
  const list = document.getElementById("low-stock-list");
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    totalQuantity += product.quantity;
    totalValue += product.quantity * product.unitPrice;
    if (product.quantity < 5) {
      lowStockCount++;
      const item = document.createElement("div");
      item.className = "stock-item";
      const details = document.createElement("div");
      details.appendChild(createTextElement("strong", product.name));
      details.appendChild(createTextElement("p", product.category));
      item.appendChild(details);
      item.appendChild(createTextElement("span", product.quantity + " units · Low stock", "badge low"));
      list.appendChild(item);
    }
  }
  document.getElementById("total-products").textContent = products.length;
  document.getElementById("total-quantity").textContent = totalQuantity.toLocaleString("en-KE");
  document.getElementById("total-value").textContent = formatMoney(totalValue);
  document.getElementById("low-stock-count").textContent = lowStockCount + " products";
  const emptyMessage = document.getElementById("dashboard-empty");
  if (products.length === 0) {
    emptyMessage.textContent = "No products yet. Add your first product to see your stock summary.";
  } else if (lowStockCount === 0) {
    emptyMessage.textContent = "Stock looks good! All products have at least 5 units.";
  } else {
    emptyMessage.hidden = true;
  }
}

function showLatestProduct() {
  const latest = document.getElementById("latest-product");
  latest.textContent = "";
  if (products.length === 0) {
    latest.appendChild(createTextElement("p", "No products yet. Your latest product will appear here after you save it.", "empty-state"));
    return;
  }
  const product = products[products.length - 1];
  const details = document.getElementById("latest-template").content.cloneNode(true);
  details.querySelector("h3").textContent = product.name;
  details.querySelector(".latest-category").textContent = product.category;
  const values = [product.quantity, formatMoney(product.unitPrice), formatMoney(product.quantity * product.unitPrice), stockStatus(product.quantity)];
  const fields = details.querySelectorAll("dd");
  for (let i = 0; i < values.length; i++) {
    fields[i].textContent = values[i];
  }
  latest.appendChild(details);
}

// One function checks each field and displays its error beside the input.
function validateField(inputId, errorId, type) {
  const input = document.getElementById(inputId);
  const value = input.value.trim();
  let error = "";
  if (value === "") {
    error = "This field is required.";
  } else if (type === "quantity" && !validQuantity(Number(value))) {
    error = "Enter a whole number of 0 or more (within the safe number range).";
  } else if (type === "price" && !validPrice(Number(value))) {
    error = "Enter a numeric price of 0 or more.";
  }
  document.getElementById(errorId).textContent = error;
  input.setAttribute("aria-invalid", error !== "");
  return error === "";
}

function addProduct(event) {
  event.preventDefault(); // Keep the form on this page instead of reloading it.
  showMessage("form-message", "", false);
  const nameInput = document.getElementById("product-name");
  const categoryInput = document.getElementById("category");
  const quantityInput = document.getElementById("quantity");
  const priceInput = document.getElementById("unit-price");
  const name = nameInput.value.trim();
  const category = categoryInput.value.trim();
  const quantity = Number(quantityInput.value);
  const unitPrice = Number(priceInput.value);
  const nameValid = validateField("product-name", "name-error", "text");
  const categoryValid = validateField("category", "category-error", "text");
  const quantityValid = validateField("quantity", "quantity-error", "quantity");
  const priceValid = validateField("unit-price", "price-error", "price");
  if (!nameValid || !categoryValid || !quantityValid || !priceValid) {
    showMessage("form-message", "Please correct the highlighted fields, then save again.", true);
    document.querySelector('[aria-invalid="true"]').focus();
    return;
  }
  if (!Number.isFinite(quantity * unitPrice)) {
    showMessage("form-message", "This stock value is too large. Enter a smaller price or quantity.", true);
    return;
  }
  const product = { name: name, category: category, quantity: quantity, unitPrice: unitPrice };
  products.push(product);
  if (saveProducts()) {
    document.getElementById("product-form").reset();
    showMessage("form-message", name + " was added successfully.", false);
    showLatestProduct();
    nameInput.focus();
  } else {
    products.pop(); // Undo the in-memory addition if saving failed.
  }
}

function updateQuantity(productIndex, input, errorMessage) {
  const quantity = Number(input.value);
  const product = products[productIndex];
  showMessage("inventory-message", "", false);
  if (input.value.trim() === "" || !validQuantity(quantity) ||
      !Number.isFinite(quantity * product.unitPrice)) {
    errorMessage.textContent = "Enter a whole number of 0 or more with a valid stock value.";
    input.setAttribute("aria-invalid", "true");
    input.focus();
    return;
  }
  const previousQuantity = product.quantity;
  product.quantity = quantity;
  if (saveProducts()) {
    showInventory();
    showMessage("inventory-message", product.name + " quantity updated to " + quantity + ".", false);
    const updatedInput = document.getElementById("stock-" + productIndex);
    if (updatedInput) {
      updatedInput.focus();
    }
  } else {
    product.quantity = previousQuantity;
  }
}

function deleteProduct(productIndex) {
  const product = products[productIndex];
  if (window.confirm('Delete "' + product.name + '"? This cannot be undone.')) {
    products.splice(productIndex, 1);
    if (saveProducts()) {
      showInventory();
      showMessage("inventory-message", product.name + " was deleted.", false);
      document.getElementById("search").focus();
    } else {
      products.splice(productIndex, 0, product);
    }
  }
}

function showInventory() {
  const tableBody = document.getElementById("inventory-body");
  const searchText = document.getElementById("search").value.trim().toLowerCase();
  tableBody.textContent = "";
  let matchCount = 0;
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    if (!product.name.toLowerCase().includes(searchText)) {
      continue;
    }
    matchCount++;
    // Copy the HTML template, then fill it using textContent for safe text.
    const row = document.getElementById("product-row").content.firstElementChild.cloneNode(true);
    row.querySelector(".product-name").textContent = product.name;
    row.querySelector(".product-category").textContent = product.category;
    row.querySelector(".product-price").textContent = formatMoney(product.unitPrice);
    row.querySelector(".product-value").textContent = formatMoney(product.quantity * product.unitPrice);
    const input = row.querySelector("input");
    input.id = "stock-" + i;
    input.value = product.quantity;
    const label = row.querySelector("label");
    label.textContent = "Quantity for " + product.name;
    label.htmlFor = input.id;
    const errorMessage = row.querySelector(".row-error");
    errorMessage.id = "stock-error-" + i;
    input.setAttribute("aria-describedby", errorMessage.id);
    const status = row.querySelector(".stock-status");
    status.textContent = stockStatus(product.quantity);
    if (product.quantity < 5) {
      status.classList.add("low");
    }
    const updateButton = row.querySelector(".update-button");
    updateButton.setAttribute("aria-label", "Update quantity for " + product.name);
    // let i gives each button the correct original array index, even after searching.
    updateButton.addEventListener("click", function () {
      updateQuantity(i, input, errorMessage);
    });
    const deleteButton = row.querySelector(".delete-button");
    deleteButton.setAttribute("aria-label", "Delete " + product.name);
    deleteButton.addEventListener("click", function () {
      deleteProduct(i);
    });
    tableBody.appendChild(row);
  }
  document.getElementById("product-count").textContent = matchCount + " of " + products.length + " products";
  const emptyMessage = document.getElementById("inventory-empty");
  emptyMessage.hidden = matchCount > 0;
  document.getElementById("table-container").hidden = matchCount === 0;
  if (products.length === 0) {
    emptyMessage.textContent = "No products yet. Visit Add Product to start your inventory.";
  } else if (matchCount === 0) {
    emptyMessage.textContent = "No products match your search. Try another product name.";
  }
}

// The same script runs only the functions needed by the current HTML page.
const currentPage = document.body.dataset.page;
if (currentPage === "dashboard") {
  showDashboard();
} else if (currentPage === "add-product") {
  showLatestProduct();
  document.getElementById("product-form").addEventListener("submit", addProduct);
} else if (currentPage === "inventory") {
  showInventory();
  document.getElementById("search").addEventListener("input", function () {
    showMessage("inventory-message", "", false);
    showInventory();
  });
}

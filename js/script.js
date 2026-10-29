// PRODUCT DATA - an array of objects, like the arrays and objects in the reference.
// All three pages read and write the same array under this one key.
const storageKey = "inventoryTrackerProducts";
let products = loadProducts();

// getElementById finds an HTML element by its id.
// textContent changes the text displayed inside that element.
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
  // A whole number has no remainder when divided by 1.
  return Number.isFinite(quantity) && quantity >= 0 &&
    quantity % 1 === 0 && quantity <= 9007199254740991;
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
      showMessage("storage-message", "Saved inventory is not a product list. Showing an empty inventory. The next save will start a new list.", true);
      return [];
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
    // localStorage keeps text after refresh. JSON converts our array to text.
    // try/catch shows an error message if the browser cannot save the data.
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

// createElement makes an HTML element; appendChild adds it to the page.
// textContent displays names literally instead of treating them as HTML code.
function createTextElement(tagName, text, className) {
  const element = document.createElement(tagName);
  element.textContent = text;
  if (className) {
    element.className = className;
  }
  return element;
}

// DASHBOARD - use a for loop to calculate totals, like calculateAverage in functions.js.
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
  latest.appendChild(createTextElement("h3", product.name));
  latest.appendChild(createTextElement("p", product.category));
  const details = document.createElement("dl");
  const labels = ["Quantity", "Unit price", "Total value", "Stock status"];
  let stockStatus = "In stock";
  if (product.quantity < 5) {
    stockStatus = "Low stock";
  }
  const values = [product.quantity, formatMoney(product.unitPrice), formatMoney(product.quantity * product.unitPrice), stockStatus];
  for (let i = 0; i < labels.length; i++) {
    const row = document.createElement("div");
    row.appendChild(createTextElement("dt", labels[i]));
    row.appendChild(createTextElement("dd", values[i]));
    details.appendChild(row);
  }
  latest.appendChild(details);
}

function setFieldError(inputId, errorId, errorText) {
  document.getElementById(errorId).textContent = errorText;
  document.getElementById(inputId).setAttribute("aria-invalid", errorText !== "");
}

// ADD PRODUCT - read inputs, use if statements to validate, then save the object.
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
  let nameError = "";
  let categoryError = "";
  let quantityError = "";
  let priceError = "";
  if (name === "") {
    nameError = "Enter a product name.";
  }
  if (category === "") {
    categoryError = "Enter a category.";
  }
  // Check for blank input before Number(), because Number("") is zero.
  if (quantityInput.value.trim() === "" || !validQuantity(quantity)) {
    quantityError = "Enter a whole number of 0 or more (within the safe number range).";
  }
  if (priceInput.value.trim() === "" || !validPrice(unitPrice)) {
    priceError = "Enter a numeric price of 0 or more.";
  } else if (!Number.isFinite(quantity * unitPrice)) {
    priceError = "This stock value is too large. Enter a smaller price or quantity.";
  }
  setFieldError("product-name", "name-error", nameError);
  setFieldError("category", "category-error", categoryError);
  setFieldError("quantity", "quantity-error", quantityError);
  setFieldError("unit-price", "price-error", priceError);
  if (nameError || categoryError || quantityError || priceError) {
    showMessage("form-message", "Please correct the highlighted fields, then save again.", true);
    document.querySelector('[aria-invalid="true"]').focus();
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

// INVENTORY - loop through the array and create a table row for each matching product.
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
    const row = document.createElement("tr");
    row.appendChild(createTextElement("td", product.name));
    row.appendChild(createTextElement("td", product.category));
    const quantityCell = document.createElement("td");
    const input = document.createElement("input");
    input.type = "number";
    input.min = "0";
    input.step = "1";
    input.id = "stock-" + i;
    input.value = product.quantity;
    input.className = "quantity-input";
    const label = createTextElement("label", "Quantity for " + product.name, "visually-hidden");
    label.htmlFor = input.id;
    const errorMessage = createTextElement("span", "", "field-error row-error");
    errorMessage.id = "stock-error-" + i;
    errorMessage.setAttribute("role", "alert");
    input.setAttribute("aria-describedby", errorMessage.id);
    quantityCell.appendChild(label);
    quantityCell.appendChild(input);
    quantityCell.appendChild(errorMessage);
    row.appendChild(quantityCell);
    row.appendChild(createTextElement("td", formatMoney(product.unitPrice)));
    row.appendChild(createTextElement("td", formatMoney(product.quantity * product.unitPrice)));
    const statusCell = document.createElement("td");
    if (product.quantity < 5) {
      statusCell.appendChild(createTextElement("span", "Low stock", "badge low"));
    } else {
      statusCell.appendChild(createTextElement("span", "In stock", "badge"));
    }
    row.appendChild(statusCell);
    const actionsCell = document.createElement("td");
    const actions = document.createElement("div");
    actions.className = "actions";
    const updateButton = createTextElement("button", "Update");
    updateButton.type = "button";
    updateButton.setAttribute("aria-label", "Update quantity for " + product.name);
    // let i gives each button the correct original array index, even after searching.
    updateButton.addEventListener("click", function () {
      updateQuantity(i, input, errorMessage);
    });
    const deleteButton = createTextElement("button", "Delete", "delete-button");
    deleteButton.type = "button";
    deleteButton.setAttribute("aria-label", "Delete " + product.name);
    deleteButton.addEventListener("click", function () {
      deleteProduct(i);
    });
    actions.appendChild(updateButton);
    actions.appendChild(deleteButton);
    actionsCell.appendChild(actions);
    row.appendChild(actionsCell);
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
// addEventListener runs a function when the user submits a form or clicks a button.
const currentPage = document.body.id;
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

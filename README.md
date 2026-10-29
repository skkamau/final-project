# Inventory Tracker

A simple school project that helps a small shop record products, track stock quantities, calculate inventory value and identify products that need restocking.

## The problem it solves

A shopkeeper using a paper list can lose track of available stock and its value. Inventory Tracker keeps a product list in the browser and calculates the totals automatically. Products with fewer than five units are clearly marked as low stock, including products with zero units.

## Features

- Dashboard showing the number of products, total units and total inventory value.
- Low-stock list for products with fewer than five units.
- A separate Add Product page with name, category, quantity and unit price.
- Clear validation errors for blank text, missing numbers, negative numbers, non-numeric values and fractional quantities.
- Zero quantity and zero price are allowed.
- Latest added product and a success message after saving.
- Inventory table with product name, category, quantity, unit price, total value and stock status.
- Search by product name, ignoring capitalisation.
- Quantity updates and deletion with confirmation.
- Useful empty states and messages when browser storage fails or contains invalid data.
- Shared navigation, labelled inputs, keyboard focus styles and responsive CSS.

## Technologies used

- HTML5 for page structure.
- CSS3, Flexbox, CSS Grid and media queries for layout.
- Plain JavaScript for arrays, objects, loops, functions, validation and event listeners.
- Browser localStorage for persistence.
- Git for version control.

There are no frameworks, external libraries, build steps, backend or database in the application.

## Files and how the code works

```text
index.html          Dashboard
add-product.html    Form and latest added product
inventory.html      Searchable inventory table
css/style.css       Shared styles and responsive layouts
js/script.js        Shared storage, validation and page logic
README.md           Project documentation
```

Each HTML page loads the same CSS and JavaScript files. The `id` on the body tells the script which page functions to run.

The script loads an array of product objects. `showDashboard()` uses a loop to add quantities and calculate quantity multiplied by unit price. `addProduct()` uses explicit if statements to check each form field before adding an object to the array. `showInventory()` loops through matching products and creates table rows. Each row's buttons use event listeners to update or delete the correct product.

The code uses ordinary named functions, variables, arrays, simple objects, for loops, if/else statements, arithmetic and string concatenation. Quantity validation uses the remainder operator (`quantity % 1`) to reject fractional numbers. There are no HTML templates, cloning, classes, arrow functions or destructuring in the application JavaScript.

Important logic is explained with comments. User-entered text is displayed with `textContent`, so a product name containing HTML is displayed as ordinary text.

The beginner-friendly structure was informed by the HTML, CSS and JavaScript examples in [Foundations- / week-one / first-web-page](https://github.com/mutuajoseph/Foundations-/tree/main/week-one/first-web-page).

The tracker is new project code, not code copied from that repository. The reference demonstrates the basic language concepts and HTML forms and tables. This working tracker also needs browser methods that are not demonstrated in those reference files: `getElementById`, `createElement`, `appendChild`, `textContent`, `addEventListener`, `localStorage`, JSON conversion, numeric checks and `try/catch`. These support the original requirements for interactive pages, validation, safe text display, persistence and storage error handling. CSS Grid, Flexbox and media queries support the requested responsive layout.

## How to run and preview in VS Code

1. Open this project folder in VS Code.
2. Install **Live Server** by Ritwick Dey from the VS Code Extensions panel if it is not installed.
3. Right-click `index.html` and choose **Open with Live Server**.
4. Use the navigation links to move between the three pages.
5. Keep using the same browser and the same preview address and port so your saved products stay available.

Live Server is only a development preview tool; the application itself runs entirely in the browser. No packages or build commands are required.

Opening the files directly may display the pages, but `file://` storage behaviour varies between browsers and pages. Use Live Server or another static HTTP server to reliably share saved products between the pages.

## How localStorage is used

All pages use one key: `inventoryTrackerProducts`.

Products are stored in the order they were added. Each product is a simple object:

```javascript
{
  name: "Exercise book",
  category: "Stationery",
  quantity: 4,
  unitPrice: 80
}
```

`JSON.stringify()` converts the array to text when saving. `JSON.parse()` converts the saved text back to an array when loading. Additions, quantity updates and deletions are saved immediately. If a save fails, the change is undone in the in-memory array and an error is displayed.

Missing storage starts an empty list. Malformed JSON or a non-array value shows a warning and an empty list. Invalid individual product objects are left out while valid products remain visible. The app does not automatically rewrite invalid saved data when loading; the next successful change saves the currently valid list.

## Manual testing checklist

- [ ] Open every navigation link from all three pages.
- [ ] With no saved products, check the dashboard, latest-product and inventory empty messages.
- [ ] Submit blank and whitespace-only names and categories; check the errors.
- [ ] Try blank, negative and non-numeric quantity and price values. Try a fractional quantity such as `2.5`.
- [ ] Add a product with quantity `0` and price `0`; confirm it saves and is low stock.
- [ ] Add Exercise book: quantity `4`, price `80`, and Pen: quantity `5`, price `20`. With no other products, expect 2 products, 9 units and KSh 420.00. Only Exercise book should be low stock.
- [ ] Refresh and move between pages; confirm saved products remain and the latest product is shown.
- [ ] Search for `PEN`, then a nonexistent name. Clear the search to restore all rows.
- [ ] Search for one product and update its quantity; confirm the correct product changes.
- [ ] Reject blank, negative, non-numeric and fractional stock updates. Allow a zero update.
- [ ] Update Pen to `3`; expect 7 units and KSh 380.00 on the dashboard, with both products low stock.
- [ ] Cancel a deletion, then confirm a deletion. Refresh to check it persists.
- [ ] Delete all test products and check the empty messages return.
- [ ] Enter a name such as `<b>Book</b>`; confirm it appears literally, without bold formatting.
- [ ] In browser developer tools, temporarily set the storage key to malformed JSON such as `{bad`, then refresh; confirm the app shows a warning instead of crashing. Use disposable test data for this check.
- [ ] Check all pages at desktop, tablet and mobile widths. Confirm the table scrolls sideways on a narrow screen and its Update and Delete buttons are reachable.
- [ ] Navigate the forms and buttons with the keyboard and check visible focus outlines.

## Verification performed during development

- JavaScript syntax check passed with `node --check js/script.js`.
- A temporary, external jsdom test harness passed 106 assertions covering navigation links, empty states, validation, safe text display, persistence across page loads, calculations, low-stock boundaries, search, filtered updates, deletion confirmation and storage errors. No testing dependencies were added to this project.
- The local static preview returned HTTP 200.
- Visual checks at desktop and mobile sizes remain to be completed: browser automation stopped because it could not verify Chrome's current URL. Responsive layouts and horizontal table scrolling are implemented but have not been visually verified.

## Known bugs and limitations

- No known functional bugs were found by the checks above; manual browser and layout checks are still needed.
- Data is stored only in the current browser and is not shared across devices or browsers.
- Changing the website address or port creates a different localStorage area. Local preview data will not automatically appear on GitHub Pages.
- Clearing browser data removes the inventory. There is no backup, account system or undo for deletion.
- Private browsing may remove data when the session closes. Browser settings or storage limits may prevent saving.
- Multiple open tabs do not synchronise automatically. Refresh before making changes in another tab; concurrent edits can overwrite one another.
- Prices and totals use KSh. Values are displayed to two decimal places; ordinary JavaScript floating-point arithmetic can have small rounding differences. This is a school stock tracker, not an accounting system.
- Quantities must be within JavaScript's safe integer range, and prices and product values must be finite numbers. The app is intended for ordinary small-shop stock levels.
- Duplicate product names are allowed and are treated as separate products.
- Only stock quantities can be edited. Correcting a name, category or price requires deleting and adding the product again.
- The latest-product panel shows the most recently added product that is still in the inventory.

## GitHub and hosting

Suggested repository description:

> A simple inventory tracker built with HTML, CSS and JavaScript to manage products, track stock levels and calculate inventory value.

Repository: [skkamau/final-project](https://github.com/skkamau/final-project).

The project uses the `main` branch with descriptive Git commits. To publish the website, open the repository's **Settings > Pages**, choose **Deploy from a branch**, select **main** and **/ (root)**, then save. This static application needs no build step. The deployed site will start with an empty inventory in each visitor's browser.

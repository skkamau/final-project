# Inventory Tracker

## Purpose

A simple inventory tracker for a small shop. It helps record products, check available stock and calculate the total stock value.

## Features

- Three linked pages: Dashboard, Add Product and Inventory.
- Dashboard totals for products, stock quantity and inventory value in KSh.
- Low-stock labels for products with fewer than 5 units.
- Product form with name, category, quantity and unit price.
- Validation rejects blank fields, negative values, non-numeric values and fractional quantities. Zero quantity and zero price are allowed.
- Search by product name, update quantities and delete products with confirmation.
- Products are saved in localStorage under `inventoryTrackerProducts` and remain available after refreshing.
- Labelled inputs, clear error messages, keyboard focus outlines and layouts for different screen sizes.

## Setup

1. Download or clone this repository and open the folder in VS Code.
2. Install the Live Server extension if needed.
3. Right-click `index.html` and select **Open with Live Server**.
4. Use the navigation links to move between pages.

No packages or build steps are required. Use the same browser and preview address to access your saved products.

## Technologies

- HTML for page structure and forms.
- CSS, Flexbox, Grid and media queries for styling and layout.
- Plain JavaScript for validation, calculations and page interactions.
- localStorage for saving product data in the browser.
- Git and GitHub for version control.

## Limitations

- Data is stored only in the current browser and website address. It is not shared across devices or browsers.
- Clearing browser data removes the inventory. There is no backup or undo for deletion.
- Browser settings or private browsing may prevent saving or remove saved data.
- Changes in multiple tabs do not synchronise automatically.
- Only quantities can be edited. To change a name, category or price, delete and add the product again.
- Prices use ordinary JavaScript calculations and may have small rounding differences.

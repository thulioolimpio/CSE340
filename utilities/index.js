const invModel = require('../models/inventory-model');

// Formatação de valores
function formatPrice(price) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(price);
}

function formatMileage(miles) {
  return new Intl.NumberFormat('en-US').format(miles);
}

// Build Vehicle Detail View
function buildDetailView(data) {
  return `
    <div class="detail-container">
      <div class="detail-image">
        <img src="${data.inv_image}" alt="${data.inv_make} ${data.inv_model}">
      </div>
      <div class="detail-info">
        <h2>${data.inv_year} ${data.inv_make} ${data.inv_model}</h2>
        <p><strong>Price:</strong> ${formatPrice(data.inv_price)}</p>
        <p><strong>Mileage:</strong> ${formatMileage(data.inv_miles)} miles</p>
        <p><strong>Color:</strong> ${data.inv_color}</p>
        <p><strong>Description:</strong> ${data.inv_description}</p>
        <p><strong>Classification:</strong> ${data.classification_name}</p>
      </div>
    </div>
  `;
}

// Navigation
async function getNav() {
  try {
    const data = await invModel.getClassifications();
    let nav = '<ul>';
    data.rows.forEach(item => {
      nav += `<li><a href="/inv/type/${item.classification_id}">${item.classification_name}</a></li>`;
    });
    nav += '</ul>';
    return nav;
  } catch (error) {
    console.error("Error building navigation:", error);
    return buildFallbackNav();
  }
}

function buildFallbackNav() {
  return '<ul><li><a href="/">Home</a></li><li><a href="/inv">Inventory</a></li></ul>';
}

// Error Handling Wrapper
function handleErrors(fn) {
  return function(req, res, next) {
    return fn(req, res, next).catch(next);
  };
}

module.exports = {
  buildDetailView,
  getNav,
  handleErrors,
  formatPrice,
  formatMileage
};
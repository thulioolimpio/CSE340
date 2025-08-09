const invModel = require('./../models/inventory-model');

// Debug: Verifique o módulo carregado
console.log('Módulo invModel carregado:', invModel ? 'Sim' : 'Não');
console.log('Métodos disponíveis:', Object.keys(invModel || {}));

// Funções auxiliares
function formatPrice(price) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(price);
}

function formatMileage(miles) {
  return new Intl.NumberFormat('en-US').format(miles);
}

function buildFallbackNav() {
  return '<ul><li><a href="/">Home</a></li><li><a href="/inv">Inventory</a></li></ul>';
}

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

async function getNav() {
  try {
    // Verificação ANTES de chamar a função
    if (!invModel || typeof invModel.getClassifications !== 'function') {
      console.error('Erro crítico: invModel não carregado corretamente');
      console.error('Conteúdo de invModel:', invModel);
      return buildFallbackNav();
    }

    console.log('Chamando invModel.getClassifications()');
    const data = await invModel.getClassifications();
    console.log('Dados recebidos:', data);

    if (!data || !Array.isArray(data)) {
      console.error('Invalid classifications data:', data);
      return buildFallbackNav();
    }

    let navList = '<ul>';
    data.forEach((item) => {
      navList += `<li><a href="/inv/type/${item.classification_id}">${item.classification_name}</a></li>`;
    });
    navList += '</ul>';
    
    return navList;
  } catch (error) {
    console.error('Error building navigation:', error);
    return buildFallbackNav();
  }
}

async function buildClassificationList(classification_id = null) {
  try {
    if (!invModel || typeof invModel.getClassifications !== 'function') {
      console.error('Modelo não carregado para buildClassificationList');
      return '<select><option>Error loading classifications</option></select>';
    }

    const data = await invModel.getClassifications();
    let classificationList = '<select name="classification_id" id="classificationList" required>';
    classificationList += "<option value=''>Choose a Classification</option>";
    
    data.forEach((row) => {
      classificationList += `<option value="${row.classification_id}"`;
      if (classification_id != null && row.classification_id == classification_id) {
        classificationList += " selected ";
      }
      classificationList += `>${row.classification_name}</option>`;
    });
    
    classificationList += "</select>";
    return classificationList;
  } catch (error) {
    console.error('Error building classification list:', error);
    return '<select><option>Error loading classifications</option></select>';
  }
}

function handleErrors(fn) {
  return function(req, res, next) {
    return fn(req, res, next).catch(next);
  };
}

// Exportação única
module.exports = {
  buildDetailView,
  getNav,
  buildClassificationList,
  handleErrors,
  formatPrice,
  formatMileage,
  buildFallbackNav
};
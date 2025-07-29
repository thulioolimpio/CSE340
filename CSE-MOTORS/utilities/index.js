function buildDetailHTML(vehicle) {
  return `
    <div class="vehicle-detail">
      <img src="${vehicle.inv_image}" alt="Imagem do ${vehicle.inv_make} ${vehicle.inv_model}">
      <div class="vehicle-info">
        <h2>${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}</h2>
        <p><strong>Preço:</strong> $${vehicle.inv_price.toLocaleString()}</p>
        <p><strong>Quilometragem:</strong> ${vehicle.inv_miles.toLocaleString()} milhas</p>
        <p><strong>Cor:</strong> ${vehicle.inv_color}</p>
        <p><strong>Descrição:</strong> ${vehicle.inv_description}</p>
      </div>
    </div>
  `;
}

module.exports = {
  buildDetailHTML
};

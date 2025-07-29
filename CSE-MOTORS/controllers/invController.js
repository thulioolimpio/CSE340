const invModel = require('../models/inventoryModel');
const utilities = require('../utilities');

async function buildDetailView(req, res, next) {
  try {
    const invId = parseInt(req.params.inv_id);
    const data = await invModel.getVehicleById(invId);

    if (!data) {
      return next(new Error("Veículo não encontrado."));
    }

    const pageHtml = utilities.buildDetailHTML(data);

    res.render("inventory/detail", {
      title: `${data.inv_make} ${data.inv_model}`,
      pageHtml
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  buildDetailView,
};

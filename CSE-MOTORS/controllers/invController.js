// controllers/invController.js
const invModel = require("../models/inventoryModel");
const utilities = require("../utilities");
const detailUtil = require("../utilities/invDetailTemplate");

async function buildById(req, res, next) {
  try {
    const inv_id = req.params.inv_id;
    const vehicle = await invModel.getVehicleById(inv_id);
    const nav = await utilities.getNav(); // você pode manter o nav fixo se preferir
    const html = detailUtil.buildDetailView(vehicle);

    res.render("inventory/detail", {
      title: `${vehicle.inv_make} ${vehicle.inv_model}`,
      nav,
      content: html
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { buildById };

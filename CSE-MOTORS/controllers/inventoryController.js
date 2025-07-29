const utilities = require("../utilities");
const invModel = require("../models/inventory-model");

// Build inventory by inventory_id view
async function buildByInventoryId(req, res, next) {
  const inv_id = req.params.invId;
  const data = await invModel.getInventoryItemById(inv_id);
  if (!data) {
    next(new Error("Inventory item not found"));
    return;
  }
  const grid = await utilities.buildDetailView(data);
  res.render("./inventory/detail", {
    title: `${data.inv_make} ${data.inv_model}`,
    grid,
  });
}

// Don't forget to export the new function
module.exports = { buildByClassificationId, buildByInventoryId };
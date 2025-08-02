const utilities = require('../utilities');
const invModel = require('../models/inventory-model');

async function buildByInvId(req, res, next) {
  const invId = req.params.invId;
  try {
    const data = await invModel.getInventoryItemById(invId);
    if (!data) {
      throw new Error('Vehicle not found');
    }
    const detailHTML = await utilities.buildDetailView(data);
    res.render("./inventory/detail", {
      title: `${data.inv_make} ${data.inv_model}`,
      detailHTML,
      nav: await utilities.getNav()
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { buildByInvId };
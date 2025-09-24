const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

invCont.buildByClassificationId = async function (req, res, next) {
  try {
    const classification_id = req.params.classificationId
    const data = await invModel.getInventoryByClassificationId(classification_id)
    const nav = await utilities.getNav()
    
    let grid = await utilities.buildClassificationGrid(data)
    let title = "Vehicles"
    
    if (data && data.length > 0) {
      title = data[0].classification_name + " vehicles"
    }
    
    res.render("inventory/classification", {
      title,
      nav,
      grid,
    })
  } catch (error) {
    console.error("Error in buildByClassificationId: ", error)
    res.redirect("/")
  }
}

module.exports = invCont
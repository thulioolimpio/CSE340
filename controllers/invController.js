const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 * Build vehicles by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  try {
    const classification_id = req.params.classificationId
    const data = await invModel.getInventoryByClassificationId(classification_id)
    const nav = await utilities.getNav()

    const grid = await utilities.buildClassificationGrid(data)
    let title = "Vehicles"

    if (data && data.length > 0) {
      title = `${data[0].classification_name} vehicles`
    }

    res.render("inventory/classification", {
      title,
      nav,
      grid,
    })
  } catch (error) {
    console.error("Error in buildByClassificationId: ", error)
    next(error)
  }
}

/* ***************************
 * Build single vehicle detail view
 * ************************** */
invCont.buildDetail = async function (req, res, next) {
  try {
    const invId = parseInt(req.params.invId, 10)
    if (isNaN(invId)) {
      const err = new Error("Invalid vehicle id")
      err.status = 400
      throw err
    }

    const data = await invModel.getInventoryById(invId)
    if (!data) {
      const err = new Error("Vehicle not found")
      err.status = 404
      throw err
    }

    const nav = await utilities.getNav()
    const detail = utilities.buildVehicleDetailHTML(data)
    const title = `${data.inv_make} ${data.inv_model}`

    res.render("inventory/detail", {
      title,
      nav,
      detail,
    })
  } catch (error) {
    console.error("Error in buildDetail:", error)
    next(error)
  }
}

/* ***************************
 * Trigger an intentional 500 error (Task 3)
 * Route -> Controller -> throw error -> handled by global error middleware
 * ************************** */
invCont.triggerError = async function (req, res, next) {
  try {
    const err = new Error("Intentional 500 error - for testing")
    err.status = 500
    throw err
  } catch (error) {
    next(error)
  }
}

module.exports = invCont

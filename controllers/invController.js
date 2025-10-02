const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 * Management View
 * ************************** */
invCont.buildManagement = async (req, res, next) => {
  try {
    const nav = await utilities.getNav()
    const message = req.session.message || null
    req.session.message = null // limpa a mensagem após exibir

    res.render("inventory/management", {
      title: "Inventory Management",
      nav,
      message,
    })
  } catch (error) {
    next(error)
  }
}

/* ***************************
 * Build Add Classification View
 * ************************** */
invCont.buildAddClassification = async (req, res, next) => {
  try {
    const nav = await utilities.getNav()
    res.render("inventory/add-classification", {
      title: "Add New Classification",
      nav,
      classification_name: "",
      errors: null,
      message: null,
    })
  } catch (error) {
    next(error)
  }
}

/* ***************************
 * Build Add Inventory View
 * ************************** */
invCont.buildAddInventory = async (req, res, next) => {
  try {
    const nav = await utilities.getNav()
    
    // Pega todas as classificações do banco
    const classifications = await invModel.getClassifications()
    
    // Monta as opções do select como HTML
    let classificationList = ''
    classifications.rows.forEach(c => {
      classificationList += `<option value="${c.classification_id}">${c.classification_name}</option>`
    })

    res.render("inventory/add-inventory", {
      title: "Add New Vehicle",
      nav,
      classificationList,
      inv_make: "",
      inv_model: "",
      inv_year: "",
      inv_description: "",
      inv_price: "",
      inv_miles: "",
      inv_thumbnail: "/images/no-image.png",
      inv_image: "/images/no-image.png",
      classification_id: "",
      errors: null,
      message: null,
    })
  } catch (error) {
    next(error)
  }
}

/* ***************************
 * Process Add Classification
 * ************************** */
invCont.addClassification = async (req, res, next) => {
  try {
    const { classification_name } = req.body
    const result = await invModel.addClassification(classification_name)

    if (result) {
      req.session.message = `Successfully added ${classification_name} classification!`
      return res.redirect("/inv/")
    } else {
      throw new Error("Failed to add classification.")
    }
  } catch (error) {
    console.error("Error in addClassification:", error)
    next(error)
  }
}

/* ***************************
 * Process Add Inventory
 * ************************** */
invCont.addInventory = async (req, res, next) => {
  try {
    const {
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_price,
      inv_miles,
      inv_thumbnail,
      inv_image,
      classification_id,
    } = req.body

    const result = await invModel.addInventory({
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_price,
      inv_miles,
      inv_thumbnail,
      inv_image,
      classification_id,
    })

    if (result) {
      req.session.message = `Successfully added ${inv_make} ${inv_model}!`
      return res.redirect("/inv/")
    } else {
      throw new Error("Failed to add vehicle.")
    }
  } catch (error) {
    console.error("Error in addInventory:", error)
    next(error)
  }
}

/* ***************************
 * Existing Controllers
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
    next(error)
  }
}

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
    next(error)
  }
}

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

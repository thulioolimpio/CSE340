const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")
const { body, validationResult } = require("express-validator") 

const invCont = {}

/* ***************************
 * Management View
 * ************************** */
invCont.buildManagement = async (req, res, next) => {
  try {
    const nav = await utilities.getNav()
    const message = req.session.message || null
    req.session.message = null

    // Usando 'classificationSelect' para consistência no controlador
    const classificationSelect = await utilities.buildClassificationList()

    res.render("inventory/management", {
      title: "Inventory Management",
      nav,
      message,
      classificationSelect,
      errors: null,
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
    const classificationList = await utilities.buildClassificationList() // Carrega a lista

    res.render("inventory/add-inventory", {
      title: "Add New Vehicle",
      nav,
      // Passando a lista de classificações para a view
      classificationList: classificationList,
      inv_make: "",
      inv_model: "",
      inv_year: "",
      inv_description: "",
      inv_price: "",
      inv_miles: "",
      inv_thumbnail: "/images/vehicles/no-image.png",
      inv_image: "/images/vehicles/no-image.png",
      inv_color: "",
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
      await utilities.rebuildNav() 
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
      inv_color,
      classification_id,
    } = req.body

    // 1. Checa por erros de validação
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        const nav = await utilities.getNav()
        // Busca a lista de classificações em caso de erro
        const classificationList = await utilities.buildClassificationList(classification_id) 

        // Renderiza a view com sticky data e erros
        return res.render("inventory/add-inventory", {
            title: "Add New Vehicle",
            nav,
            errors: errors.array(),
            classificationList,
            // Passa todos os dados do formulário de volta para a view
            inv_make,
            inv_model,
            inv_year,
            inv_description,
            inv_price,
            inv_miles,
            inv_thumbnail,
            inv_image,
            inv_color,
            classification_id,
            message: null,
        })
    }

    // 2. Procede com a inserção no banco de dados
    // Nota: O invModel.addInventory espera um objeto, conforme seu código.
    const result = await invModel.addInventory({
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_price,
      inv_miles,
      inv_thumbnail,
      inv_image,
      inv_color,
      classification_id,
    })

    if (result) {
      req.session.message = `Successfully added ${inv_make} ${inv_model}!`
      return res.redirect("/inv/")
    } else {
        // Se a adição falhar no banco de dados
        const nav = await utilities.getNav()
        const classificationList = await utilities.buildClassificationList(classification_id)
        
        req.session.message = "Failed to add vehicle. Please try again.";
        
        return res.render("inventory/add-inventory", {
            title: "Add New Vehicle",
            nav,
            errors: null,
            classificationList,
            // Mantém os dados antigos no formulário
            inv_make, inv_model, inv_year, inv_description, inv_price, 
            inv_miles, inv_thumbnail, inv_image, inv_color, classification_id,
            message: req.session.message,
        })
    }
  } catch (error) {
    console.error("Error in addInventory:", error)
    // Tratamento de erro inesperado
    const nav = await utilities.getNav()
    const classificationList = await utilities.buildClassificationList(req.body.classification_id)
    
    return res.render("inventory/add-inventory", {
        title: "Add New Vehicle",
        nav,
        errors: [{ msg: "An unexpected error occurred during vehicle registration." }],
        classificationList,
        // Garante que o body esteja definido para o spread operator
        ...(req.body || {}), 
        message: req.session.message,
    })
  }
}

/* ***************************
 * Build Inventory by Classification View (Client View)
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
      errors: null,
    })
  } catch (error) {
    next(error)
  }
}

/* ***************************
 * Build Vehicle Detail View (Client View)
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
      errors: null,
    })
  } catch (error) {
    next(error)
  }
}

/* ***************************
 * Trigger intentional 500 error
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

/* ***************************
 * Return Inventory by Classification As JSON (AJAX)
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  
  // Adicionando uma verificação de segurança para garantir que classification_id seja um número válido
  if (isNaN(classification_id)) {
        return res.status(400).json({ error: "Invalid classification ID" });
  }

  const invData = await invModel.getInventoryByClassificationId(classification_id)
  
  // Adicionando uma verificação de segurança para a resposta
  if (invData.length > 0) { 
    return res.json(invData)
  } else {
    // Retorna um array vazio ou uma mensagem de sucesso com status 200, 
    // mas sem dados, em vez de um erro 500, para que o AJAX possa tratar.
    return res.json([]) 
  }
}

/* ***************************
 * Build edit inventory view (Step 1 of Update)
 * ************************** */
invCont.buildEditView = async function (req, res, next) {
  const inv_id = parseInt(req.params.invId) 
  
  // Checa se inv_id é um número válido para evitar crash no banco
  if (isNaN(inv_id)) {
      return next({status: 400, message: "Invalid inventory ID provided."});
  }
  
  const itemData = await invModel.getInventoryById(inv_id)
  
  // Se o item não for encontrado
  if (!itemData) {
      return next({status: 404, message: "Sorry, vehicle not found."});
  }
  
  let nav = await utilities.getNav()
  const classificationSelect = await utilities.buildClassificationList(itemData.classification_id)
  
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`
  
  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id 
  })
}

/* ***************************
 * Process Update Inventory (Step 2 of Update)
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  // Checagem de validação de formulário (é crucial para o Teste Três ser concluído!)
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        const nav = await utilities.getNav()
        const classificationSelect = await utilities.buildClassificationList(req.body.classification_id)
        const itemName = `${req.body.inv_make} ${req.body.inv_model}` 

        req.flash("error", "Please correct the errors below.")
        
        return res.render("inventory/edit-inventory", {
            title: "Edit " + itemName,
            nav,
            classificationSelect: classificationSelect,
            errors: errors.array(), 
            ...req.body, // Passa todos os dados de volta para o formulário
        })
    }
    
    // Se a validação passar, continua com a lógica de atualização
    const {
      inv_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_price,
      inv_miles,
      inv_image,
      inv_thumbnail,
      inv_color,
      classification_id,
    } = req.body

    // ... (Resto da sua lógica de updateInventory)
    
    const itemData = await invModel.getInventoryById(inv_id)
  
    if (!itemData) {
        req.session.message = "Sorry, the item to update was not found.";
        return res.redirect("/inv/");
    }
  
    const itemName = `${inv_make} ${inv_model}` 
    let updateResult;

    try {
        updateResult = await invModel.updateInventory(
          inv_id,
          inv_make,
          inv_model,
          inv_description,
          inv_image,
          inv_thumbnail,
          inv_price,
          inv_year,
          inv_miles,
          inv_color,
          classification_id
        )
    } catch (error) {
  	    console.error("Database update failed:", error);
  	    req.session.message = "Sorry, the update failed due to a database error.";
  	
  	    const classificationSelect = await utilities.buildClassificationList(classification_id)
  	
  	    return res.render("inventory/edit-inventory", {
  		    title: "Edit " + itemName,
  		    nav: await utilities.getNav(),
  		    classificationSelect: classificationSelect,
  		    errors: null, 
  		    ...req.body,
  	    })
    }
  
    if (updateResult) {
  	    req.session.message = `${itemName} was successfully updated.`;
  	    return res.redirect("/inv/");
  	} else {
  	    req.session.message = "The update was not applied. Ensure you made changes to the vehicle details.";
  	
  	    const classificationSelect = await utilities.buildClassificationList(classification_id)
  	
  	    res.render("inventory/edit-inventory", {
  		    title: "Edit " + itemName,
  		    nav: await utilities.getNav(),
  		    classificationSelect: classificationSelect,
  		    errors: null,
  		    ...req.body,
  	    })
  	}
}

module.exports = invCont
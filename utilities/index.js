const jwt = require("jsonwebtoken")
require("dotenv").config()
const invModel = require("../models/inventory-model")
const Util = {}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function () {
    try {
        const data = await invModel.getClassifications()
        let list = '<ul class="nav-menu">'
        list += '<li><a href="/" class="nav-link" title="Home page">Home</a></li>'

        data.rows.forEach((row) => {
            list += `<li><a href="/inv/type/${row.classification_id}" class="nav-link" title="See our inventory of ${row.classification_name} vehicles">${row.classification_name}</a></li>`
        })

        list += "</ul>"
        return list
    } catch (error) {
        console.error("getNav error:", error)
        return '<ul class="nav-menu"><li><a href="/" class="nav-link">Home</a></li></ul>'
    }
}

/* **************************************
 * Build the classification view HTML
 * ************************************ */
Util.buildClassificationGrid = async function (data) {
    let grid = ""

    if (data && data.length > 0) {
        grid = '<ul id="inv-display">'
        data.forEach((vehicle) => {
            grid += "<li>"
            grid += `<a href="/inv/detail/${vehicle.inv_id}" title="View ${vehicle.inv_make} ${vehicle.inv_model} details"><img src="${vehicle.inv_thumbnail}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model} on CSE Motors" /></a>`
            grid += '<div class="namePrice">'
            grid += "<hr />"
            grid += "<h2>"
            grid += `<a href="/inv/detail/${vehicle.inv_id}" title="View ${vehicle.inv_make} ${vehicle.inv_model} details">${vehicle.inv_make} ${vehicle.inv_model}</a>`
            grid += "</h2>"
            grid += `<span>$${new Intl.NumberFormat("en-US").format(vehicle.inv_price)}</span>`
            grid += "</div>"
            grid += "</li>"
        })
        grid += "</ul>"
    } else {
        grid = '<p class="notice">Sorry, no matching vehicles could be found.</p>'
    }
    return grid
}

/* **********************
 * Helpers for formatting
 * **********************/
Util.formatUSD = function (value) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0
    }).format(value)
}

Util.formatNumber = function (value) {
    return new Intl.NumberFormat("en-US").format(value)
}

/* **************************************
 * Build a vehicle detail HTML string
 ************************************ */
Util.buildVehicleDetailHTML = function (vehicle) {
    if (!vehicle) return '<p class="notice">No vehicle information available.</p>'

    const price = Util.formatUSD(vehicle.inv_price || 0)
    const miles = Util.formatNumber(vehicle.inv_miles || 0)
    const imgSrc = vehicle.inv_image || "/images/no-image-available.png"
    const makeModel = `${vehicle.inv_make || ""} ${vehicle.inv_model || ""}`
    const description = vehicle.inv_description || "No description available."

    return `
    <div class="vehicle-detail">
      <div class="vehicle-image">
        <img src="${imgSrc}" alt="${makeModel} ${vehicle.inv_year || ''}" />
      </div>
      <div class="vehicle-info">
        <h1>${makeModel}</h1>
        <p class="specs"><strong>Year:</strong> ${vehicle.inv_year || 'N/A'} &nbsp; | &nbsp; <strong>Price:</strong> ${price} &nbsp; | &nbsp; <strong>Mileage:</strong> ${miles} miles</p>
        <p class="description">${description}</p>
        <ul class="details-list">
          <li><strong>Color:</strong> ${vehicle.inv_color || 'N/A'}</li>
          <li><strong>Classification:</strong> ${vehicle.classification_name || 'N/A'}</li>
          <li><strong>Stock ID:</strong> ${vehicle.inv_id}</li>
        </ul>
      </div>
    </div>
    `
}

/* ****************************************
 * Build classification select list for forms
 **************************************** */
Util.buildClassificationList = async function (selectedId = null) {
    const data = await invModel.getClassifications()
    let list = '<select name="classification_id" id="classificationList" required>'
    list += '<option value="">Choose a Classification</option>'

    data.rows.forEach((row) => {
        list += `<option value="${row.classification_id}"${row.classification_id == selectedId ? " selected" : ""}>${row.classification_name}</option>`
    })

    list += "</select>"
    return list
}

/* ****************************************
 * Middleware For Handling Errors
 * Wraps other functions in try/catch
 **************************************** */
Util.handleErrors = (fn) => {
    return function (req, res, next) {
        Promise.resolve(fn(req, res, next)).catch(next)
    }
}


/* ****************************************
 * Build JWT token (NOVO - TASK 5)
 * ****************************************/
Util.buildToken = function (accountData) {
    // Apenas os dados necessários para a sessão e autorização são incluídos no token
    return jwt.sign(
        { 
            account_id: accountData.account_id, 
            account_firstname: accountData.account_firstname,
            account_type: accountData.account_type 
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: 3600 * 1000 }
    )
}


/* ****************************************
 * Middleware to check token validity (AJUSTADO)
 **************************************** */
Util.checkJWTToken = (req, res, next) => {
    if (req.cookies.jwt) {
        jwt.verify(
            req.cookies.jwt,
            process.env.ACCESS_TOKEN_SECRET,
            function (err, accountData) {
                if (err) {
                    req.flash("notice", "Please log in") // Adiciona "notice" para consistência
                    res.clearCookie("jwt")
                    // Não redireciona aqui, apenas limpa e permite que o fluxo continue
                } else {
                    // Adiciona dados essenciais do token a res.locals para uso na view/controllers
                    res.locals.accountData = accountData
                    res.locals.account_id = accountData.account_id
                    res.locals.account_firstname = accountData.account_firstname
                    res.locals.account_type = accountData.account_type
                    res.locals.loggedin = 1
                }
                next()
            })
    } else {
        res.locals.loggedin = 0 // Garante que loggedin seja 0 se não houver cookie
        next()
    }
}


/* ****************************************
 * Check Login (MANTIDO)
 * ************************************ */
Util.checkLogin = (req, res, next) => {
    if (res.locals.loggedin) {
        next()
    } else {
        req.flash("notice", "Please log in.")
        return res.redirect("/account/login")
    }
}

module.exports = Util
const reviewModel = require("../models/review-model")

const reviewUtil = {}

/* **************************************
 * Build a list of reviews for a vehicle
 * ************************************ */
reviewUtil.buildVehicleReviews = async function (inv_id) {
    const reviews = await reviewModel.getReviewsByInventoryId(inv_id)
    
    let html = '<h2>Customer Reviews</h2>'
    
    if (!reviews || reviews.length === 0) {
        html += '<p>No reviews yet. Be the first!</p>'
        return html
    }

    html += '<ul class="review-list">'
    reviews.forEach(review => {
        const date = new Date(review.review_date).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })
        const initials = `${review.account_firstname.charAt(0).toUpperCase()}${review.account_lastname.charAt(0).toUpperCase()}`

        html += '<li>'
        html += `<div class="review-header">`
        html += `<span class="reviewer-initials">${initials}</span>`
        html += `<p class="reviewer-name">Reviewed by ${review.account_firstname} on ${date}</p>`
        html += `</div>`
        html += `<p class="review-text">${review.review_text}</p>`
        html += '</li>'
    })
    html += '</ul>'
    return html
}

/* **************************************
 * Build a list of reviews for a client (Account Management)
 * ************************************ */
reviewUtil.buildAccountReviewsList = async function (account_id) {
    const reviews = await reviewModel.getReviewsByAccountId(account_id)
    
    let html = '<h2>My Vehicle Reviews</h2>'
    
    if (!reviews || reviews.length === 0) {
        html += '<p>You have not written any reviews yet.</p>'
        return html
    }

    html += '<table id="client-review-table">'
    html += '<thead><tr><th>Vehicle</th><th>Date</th><th>Action</th></tr></thead>'
    html += '<tbody>'
    
    reviews.forEach(review => {
        const date = new Date(review.review_date).toLocaleDateString("en-US")
        html += `<tr>`
        html += `<td>${review.inv_make} ${review.inv_model}</td>`
        html += `<td>${date}</td>`
        html += `<td><a href="/review/edit/${review.review_id}" title="Click to edit">Edit</a> | `
        html += `<form action="/review/delete" method="POST" class="inline-form">`
        html += `<input type="hidden" name="review_id" value="${review.review_id}">`
        html += `<button type="submit" class="delete-btn">Delete</button>`
        html += `</form></td>`
        html += `</tr>`
    })
    html += '</tbody>'
    html += '</table>'
    return html
}

module.exports = reviewUtil
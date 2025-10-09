const reviewModel = require("../models/review-model")
const utilities = require("../utilities/")

const reviewCont = {}

/* ****************************************
 * Process New Review Submission
 * ****************************************/
reviewCont.addReview = utilities.handleErrors(async (req, res, next) => {
    const { review_text, inv_id, account_id } = req.body

    const reviewResult = await reviewModel.addReview(review_text, inv_id, account_id)

    if (reviewResult) {
        req.flash("success", "Review added successfully.")
    } else {
        req.flash("error", "Sorry, review submission failed.")
    }
    
    // Redireciona de volta para a página de detalhes do veículo
    res.redirect(`/inv/detail/${inv_id}`)
})


/* ****************************************
 * Build Edit Review View
 * ****************************************/
reviewCont.buildEditView = utilities.handleErrors(async (req, res, next) => {
    const review_id = parseInt(req.params.review_id)
    const reviewData = await reviewModel.getReviewByReviewId(review_id)

    if (!reviewData) {
        req.flash("error", "Review not found.")
        return res.redirect("/account/")
    }
    
    // Segurança: Garante que o usuário só edite suas próprias reviews
    if (reviewData.account_id !== res.locals.account_id) {
        req.flash("error", "Access denied. You can only edit your own reviews.")
        return res.redirect("/account/")
    }

    let nav = await utilities.getNav()
    const title = `Edit Review for ${reviewData.inv_make} ${reviewData.inv_model}`

    res.render("review/edit-review", {
        title,
        nav,
        errors: null,
        reviewData,
        review_text: reviewData.review_text,
    })
})

/* ****************************************
 * Process Review Update
 * ****************************************/
reviewCont.updateReview = utilities.handleErrors(async (req, res, next) => {
    const { review_id, review_text } = req.body

    const updateResult = await reviewModel.updateReview(review_id, review_text)

    if (updateResult) {
        req.flash("success", "Review updated successfully.")
        res.redirect("/account/")
    } else {
        req.flash("error", "Sorry, the review update failed.")
        res.redirect(`/review/edit/${review_id}`)
    }
})

/* ****************************************
 * Process Review Deletion
 * ****************************************/
reviewCont.deleteReview = utilities.handleErrors(async (req, res, next) => {
    const review_id = parseInt(req.body.review_id)
    
    // Opcional: Adicionar verificação de posse do review antes de deletar
    const deleteResult = await reviewModel.deleteReview(review_id)

    if (deleteResult) {
        req.flash("success", "Review successfully deleted.")
    } else {
        req.flash("error", "Review deletion failed.")
    }
    res.redirect("/account/")
})

module.exports = reviewCont
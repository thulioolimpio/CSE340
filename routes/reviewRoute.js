const express = require("express")
const router = express.Router()
const reviewController = require("../controllers/reviewController")
const utilities = require("../utilities/")
const reviewValidate = require("../utilities/review-validation")

// Rota POST para adicionar uma nova avaliação (protegida por login)
router.post(
    "/add",
    utilities.checkLogin,
    reviewValidate.reviewRules(),
    reviewValidate.checkReviewData,
    utilities.handleErrors(reviewController.addReview)
)

// Rota GET para carregar a view de edição (protegida por login)
router.get(
    "/edit/:review_id",
    utilities.checkLogin,
    utilities.handleErrors(reviewController.buildEditView)
)

// Rota POST para processar a atualização da avaliação (protegida por login)
router.post(
    "/update",
    utilities.checkLogin,
    reviewValidate.reviewRules(),
    // Nota: O checkReviewData é otimizado para a view de detalhes. Se necessário, crie um checkUpdateReviewData separado.
    utilities.handleErrors(reviewController.updateReview)
)

// Rota POST para deletar a avaliação (protegida por login)
router.post(
    "/delete",
    utilities.checkLogin,
    utilities.handleErrors(reviewController.deleteReview)
)

module.exports = router
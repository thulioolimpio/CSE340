// utilities/inventory-middleware.js

/**
 * Middleware para verificar se o tipo de conta é "Employee" ou "Admin".
 * Se não for, redireciona para o login com uma mensagem de erro.
 *
 * NOTA: Este middleware depende do fato de que o middleware checkJWTToken já rodou
 * e adicionou as variáveis do JWT, incluindo account_type, ao res.locals.
 */
async function checkEmployeeOrAdmin(req, res, next) {
    try {
        // Verifica se res.locals.account_type foi populado e se atende aos critérios
        if (res.locals.account_type === "Employee" || res.locals.account_type === "Admin") {
            next(); // Autorizado! Prossiga para a próxima função no pipeline.
        } else {
            // Não autorizado
            req.flash("notice", "Acesso Negado. Você deve ser um funcionário ou administrador para gerenciar o inventário.");
            // Certifica-se de que o usuário não está logado apenas na sessão local para a view
            res.locals.loggedin = 0; 
            return res.redirect("/account/login");
        }
    } catch (error) {
        // Em caso de qualquer erro (ex: token corrompido ou ausente), também nega o acesso
        req.flash("notice", "Acesso Negado. Por favor, faça login com uma conta autorizada.");
        res.locals.loggedin = 0; 
        return res.redirect("/account/login");
    }
}

module.exports = {
    checkEmployeeOrAdmin,
};
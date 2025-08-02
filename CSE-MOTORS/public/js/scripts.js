// ===== MENU HAMBURGUER =====
function setupHamburgerMenu() {
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  
  // Verifica se os elementos existem na página
  if (!hamburger || !navLinks) return;

  // Função para alternar o menu
  const toggleMenu = () => {
    hamburger.classList.toggle('active');
    hamburger.setAttribute('aria-expanded', hamburger.classList.contains('active'));
    navLinks.classList.toggle('active');
    
    // Bloquear/liberar scroll do body
    document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
  };

  // Evento de clique no hamburguer
  hamburger.addEventListener('click', toggleMenu);

  // Fechar menu ao clicar em um link (opcional)
  const navItems = document.querySelectorAll('.nav-links a');
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      if (navLinks.classList.contains('active')) {
        toggleMenu();
      }
    });
  });

  // Fechar menu ao pressionar ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navLinks.classList.contains('active')) {
      toggleMenu();
    }
  });
}

// Inicializa quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', setupHamburgerMenu);

// Se o script for carregado depois do DOMContentLoaded
if (document.readyState !== 'loading') {
  setupHamburgerMenu();
}
// Set current year in footer
document.getElementById('current-year').textContent = new Date().getFullYear();

// Set last modified date (melhorado)
const lastModifiedElement = document.getElementById('last-modified');
if (lastModifiedElement) {
    // Usa document.lastModified ou a data atual como fallback
    lastModifiedElement.textContent = document.lastModified 
        ? new Date(document.lastModified).toLocaleDateString('pt-BR')
        : new Date().toLocaleDateString('pt-BR');
}
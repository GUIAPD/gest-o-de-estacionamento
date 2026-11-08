// Inicialização da aplicação e navegação entre as telas.
document.addEventListener("DOMContentLoaded", () => {
  const service = new EstacionamentoService();
  const controller = new EstacionamentoController(service);

  document.querySelectorAll("[data-view]").forEach(botao => {
    botao.addEventListener("click", () => controller.mostrarTela(botao.dataset.view));
  });
  document.querySelectorAll("[data-go]").forEach(botao => {
    botao.addEventListener("click", () => controller.mostrarTela(botao.dataset.go));
  });
});
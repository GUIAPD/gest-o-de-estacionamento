// Controller: conecta a interface às regras do serviço.
class EstacionamentoController {
  constructor(service) {
    this.service = service;
    this.form = document.getElementById("reservation-form");
    this.form.addEventListener("submit", event => this.salvar(event));
    document.getElementById("reservations-body").addEventListener("click", event => this.tratarAcaoTabela(event));
    document.getElementById("search-reservas").addEventListener("input", event => this.renderizarTabela(event.target.value));
    this.atualizarInterface();
  }

  salvar(event) {
    event.preventDefault();
    if (!this.form.reportValidity()) return;

    const dados = Object.fromEntries(new FormData(this.form).entries());
    dados.placa = dados.placa.replace(/[^a-z0-9]/gi, "").toUpperCase();

    try {
      const reserva = this.service.salvar(dados);
      console.log("Reserva cadastrada:", reserva);
      alert("Cadastro realizado com sucesso!");
      this.form.reset();
      this.atualizarInterface();
      this.mostrarTela("reservas");
    } catch (erro) {
      alert(erro.message);
    }
  }

  tratarAcaoTabela(event) {
    const botao = event.target.closest("[data-remover]");
    if (!botao) return;
    const id = botao.dataset.remover;
    const reserva = this.service.listar().find(item => item.id === id);
    if (!reserva) return;
    if (confirm(`Deseja remover a reserva da vaga ${reserva.vaga} (${reserva.placa})?`)) {
      this.service.remover(id);
      this.atualizarInterface();
    }
  }

  atualizarInterface() {
    this.renderizarResumo();
    this.renderizarTabela(document.getElementById("search-reservas").value);
    this.renderizarDisponiveis();
    this.renderizarRecentes();
    this.renderizarPreview();
    this.atualizarSelectVagas();
  }

  renderizarResumo() {
    const reservas = this.service.listar();
    const livres = this.service.listarDisponiveis();
    const ocupadas = reservas.length;
    const percentual = Math.round((ocupadas / this.service.totalVagas) * 100);
    document.getElementById("stat-total").textContent = this.service.totalVagas;
    document.getElementById("stat-occupied").textContent = ocupadas;
    document.getElementById("stat-available").textContent = livres.length;
    document.getElementById("stat-percent").textContent = `${percentual}%`;
    document.getElementById("legend-occupied").textContent = ocupadas;
    document.getElementById("legend-available").textContent = livres.length;
    document.getElementById("occupancy-progress").style.width = `${percentual}%`;
  }

  renderizarTabela(filtro = "") {
    const corpo = document.getElementById("reservations-body");
    const termo = filtro.trim().toLowerCase();
    const reservas = this.service.listar().filter(item =>
      [item.placa, item.proprietario, item.modelo, item.apartamento, item.bloco, String(item.vaga)]
        .some(valor => valor.toLowerCase().includes(termo))
    ).sort((a, b) => a.vaga - b.vaga);

    corpo.innerHTML = reservas.map(item => `
      <tr>
        <td><div class="vehicle-cell"><span class="car-avatar">▰</span><div><strong>${this.escapar(item.modelo)}</strong><small>${this.escapar(item.placa)} · ${this.escapar(item.cor)}</small></div></div></td>
        <td><strong>${this.escapar(item.proprietario)}</strong></td>
        <td>${this.escapar(item.apartamento)} · Bloco ${this.escapar(item.bloco)}</td>
        <td><span class="slot-tag">Vaga ${item.vaga}</span></td>
        <td><button class="delete-button" data-remover="${this.escapar(item.id)}" aria-label="Remover reserva da vaga ${item.vaga}">Remover</button></td>
      </tr>`).join("");
    document.getElementById("reservation-count").textContent = `${reservas.length} registro(s)`;
    document.getElementById("empty-reservations").hidden = reservas.length > 0;
  }

  renderizarDisponiveis() {
    const reservas = this.service.listar();
    const porVaga = new Map(reservas.map(item => [item.vaga, item]));
    const grid = document.getElementById("availability-grid");
    grid.innerHTML = Array.from({ length: this.service.totalVagas }, (_, i) => {
      const numero = i + 1;
      const reserva = porVaga.get(numero);
      return `<div class="parking-space ${reserva ? "occupied" : ""}" title="${reserva ? `Ocupada por ${this.escapar(reserva.proprietario)}` : "Vaga disponível"}">
        <strong>${String(numero).padStart(2, "0")}</strong><small>${reserva ? "Ocupada" : "Livre"}</small>
      </div>`;
    }).join("");
    const livres = this.service.listarDisponiveis().length;
    document.getElementById("available-label").textContent = `${livres} vagas livres`;
  }

  renderizarRecentes() {
    const recentes = this.service.listar().sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm)).slice(0, 4);
    document.getElementById("recent-list").innerHTML = recentes.length ? recentes.map(item => `
      <div class="recent-item"><span class="car-avatar">▰</span><div class="recent-info"><strong>${this.escapar(item.modelo)} · ${this.escapar(item.placa)}</strong><small>${this.escapar(item.proprietario)}</small></div><span class="recent-slot">Vaga ${item.vaga}</span></div>
    `).join("") : '<div class="empty-mini">Ainda não há reservas cadastradas.</div>';
  }

  renderizarPreview() {
    const ocupadas = new Set(this.service.listar().map(item => item.vaga));
    document.getElementById("parking-preview").innerHTML = Array.from({ length: this.service.totalVagas }, (_, i) => {
      const numero = i + 1;
      return `<span class="parking-cell ${ocupadas.has(numero) ? "occupied" : ""}" title="Vaga ${numero}">${numero}</span>`;
    }).join("");
  }

  atualizarSelectVagas() {
    const select = document.getElementById("vaga-select");
    const selecionada = select.value;
    const livres = this.service.listarDisponiveis();
    select.innerHTML = '<option value="">Selecione uma vaga livre</option>' +
      livres.map(vaga => `<option value="${vaga}">Vaga ${vaga}</option>`).join("");
    if (livres.includes(Number(selecionada))) select.value = selecionada;
    select.disabled = livres.length === 0;
  }

  mostrarTela(nome) {
    document.querySelectorAll(".view").forEach(view => view.classList.toggle("active", view.id === `view-${nome}`));
    document.querySelectorAll(".nav-link").forEach(link => link.classList.toggle("active", link.dataset.view === nome));
    const titulos = { dashboard: "Visão geral", reservas: "Vagas cadastradas", disponiveis: "Vagas disponíveis", cadastro: "Nova reserva" };
    document.getElementById("page-title").textContent = titulos[nome] || "ParkControl";
  }

  escapar(valor) {
    return String(valor).replace(/[&<>"']/g, caractere => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
    }[caractere]));
  }
}
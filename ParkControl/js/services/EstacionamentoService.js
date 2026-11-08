// Service: concentra as operações de persistência e regras do estacionamento.
class EstacionamentoService {
  constructor() {
    this.chave = "parkcontrol_reservas";
    this.totalVagas = 40;
  }

  listar() {
    try {
      return JSON.parse(localStorage.getItem(this.chave) || "[]")
        .map(item => new Veiculo(item));
    } catch (erro) {
      console.error("Não foi possível ler as reservas:", erro);
      return [];
    }
  }

  salvar(dados) {
    const reservas = this.listar();
    const novaReserva = new Veiculo(dados);

    if (!Number.isInteger(novaReserva.vaga) || novaReserva.vaga < 1 || novaReserva.vaga > this.totalVagas) {
      throw new Error(`Escolha uma vaga entre 1 e ${this.totalVagas}.`);
    }
    if (reservas.some(item => item.vaga === novaReserva.vaga)) {
      throw new Error("Esta vaga já está reservada. Escolha outra vaga.");
    }
    if (reservas.some(item => item.placa === novaReserva.placa)) {
      throw new Error("Já existe uma reserva cadastrada para esta placa.");
    }

    reservas.push(novaReserva);
    localStorage.setItem(this.chave, JSON.stringify(reservas));
    return novaReserva;
  }

  remover(id) {
    const reservas = this.listar();
    const atualizadas = reservas.filter(item => item.id !== id);
    localStorage.setItem(this.chave, JSON.stringify(atualizadas));
    return atualizadas.length !== reservas.length;
  }

  listarDisponiveis() {
    const ocupadas = new Set(this.listar().map(item => item.vaga));
    return Array.from({ length: this.totalVagas }, (_, indice) => indice + 1)
      .filter(vaga => !ocupadas.has(vaga));
  }
}
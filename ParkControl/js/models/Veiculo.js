// Model: representa uma reserva de vaga e seus dados.
class Veiculo {
  constructor({ id, placa, proprietario, apartamento, bloco, modelo, cor, vaga, criadoEm }) {
    this.id = id || (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()));
    this.placa = String(placa).trim().toUpperCase();
    this.proprietario = String(proprietario).trim();
    this.apartamento = String(apartamento).trim();
    this.bloco = String(bloco).trim();
    this.modelo = String(modelo).trim();
    this.cor = String(cor).trim();
    this.vaga = Number(vaga);
    this.criadoEm = criadoEm || new Date().toISOString();
  }
}
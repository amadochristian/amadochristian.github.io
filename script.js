document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('calculadoraForm');
    const tipoEmpreendimento = document.getElementById('tipoEmpreendimento');
    const camposLoteamento = document.getElementById('camposLoteamento');
    const camposConstrucao = document.getElementById('camposConstrucao');
    const resultados = document.getElementById('resultados');
    const resultadosConteudo = document.getElementById('resultadosConteudo');

    const temParceiroLote = document.getElementById('temParceiroLote');
    const porcentagemParceiroLoteDiv = document.getElementById('porcentagemParceiroLoteDiv');
    const precoAreaTotalLoteDiv = document.getElementById('precoAreaTotalLoteDiv');

    const temParceiroCasa = document.getElementById('temParceiroCasa');
    const porcentagemParceiroCasaDiv = document.getElementById('porcentagemParceiroCasaDiv');
    const precoAreaTotalCasaDiv = document.getElementById('precoAreaTotalCasaDiv');

    tipoEmpreendimento.addEventListener('change', function() {
        if (this.value === 'loteamento') {
            camposLoteamento.style.display = 'block';
            camposConstrucao.style.display = 'none';
        } else if (this.value === 'construcao') {
            camposLoteamento.style.display = 'none';
            camposConstrucao.style.display = 'block';
        } else {
            camposLoteamento.style.display = 'none';
            camposConstrucao.style.display = 'none';
        }
    });

    temParceiroLote.addEventListener('change', function() {
        if (this.value === 'sim') {
            porcentagemParceiroLoteDiv.style.display = 'block';
            precoAreaTotalLoteDiv.style.display = 'none';
        } else {
            porcentagemParceiroLoteDiv.style.display = 'none';
            precoAreaTotalLoteDiv.style.display = 'block';
        }
    });

    temParceiroCasa.addEventListener('change', function() {
        if (this.value === 'sim') {
            porcentagemParceiroCasaDiv.style.display = 'block';
            precoAreaTotalCasaDiv.style.display = 'none';
        } else {
            porcentagemParceiroCasaDiv.style.display = 'none';
            precoAreaTotalCasaDiv.style.display = 'block';
        }
    });

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (tipoEmpreendimento.value === '') {
            alert('Por favor, selecione o tipo de empreendimento.');
            return;
        }
        
        if (tipoEmpreendimento.value === 'loteamento') {
            if (validarCamposLoteamento()) {
                calcularLoteamento();
            }
        } else if (tipoEmpreendimento.value === 'construcao') {
            if (validarCamposConstrucao()) {
                calcularConstrucao();
            }
        }
    });

    function validarCamposLoteamento() {
        const campos = ['quantidadeLotes', 'precoMedioVendaLote', 'custoMetroQuadradoLote', 'tamanhoLote'];
        if (temParceiroLote.value === 'sim') {
            campos.push('porcentagemParceiroLote');
        } else {
            campos.push('precoAreaTotalLote');
        }
        return validarCampos(campos);
    }

    function validarCamposConstrucao() {
        const campos = ['quantidadeCasas', 'precoMedioVendaCasa', 'custoMetroQuadradoCasa', 'metroQuadradoCasa', 'custoMetroQuadradoLoteCasa', 'tamanhoLoteCasa'];
        if (temParceiroCasa.value === 'sim') {
            campos.push('porcentagemParceiroCasa');
        } else {
            campos.push('precoAreaTotalCasa');
        }
        return validarCampos(campos);
    }

    function validarCampos(campos) {
        for (const campo of campos) {
            const elemento = document.getElementById(campo);
            if (!elemento.value) {
                alert(`Por favor, preencha o campo ${formatarChave(campo)}.`);
                return false;
            }
            if (campo.includes('porcentagemParceiro')) {
                const valor = parseFloat(elemento.value);
                if (valor < 0 || valor > 100) {
                    alert('A porcentagem do parceiro deve estar entre 0 e 100.');
                    return false;
                }
            }
        }
        return true;
    }

    function getInputValue(id) {
        return parseFloat(document.getElementById(id).value);
    }

    function calcularLoteamento() {
        const quantidadeLotes = getInputValue('quantidadeLotes');
        const precoMedioVenda = getInputValue('precoMedioVendaLote');
        const custoMetroQuadrado = getInputValue('custoMetroQuadradoLote');
        const tamanhoLote = getInputValue('tamanhoLote');
        const temParceiro = temParceiroLote.value === 'sim';
        const porcentagemParceiro = temParceiro ? getInputValue('porcentagemParceiroLote') / 100 : 0;
        const precoAreaTotal = temParceiro ? 0 : getInputValue('precoAreaTotalLote');

        const vgvTotal = quantidadeLotes * precoMedioVenda;
        const custoLote = custoMetroQuadrado * tamanhoLote;
        const infraestrutura = custoLote * quantidadeLotes;
        const marketing = vgvTotal * 0.015;
        const impostoTotal = vgvTotal * 0.07;
        const comissaoTotal = vgvTotal * 0.06;
        
        let custoTotal, lucro, valorParceiro, impostoEmpresa, comissaoEmpresa, impostoParceiro, comissaoParceiro;

        if (temParceiro) {
            const custosLoteamento = infraestrutura + marketing;
            impostoEmpresa = impostoTotal * (1 - porcentagemParceiro);
            comissaoEmpresa = comissaoTotal * (1 - porcentagemParceiro);
            
            valorParceiro = vgvTotal * porcentagemParceiro;
            const custosEmpresa = custosLoteamento + impostoEmpresa + comissaoEmpresa;
            custoTotal = custosEmpresa;
            lucro = (vgvTotal - valorParceiro) - custosEmpresa;

            // Calcular a parte do parceiro
            impostoParceiro = impostoTotal * porcentagemParceiro;
            comissaoParceiro = comissaoTotal * porcentagemParceiro;
        } else {
            custoTotal = infraestrutura + marketing + impostoTotal + comissaoTotal + precoAreaTotal;
            lucro = vgvTotal - custoTotal;
            valorParceiro = 0;
            impostoEmpresa = impostoTotal;
            comissaoEmpresa = comissaoTotal;
            impostoParceiro = 0;
            comissaoParceiro = 0;
        }

        exibirResultados({
            vgvTotal,
            custoLote,
            infraestrutura,
            marketing,
            impostoEmpresa,
            comissaoEmpresa,
            custoTotal,
            lucro,
            valorParceiro,
            impostoParceiro,
            comissaoParceiro
        });
    }

    function calcularConstrucao() {
        const quantidadeCasas = getInputValue('quantidadeCasas');
        const precoMedioVenda = getInputValue('precoMedioVendaCasa');
        const custoMetroQuadradoCasa = getInputValue('custoMetroQuadradoCasa');
        const metroQuadradoCasa = getInputValue('metroQuadradoCasa');
        const custoMetroQuadradoLote = getInputValue('custoMetroQuadradoLoteCasa');
        const tamanhoLote = getInputValue('tamanhoLoteCasa');
        const temParceiro = temParceiroCasa.value === 'sim';
        const porcentagemParceiro = temParceiro ? getInputValue('porcentagemParceiroCasa') / 100 : 0;
        const precoAreaTotal = temParceiro ? 0 : getInputValue('precoAreaTotalCasa');

        const vgvTotal = quantidadeCasas * precoMedioVenda;
        const custoCasa = custoMetroQuadradoCasa * metroQuadradoCasa;
        const custoTotalConstrucao = custoCasa * quantidadeCasas;
        const custoLote = custoMetroQuadradoLote * tamanhoLote;
        const infraestrutura = custoLote * quantidadeCasas;
        const marketing = vgvTotal * 0.015;
        const impostoTotal = vgvTotal * 0.07;
        const comissaoTotal = vgvTotal * 0.06;
        
        let custoTotal, lucro, valorParceiro, impostoEmpresa, comissaoEmpresa, impostoParceiro, comissaoParceiro;

        if (temParceiro) {
            const custosConstrucao = custoTotalConstrucao + infraestrutura + marketing;
            impostoEmpresa = impostoTotal * (1 - porcentagemParceiro);
            comissaoEmpresa = comissaoTotal * (1 - porcentagemParceiro);
            
            valorParceiro = vgvTotal * porcentagemParceiro;
            const custosEmpresa = custosConstrucao + impostoEmpresa + comissaoEmpresa;
            custoTotal = custosEmpresa;
            lucro = (vgvTotal - valorParceiro) - custosEmpresa;

            // Calcular a parte do parceiro
            impostoParceiro = impostoTotal * porcentagemParceiro;
            comissaoParceiro = comissaoTotal * porcentagemParceiro;
        } else {
            custoTotal = custoTotalConstrucao + infraestrutura + marketing + impostoTotal + comissaoTotal + precoAreaTotal;
            lucro = vgvTotal - custoTotal;
            valorParceiro = 0;
            impostoEmpresa = impostoTotal;
            comissaoEmpresa = comissaoTotal;
            impostoParceiro = 0;
            comissaoParceiro = 0;
        }

        exibirResultados({
            vgvTotal,
            custoCasa,
            custoTotalConstrucao,
            custoLote,
            infraestrutura,
            marketing,
            impostoEmpresa,
            comissaoEmpresa,
            custoTotal,
            lucro,
            valorParceiro,
            impostoParceiro,
            comissaoParceiro
        });
    }

    function exibirResultados(dados) {
        resultadosConteudo.innerHTML = '';
        
        const table = document.createElement('table');
        table.className = 'table table-striped table-hover';
        
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        const thItem = document.createElement('th');
        thItem.textContent = 'Item';
        const thValor = document.createElement('th');
        thValor.textContent = 'Valor';
        headerRow.appendChild(thItem);
        headerRow.appendChild(thValor);
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        const tbody = document.createElement('tbody');
        
        for (const [chave, valor] of Object.entries(dados)) {
            const row = document.createElement('tr');
            const tdItem = document.createElement('td');
            tdItem.textContent = formatarChave(chave);
            const tdValor = document.createElement('td');
            tdValor.textContent = formatarMoeda(valor);
            row.appendChild(tdItem);
            row.appendChild(tdValor);
            tbody.appendChild(row);
        }
        
        table.appendChild(tbody);
        resultadosConteudo.appendChild(table);
        resultados.style.display = 'block';

        // Criar o gráfico de pizza
        criarGraficoPizza(dados);
    }

    function formatarChave(chave) {
        return chave.replace(/([A-Z])/g, ' $1')
            .replace(/^./, function(str) { return str.toUpperCase(); })
            .replace('Vgv', 'VGV');
    }

    function formatarMoeda(valor) {
        return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    function criarGraficoPizza(dados) {
        const ctx = document.getElementById('graficoResultados').getContext('2d');
        
        // Selecionar apenas os itens desejados
        const itensSelecionados = {
            'Infraestrutura': dados.infraestrutura,
            'Marketing': dados.marketing,
            'Imposto Empresa': dados.impostoEmpresa,
            'Comissão Empresa': dados.comissaoEmpresa,
            'Lucro': dados.lucro
        };
        
        const labels = Object.keys(itensSelecionados);
        const valores = Object.values(itensSelecionados);

        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: valores,
                    backgroundColor: [
                        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                    },
                    title: {
                        display: true,
                        text: 'Distribuição dos Custos e Lucro'
                    }
                }
            }
        });
    }
});
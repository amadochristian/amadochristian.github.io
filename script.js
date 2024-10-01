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

    let graficoAtual; // Variável global para armazenar a referência ao gráfico atual

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

        // Adicionar novo bloco de resultados para Payback e ROI
        exibirResultadosPaybackROI(dados);
    }

    function exibirResultadosPaybackROI(dados) {
        const blocoPaybackROI = document.createElement('div');
        blocoPaybackROI.className = 'mt-5 p-3 bg-light border rounded';
        blocoPaybackROI.innerHTML = `
            <h3 class="mb-3">Análise Financeira do Empreendimento</h3>
            <p><strong>Venda Inicial:</strong> Expectativa de venda de 90% das unidades no lançamento.</p>
            <p><strong>Entrada Imediata:</strong> ${formatarMoeda(dados.vgvTotal * 0.9 * 0.2)} (20% de 90% do VGV)</p>
            <p><strong>Valor Financiado:</strong> ${formatarMoeda(dados.vgvTotal * 0.9 * 0.8)} (80% de 90% do VGV)</p>
            <p><strong>Investimento Inicial:</strong> ${formatarMoeda(dados.custoTotal)} (Área + Infraestrutura + Marketing + Impostos + Comissão)</p>
            <p><strong>Lucro Estimado:</strong> ${formatarMoeda(dados.lucro)}</p>
            <p><strong>ROI Estimado:</strong> ${((dados.lucro / dados.custoTotal) * 100).toFixed(2)}%</p>
            <p><strong>Payback Estimado:</strong> ${calcularPaybackEstimado(dados)} meses</p>
            <p><em>Nota: O Payback e ROI são estimativas baseadas na venda de 90% das unidades no lançamento e no financiamento do restante em até 180 meses.</em></p>
        `;
        resultadosConteudo.appendChild(blocoPaybackROI);
    }

    function calcularPaybackEstimado(dados) {
        const entradaInicial = dados.vgvTotal * 0.9 * 0.2;
        const valorFinanciado = dados.vgvTotal * 0.9 * 0.8;
        const parcelaMensal = valorFinanciado / 180; // Simplificação, sem considerar juros
        const fluxoCaixaMensal = parcelaMensal + (dados.vgvTotal * 0.1 / 180); // Inclui venda dos 10% restantes

        let mesesPayback = 0;
        let saldoAcumulado = -dados.custoTotal + entradaInicial;

        while (saldoAcumulado < 0 && mesesPayback < 180) {
            saldoAcumulado += fluxoCaixaMensal;
            mesesPayback++;
        }

        return mesesPayback;
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
        
        // Verifica se já existe um gráfico e o destrói
        if (graficoAtual) {
            graficoAtual.destroy();
        }
        
        // Cria o novo gráfico
        graficoAtual = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: Object.keys(dados),
                datasets: [{
                    data: Object.values(dados),
                    backgroundColor: [
                        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Distribuição dos Custos'
                    }
                }
            }
        });
    }
});
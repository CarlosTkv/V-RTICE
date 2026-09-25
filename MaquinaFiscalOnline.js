import { XMLParser } from 'fast-xml-parser';
import PDFDocument from 'pdfkit';

export class MaquinaFiscalOnline {
    /**
     * @param {string} cnpjClienteSistema - CNPJ da empresa cliente autenticada no seu sistema SaaS.
     */
    constructor(cnpjClienteSistema) {
        if (!cnpjClienteSistema) {
            throw new Error("Erro de Inicialização: O CNPJ do cliente do sistema precisa ser informado.");
        }
        this.cnpjSistema = String(cnpjClienteSistema).replace(/\D/g, '');
    }

    /**
     * Executa a validação estrutural do XML e extração dos dados contábeis em memória.
     * @param {Buffer|string} xmlConteudo - Buffer ou string de texto do XML bruto oficial.
     * @returns {Promise<{dadosFiscais: object, pdfBuffer: Buffer}>} Dados limpos para insert e o PDF binário.
     */
    async processarDocumento(xmlConteudo) {
        const xmlString = Buffer.isBuffer(xmlConteudo) ? xmlConteudo.toString('utf-8') : String(xmlConteudo || '');

        if (!xmlString || xmlString.trim() === "") {
            throw new Error("Erro de Processamento: O arquivo XML fornecido está completamente vazio.");
        }

        const parser = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: "",
            removeNSPrefix: true,
            parseTagValue: true
        });
        
        const objJson = parser.parse(xmlString);
        let raiz = objJson;

        // Desembrulha encapsulamentos de distribuição e autorização da SEFAZ
        if (objJson.nfeProc) raiz = objJson.nfeProc;
        if (objJson.cteProc) raiz = objJson.cteProc;

        let modelo = null;
        if (raiz.NFe || raiz.infNfe || xmlString.includes("<NFe") || xmlString.includes("<infNFe")) {
            modelo = "55";
        } else if (raiz.CTe || raiz.infCte || xmlString.includes("<CTe") || xmlString.includes("<infCte")) {
            modelo = "57";
        } else if (raiz.NFSe || raiz.infNFSe || xmlString.includes("NFSe") || xmlString.includes("infNFSe")) {
            modelo = "NFS-e";
        }

        if (!modelo) {
            throw new Error("Rejeição Estrutural: O layout do XML enviado não corresponde aos modelos NF-e (55), CT-e (57) ou NFS-e Nacional.");
        }

        let dadosTratados = {};
        let pdfGerado = null;

        if (modelo === "55") {
            dadosTratados = this._parseNfe(raiz);
            pdfGerado = await this._gerarPdfDanfe(xmlString, "55", dadosTratados);
        } else if (modelo === "57") {
            dadosTratados = this._parseCte(raiz);
            pdfGerado = await this._gerarPdfDanfe(xmlString, "57", dadosTratados);
        } else if (modelo === "NFS-e") {
            dadosTratados = this._parseNfseNacional(raiz);
            pdfGerado = await this._gerarPdfDanfe(xmlString, "NFS-e", dadosTratados);
        }

        return {
            dadosFiscais: dadosTratados,
            pdfBuffer: pdfGerado
        };
    }

    async _gerarPdfDanfe(xmlString, modelo, dados) {
        try {
            const nfeWizard = await import('@nfewizard/danfe');
            if (modelo === "55" && nfeWizard?.Danfe) {
                const engine = await nfeWizard.Danfe.fromXml(xmlString);
                return await engine.toPdf();
            } else if (modelo === "57" && nfeWizard?.Dacte) {
                const engine = await nfeWizard.Dacte.fromXml(xmlString);
                return await engine.toPdf();
            } else if (modelo === "NFS-e" && nfeWizard?.Danfse) {
                const engine = await nfeWizard.Danfse.fromXml(xmlString);
                return await engine.toPdf();
            }
        } catch (err) {
            console.warn(`[MaquinaFiscalOnline] Fallback PDF rendering for modelo ${modelo}:`, err?.message || err);
        }

        // Fallback robusto via PDFKit em memória (Buffer)
        return new Promise((resolve) => {
            const doc = new PDFDocument({ size: 'A4', margin: 30 });
            const buffers = [];
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                resolve(Buffer.concat(buffers));
            });

            doc.rect(30, 30, 535, 782).strokeColor('#0f172a').stroke();
            doc.fontSize(16).font('Helvetica-Bold').fillColor('#0f172a').text(`DANFE - ESPELHO FISCAL (${dados.tipoDocumento})`, 45, 50);
            doc.fontSize(10).font('Helvetica').fillColor('#475569').text(`MODELO: ${dados.modelo} | FLUXO: ${dados.fluxo}`, 45, 75);
            doc.moveDown();

            doc.fontSize(9).font('Helvetica-Bold').fillColor('#0f172a').text('CHAVE DE ACESSO:', 45, 100);
            doc.fontSize(10).font('Helvetica').fillColor('#0284c7').text(dados.chaveAcesso || 'N/A', 45, 115);

            doc.fontSize(9).font('Helvetica-Bold').fillColor('#0f172a').text('EMITENTE:', 45, 140);
            doc.fontSize(10).font('Helvetica').fillColor('#334155').text(`${dados.emitenteNome} (${dados.emitenteCnpj})`, 45, 153);

            doc.fontSize(9).font('Helvetica-Bold').fillColor('#0f172a').text('DESTINATÁRIO:', 45, 178);
            doc.fontSize(10).font('Helvetica').fillColor('#334155').text(`${dados.destinatarioNome} (${dados.destinatarioCnpj})`, 45, 191);

            doc.fontSize(10).font('Helvetica-Bold').fillColor('#0f172a').text('VALOR TOTAL:', 45, 220);
            doc.fontSize(14).font('Helvetica-Bold').fillColor('#059669').text(`R$ ${dados.valorTotal.toFixed(2)}`, 140, 218);

            doc.end();
        });
    }

    _definirFluxo(cnpjEmitente, cnpjDestinatario) {
        const emit = String(cnpjEmitente || "").replace(/\D/g, '');
        const dest = String(cnpjDestinatario || "").replace(/\D/g, '');

        if (emit === this.cnpjSistema) return "SAIDA";
        if (dest === this.cnpjSistema) return "ENTRADA";
        return "INDETERMINADO";
    }

    _parseNfe(raiz) {
        const nfe = raiz.NFe || raiz;
        const infNfe = nfe.infNfe || nfe.infNFe || {};
        const prot = raiz.protNFe?.infProt;

        if (!infNfe && !nfe) throw new Error("Erro de Schema: Estrutura <infNfe> ausente no arquivo.");

        const chave = prot?.chNFe || (infNfe.Id ? String(infNfe.Id).replace('NFe', '') : "");
        const emitCnpj = infNfe.emit?.CNPJ || infNfe.emit?.CPF || "";
        const destCnpj = infNfe.dest?.CNPJ || infNfe.dest?.CPF || "";

        return {
            tipoDocumento: "NF-E",
            modelo: "55",
            chaveAcesso: chave,
            numero: String(infNfe.ide?.nNF || ""),
            serie: String(infNfe.ide?.serie || ""),
            dataEmissao: infNfe.ide?.dhEmi || infNfe.ide?.dEmi || "",
            fluxo: this._definirFluxo(emitCnpj, destCnpj),
            emitenteCnpj: String(emitCnpj),
            emitenteNome: String(infNfe.emit?.xNome || ""),
            destinatarioCnpj: String(destCnpj),
            destinatarioNome: String(infNfe.dest?.xNome || ""),
            valorTotal: parseFloat(infNfe.total?.ICMSTot?.vNF || 0)
        };
    }

    _parseCte(raiz) {
        const cte = raiz.CTe || raiz;
        const infCte = cte.infCte || cte.infCTe || {};
        const prot = raiz.protCTe?.infProt;

        if (!infCte && !cte) throw new Error("Erro de Schema: Estrutura <infCte> ausente no arquivo.");

        const chave = prot?.chCTe || (infCte.Id ? String(infCte.Id).replace('CTe', '') : "");
        const emitCnpj = infCte.emit?.CNPJ || "";
        const destCnpj = infCte.dest?.CNPJ || infCte.rem?.CNPJ || "";

        return {
            tipoDocumento: "CT-E",
            modelo: "57",
            chaveAcesso: chave,
            numero: String(infCte.ide?.nCT || ""),
            serie: String(infCte.ide?.serie || ""),
            dataEmissao: infCte.ide?.dhEmi || "",
            fluxo: this._definirFluxo(emitCnpj, destCnpj),
            emitenteCnpj: String(emitCnpj),
            emitenteNome: String(infCte.emit?.xNome || ""),
            destinatarioCnpj: String(destCnpj),
            destinatarioNome: String(infCte.dest?.xNome || infCte.rem?.xNome || ""),
            valorTotal: parseFloat(infCte.vPrest?.vTPrest || 0)
        };
    }

    _parseNfseNacional(raiz) {
        const nfse = raiz.NFSe || raiz;
        const infNfse = nfse.infNFSe || nfse;

        const chave = infNfse.chNFSe || (infNfse.Id ? String(infNfse.Id).replace('NFSe', '') : "");
        const emitCnpj = infNfse.emit?.CNPJ || infNfse.prestador?.CNPJ || "";
        const tomadorCnpj = infNfse.tom?.CNPJ || infNfse.tomador?.CNPJ || "";

        return {
            tipoDocumento: "NFS-E",
            modelo: "PORTAL_NACIONAL",
            chaveAcesso: chave,
            numero: String(infNfse.nNFSe || infNfse.numero || ""),
            serie: String(infNfse.serie || ""),
            dataEmissao: infNfse.dhEmit || infNfse.dataEmissao || "",
            fluxo: this._definirFluxo(emitCnpj, tomadorCnpj),
            emitenteCnpj: String(emitCnpj),
            emitenteNome: String(infNfse.emit?.xNome || infNfse.prestador?.xNome || ""),
            destinatarioCnpj: String(tomadorCnpj),
            destinatarioNome: String(infNfse.tom?.xNome || infNfse.tomador?.xNome || ""),
            valorTotal: parseFloat(infNfse.valores?.vServicos || infNfse.vServ?.vServ || 0)
        };
    }
}

export default MaquinaFiscalOnline;

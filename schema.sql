-- ==============================================================================
-- VÉRTICE DOCUMENTOS - SCHEMA DE BANCO DE DADOS (POSTGRESQL)
-- Suporte a alta volumetria (100.000+ documentos fiscais mensais)
-- ==============================================================================

CREATE TYPE tipo_direcao AS ENUM ('ENTRADA', 'SAIDA');
CREATE TYPE modelo_documento AS ENUM ('55', '57', '58', '65', '67', 'NFS-E');
CREATE TYPE status_sefaz AS ENUM ('AUTORIZADA', 'CANCELADA', 'DENEGADA', 'INUTILIZADA');
CREATE TYPE status_manifestacao AS ENUM ('SEM_MANIFESTO', 'CIENCIA', 'CONFIRMACAO', 'DESCONHECIMENTO', 'NAO_REALIZADA');

CREATE TABLE IF NOT EXISTS empresas (
    id SERIAL PRIMARY KEY,
    cnpj VARCHAR(14) UNIQUE NOT NULL,
    razao_social VARCHAR(255) NOT NULL,
    inscricao_estadual VARCHAR(20),
    certificado_pfx BYTEA, 
    certificado_senha VARCHAR(255),
    certificado_validade TIMESTAMP,
    ultimo_nsu_nfe VARCHAR(15) DEFAULT '0',
    ultimo_nsu_cte VARCHAR(15) DEFAULT '0',
    ind_com_manifesto_automatico BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_empresas_cnpj ON empresas(cnpj);

CREATE TABLE IF NOT EXISTS documentos_fiscais (
    id BIGSERIAL PRIMARY KEY,
    empresa_id INT REFERENCES empresas(id) ON DELETE CASCADE,
    chave_acesso VARCHAR(44) UNIQUE, 
    uuid_nfse VARCHAR(50), 
    numero_nota INT NOT NULL,
    serie VARCHAR(5) NOT NULL,
    modelo modelo_documento NOT NULL,
    direcao tipo_direcao NOT NULL,
    cnpj_emitente VARCHAR(14) NOT NULL,
    razao_social_emitente VARCHAR(255),
    cnpj_destinatario VARCHAR(14) NOT NULL,
    razao_social_destinatario VARCHAR(255),
    valor_total NUMERIC(15,2) NOT NULL,
    cfop_principal VARCHAR(4),
    data_emissao TIMESTAMP NOT NULL,
    status_sefaz status_sefaz DEFAULT 'AUTORIZADA',
    status_manifestacao status_manifestacao DEFAULT 'SEM_MANIFESTO',
    nsu VARCHAR(15),
    tem_st BOOLEAN DEFAULT FALSE,
    tem_monofasico BOOLEAN DEFAULT FALSE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_doc_filtros ON documentos_fiscais(empresa_id, direcao, modelo, status_sefaz);
CREATE INDEX IF NOT EXISTS idx_doc_chave ON documentos_fiscais(chave_acesso);
CREATE INDEX IF NOT EXISTS idx_doc_data ON documentos_fiscais(data_emissao);

CREATE TABLE IF NOT EXISTS arquivos_xml (
    id BIGSERIAL PRIMARY KEY,
    documento_fiscal_id BIGINT REFERENCES documentos_fiscais(id) ON DELETE CASCADE UNIQUE,
    xml_conteudo TEXT NOT NULL, 
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS fila_consulta_sefaz (
    id SERIAL PRIMARY KEY,
    empresa_id INT REFERENCES empresas(id) ON DELETE CASCADE,
    tipo_documento VARCHAR(10) NOT NULL, 
    proxima_consulta TIMESTAMP NOT NULL,
    tentativas INT DEFAULT 0,
    status_fila VARCHAR(20) DEFAULT 'AGUARDANDO'
);

CREATE INDEX IF NOT EXISTS idx_fila_processamento ON fila_consulta_sefaz(status_fila, proxima_consulta);

-- Script SQL de Inicialização do Banco de Dados PostgreSQL (Vértice Auditor Fiscal)
-- Executar este script no banco de dados para criar e indexar as tabelas físicas.

-- 1. Criação dos Tipos Enumerados Fiscais
DO $$ BEGIN
    CREATE TYPE "ModeloDocumento" AS ENUM ('NFSE', 'NFE', 'CTE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "DirecaoDocumento" AS ENUM ('ENTRADA', 'SAIDA');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "StatusDocumento" AS ENUM ('REGULAR', 'CANCELADO', 'SUBSTITUIDO');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Tabela Centralizadora de Documentos Fiscais Autênticos
CREATE TABLE IF NOT EXISTS "DocumentoFiscal" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "modelo" "ModeloDocumento" NOT NULL,
    "direcao" "DirecaoDocumento" NOT NULL,
    "status" "StatusDocumento" NOT NULL DEFAULT 'REGULAR',
    "nsu" VARCHAR(15),
    "cnpjContribuinte" VARCHAR(14) NOT NULL,
    "chaveAcesso" VARCHAR(44) NOT NULL,
    "dataEmissao" TIMESTAMP(3) NOT NULL,
    "valorTotal" DECIMAL(18,2) NOT NULL,
    "xmlCompleto" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentoFiscal_pkey" PRIMARY KEY ("id")
);

-- 3. Índices e Restrições de Integridade para Blindagem Corporativa
CREATE UNIQUE INDEX IF NOT EXISTS "DocumentoFiscal_chaveAcesso_key" ON "DocumentoFiscal"("chaveAcesso");
CREATE UNIQUE INDEX IF NOT EXISTS "DocumentoFiscal_nsu_cnpjContribuinte_modelo_key" ON "DocumentoFiscal"("nsu", "cnpjContribuinte", "modelo");
CREATE INDEX IF NOT EXISTS "DocumentoFiscal_cnpjContribuinte_modelo_status_idx" ON "DocumentoFiscal"("cnpjContribuinte", "modelo", "status");

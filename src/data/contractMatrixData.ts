export interface ContractModelItem {
  id: string;
  title: string;
  vertical: string;
  description: string;
  vitais: {
    preambulo: string;
    objeto: string;
    preco: string;
    vigencia: string;
    protecao: string;
    foro: string;
  };
  validadeChecklist: {
    agenteCapaz: string;
    objetoLicito: string;
    formaPrescrita: string;
  };
  riscoEsferas: {
    civil: string;
    compliance: string;
    fiscal: string;
  };
  boilerplateDraft: string;
}

export const CONTRACT_VERTICALS = [
  "Societário, M&A e Governança Corporativa",
  "Holding Familiar & Proteção Patrimonial",
  "Tecnologia, Startups e Inovação",
  "Comercial, Parcerias e Distribuição",
  "Proteção, Sigilo e Propriedade Intelectual",
  "Imobiliário e Planejamento Tributário"
];

export const CONTRACT_MATRIX_DATA: ContractModelItem[] = [
  {
    id: "CON-070",
    title: "Protocolo de Holding Familiar com Doação de Quotas e Reserva de Usufruto Vitalício",
    vertical: "Holding Familiar & Proteção Patrimonial",
    description: "Estrutura avançada de planejamento patrimonial e sucessório em vida. Doação da nua-propriedade aos herdeiros com retenção de 100% do controle político e voto pelos patriarcas, gravames de inalienabilidade, impenhorabilidade, incomunicabilidade ampla (incluindo frutos civis) e cláusula de reversão.",
    vitais: {
      preambulo: "Qualificação minuciosa dos doadores usufrutuários e dos donatários sucessores, regimes de bens, outorga uxória/marital expressa (Art. 1.647 do CC) e indicação de herdeiros necessários.",
      objeto: "Transferência pura ou com encargo da nua-propriedade das quotas com reserva sucessiva e vitalícia de usufruto total de administração e deliberação (Arts. 1.390 a 1.411 CC).",
      preco: "Valor patrimonial contábil/histórico atribuído às quotas para recolhimento estrito do ITCMD estadual, com dispensa de colação na parte disponível (Art. 2.005 CC).",
      vigencia: "Vigência perpétua da holding e eficácia vitalícia do usufruto até a consolidação plena da propriedade na hipótese de falecimento dos patriarcas.",
      protecao: "Gravames reais de inalienabilidade, impenhorabilidade, incomunicabilidade total (inclusive sobre dividendos e lucros - Art. 1.660, V CC), cláusula de reversão (Art. 547 CC) e blindagem contra desconsideração da personalidade jurídica (Art. 50 CC / Lei 13.874/19).",
      foro: "Eleição de câmara de mediação e arbitragem especializada em direito sucessório e societário ou foro da sede social."
    },
    validadeChecklist: {
      agenteCapaz: "Doadores e donatários plenamente capazes, representados ou anuentes, com expressa concordância de todos os herdeiros necessários para evitar alegação de doação inoficiosa ou sonegação.",
      objetoLicito: "Planejamento sucessório em vida plenamente amparado pelo Art. 1.846 e Art. 2.018 do Código Civil (partilha em vida por ato entre vivos).",
      formaPrescrita: "Instrumento de alteração contratual devidamente arquivado na Junta Comercial e formalizado perante o Fisco Estadual para homologação da partilha e quitação do ITCMD."
    },
    riscoEsferas: {
      civil: "Imunização contra disputas de meação conjugal de genros e noras em caso de divórcio dos herdeiros, e proteção total contra credores pessoais dos sucessores.",
      compliance: "Separação absoluta entre o patrimônio familiar imobilizado e as atividades operacionais das empresas do grupo econômico, eliminando riscos de solidariedade trabalhista e cível.",
      fiscal: "Economia tributária de 70% a 90% em relação aos custos de um inventário judicial contencioso (redução de custas judiciais, emolumentos cartorários e alíquota progressiva de ITCMD)."
    },
    boilerplateDraft: `PROTOCOLO DE CONSTITUIÇÃO DE HOLDING FAMILIAR, DOAÇÃO DE QUOTAS COM RESERVA DE USUFRUTO VITALÍCIO E GRAVAMES RESTRITIVOS

Pelo presente instrumento particular de Alteração Contratual e Governança Familiar:

I. DOADORES E USUFRUTUÁRIOS:
SR(A). {{TITULAR_NOME}}, nacionalidade brasileira, casado sob o regime de comunhão parcial de bens com SR(A). {{CONJUGE_NOME}}, portador(a) do RG nº {{TITULAR_RG}}, inscrito(a) no CPF/MF sob o nº {{TITULAR_DOCUMENTO}}, residentes e domiciliados na {{TITULAR_ENDERECO}}; e

II. DONATÁRIOS E SUCESSORES (NU-PROPRIETÁRIOS):
1. HERDEIRO(A) 01: [NOME DO SUCESSOR 1], nacionalidade brasileira, estado civil, portador da Cédula de Identidade RG nº [RG], inscrito no CPF sob o nº [CPF], residente e domiciliado na [ENDEREÇO];
2. HERDEIRO(A) 02: [NOME DO SUCESSOR 2], nacionalidade brasileira, estado civil, portador da Cédula de Identidade RG nº [RG], inscrito no CPF sob o nº [CPF], residente e domiciliado na [ENDEREÇO];

III. SOCIEDADE RECEPTORA (HOLDING PATRIMONIAL):
{{CONTRATANTE_NOME}} HOLDING PATRIMONIAL LTDA, sociedade empresária limitada, inscrita no CNPJ/MF sob o nº {{CONTRATANTE_CNPJ}}, com contrato social devidamente arquivado perante a Junta Comercial do Estado sob o NIRE [NIRE], com sede na {{CONTRATANTE_ENDERECO}}.

CONSIDERANDO QUE:
a) Os DOADORES são legítimos proprietários da totalidade das quotas sociais representativas de 100% do capital social da HOLDING FAMILIAR;
b) É objetivo primordial dos DOADORES a perpetuação do patrimônio familiar, a garantia de harmonia geracional, a prevenção irrevogável de futuros litígios de inventário e partilha judicial (Art. 2.018 do Código Civil);
c) Faz-se imperativo assegurar aos DOADORES a governança integral, política, patrimonial e executiva inquestionável dos ativos enquanto vivos forem;

Resolvem, por mútuo acordo de vontades e na melhor forma de direito, celebrar o presente instrumento mediante as seguintes cláusulas:

CLÁUSULA PRIMEIRA - DA DOAÇÃO DA NUA-PROPRIEDADE COM RESERVA DE USUFRUTO VITALÍCIO
1.1. Os DOADORES transferem neste ato, por mera liberalidade e a título de adiantamento de legítima (respeitada estritamente a meação e a fração disponível nos termos do Art. 1.846 e Art. 2.005 do Código Civil), a NUA-PROPRIEDADE da totalidade de suas quotas sociais aos DONATÁRIOS, na proporção de 50% (cinquenta por cento) para cada um dos herdeiros sucessores.
1.2. Fica expressamente reservado aos DOADORES, em caráter vitalício, indivisível e sucessivo entre si, o USUFRUTO TOTAL E COMPLETO sobre a totalidade das quotas ora doadas, com fulcro nos Artigos 1.390 a 1.411 do Código Civil Brasileiro.
1.3. Por força da sucessividade do usufruto estipulada neste ato, sobrevindo o falecimento de um dos DOADORES, a totalidade do usufruto acrescerá automaticamente ao cônjuge sobrevivente, consolidando-se a nua-propriedade com a propriedade plena dos DONATÁRIOS somente após o falecimento de ambos os DOADORES.

CLÁUSULA SEGUNDA - DA GOVERNANÇA, DIREITOS POLÍTICOS E RETENÇÃO INTEGRAL DE VOTO
2.1. Enquanto vigorar o usufruto, competirá COM EXCLUSIVIDADE aos DOADORES USUFRUTUÁRIOS:
   I. O exercício de 100% (cem por cento) dos direitos de voto e deliberação nas assembleias e reuniões de sócios, incluídas decisões ordinárias e extraordinárias;
   II. A administração, gerência e representação legal da sociedade, em juízo ou fora dele, de forma isolada e irrevogável, com dispensa expressa de prestação de contas aos nu-proprietários;
   III. O direito à percepção e recebimento integral de todos os lucros, dividendos, rendimentos civis, juros sobre capital próprio e bonificações apurados pela sociedade;
   IV. O poder exclusivo de alienar, permutar, onerar, alugar ou integralizar bens do ativo não circulante da sociedade sem necessidade de prévia anuência dos DONATÁRIOS.

CLÁUSULA TERCEIRA - DOS GRAVAMES RESTRITIVOS (INALIENABILIDADE, IMPENHORABILIDADE E INCOMUNICABILIDADE)
3.1. As quotas sociais objeto da presente doação ficam gravadas, em caráter perpétuo e irrevogável, com as seguintes cláusulas restritivas com base no Art. 1.911 do Código Civil Brasileiro:
   I. INALIENABILIDADE: Os DONATÁRIOS não poderão vender, ceder, permutar, doar, dar em caução, comodato ou de qualquer forma onerar as referidas quotas a terceiros sem a expressa anuência prévia e por escrito dos DOADORES;
   II. IMPENHORABILIDADE: As quotas sociais, bem como os direitos delas decorrentes, não responderão, sob qualquer pretexto, por dívidas pessoais, pretéritas, presentes ou futuras dos DONATÁRIOS, seus cônjuges ou companheiros, operando como escudo contra execuções cíveis, tributárias ou trabalhistas de terceiros;
   III. INCOMUNICABILIDADE EXTENSIVA: As quotas doadas não se comunicarão a qualquer tempo com os respectivos cônjuges ou conviventes dos DONATÁRIOS, qualquer que seja o regime de bens adotado (comunhão parcial, comunhão universal, participação final nos aquestos ou união estável), estendendo-se dita incomunicabilidade aos frutos civis, lucros retidos, sobras de capital e futuros dividendos nos termos do Art. 1.660, inciso V do Código Civil.

CLÁUSULA QUARTA - DA CLÁUSULA DE REVERSÃO COM DISPENSA DE COLAÇÃO
4.1. Em observância estrita ao Artigo 547 do Código Civil, os DOADORES estipulam expressamente a CLÁUSULA DE REVERSÃO, determinando que, caso ocorra o falecimento de qualquer dos DONATÁRIOS antes do falecimento de ambos os DOADORES (pré-morte), as quotas ora doadas não serão transmitidas aos sucessores, herdeiros ou cônjuge do donatário pré-morto, retornando imediatamente e de pleno direito à propriedade plena e exclusiva dos DOADORES sobreviventes.
4.2. A presente doação é realizada com expressa dispensa de colação futura da parte correspondente à cota disponível dos DOADORES, nos moldes do Artigo 2.005 do Código Civil, não se configurando doação inoficiosa.

CLÁUSULA QUINTA - DA BLINDAGEM PATRIMONIAL E AUTONOMIA DA PERSONALIDADE JURÍDICA
5.1. A sociedade e os sócios observarão com rigor o princípio da autonomia patrimonial previsto no Artigo 49-A e Artigo 50 do Código Civil (com a redação dada pela Lei da Liberdade Econômica nº 13.874/2019), ficando terminantemente vedada qualquer confusão patrimonial entre contas bancárias da pessoa jurídica e das pessoas físicas, bem como o pagamento de despesas de cunho estritamente pessoal por intermédio das contas correntes sociais.

CLÁUSULA SEXTA - DO FORO E MEDIAÇÃO
6.1. Para dirimir quaisquer divergências resultantes deste instrumento, as partes elegem, preferencialmente, a mediação extrajudicial, e, subsidiariamente, o Foro da Comarca da sede da Sociedade, com renúncia irretratável a qualquer outro.`
  },
  {
    id: "CON-071",
    title: "Instrumento de Integralização de Imóveis ao Capital com Imunidade de ITBI (STF Tema 796)",
    vertical: "Imobiliário e Planejamento Tributário",
    description: "Instrumento jurídico e contábil para conferência de bens imóveis ao capital social da holding patrimonial pelo valor da DIRPF (Art. 23 Lei 9.249/95), estruturado sob a exata tese do Tema 796 do STF (RE 796.376) para garantir imunidade tributária de ITBI e segregação de reserva de ágio.",
    vitais: {
      preambulo: "Qualificação integral do subscritor, cônjuge com outorga marital/uxória expressa (Art. 1.647, I CC) e dados societários da sociedade receptora.",
      objeto: "Conferência e integralização de bens imóveis especificados em subscrição de aumento de capital social da holding.",
      preco: "Adoção do valor de aquisição constante da Declaração de Ajuste Anual do IRPF para neutralidade fiscal de ganho de capital (Art. 23 da Lei 9.249/95).",
      vigencia: "Eficácia imediata a partir do arquivamento na Junta Comercial, servindo a certidão como título hábil de transmissão no Registro de Imóveis (Art. 64 Lei 8.934/94).",
      protecao: "Cláusula de conformidade estrita com o Tema 796 do STF, prevenindo cobranças indevidas de ITBI sobre a subscrição e demonstrando ausência de atividade preponderante imobiliária (Art. 156, § 2º, I da CF).",
      foro: "Comarca de localização dos imóveis ou sede da holding."
    },
    validadeChecklist: {
      agenteCapaz: "Subscritor titular do imóvel no CRI, sem gravames ou penhoras, e cônjuge anuente.",
      objetoLicito: "Integralização de patrimônio imobiliário legítimo, livre e desembaraçado de ônus reais.",
      formaPrescrita: "Atos arquivados na Junta Comercial que constituem documento hábil para transcrição imobiliária nos termos do Art. 64 da Lei 8.934/94."
    },
    riscoEsferas: {
      civil: "Garantia de evicção de direitos pelos subscritores e certeza jurídica perante credores legítimos.",
      compliance: "Blindagem contra imputação de fraude contra credores (Art. 158 CC) ou fraude à execução (Art. 792 CPC) mediante apresentação de CNDs negativas.",
      fiscal: "Defesa prévia contra o auto de lançamento do ITBI municipal, respeitando o critério de que o excedente do valor venal não pode sofrer tributação sobre o capital efetivamente integralizado."
    },
    boilerplateDraft: `INSTRUMENTO PARTICULAR DE INTEGRALIZAÇÃO DE BENS IMÓVEIS AO CAPITAL SOCIAL COM APLICAÇÃO DA IMUNIDADE DE ITBI (ART. 156, § 2º, I DA CF/88 E TEMA 796 DO STF)

SUBSCRIÇÃO E CONFERÊNCIA DE BENS IMÓVEIS:
CONFERENTE: {{TITULAR_NOME}}, brasileiro, casado sob o regime de comunhão com {{CONJUGE_NOME}}, portador do CPF nº {{TITULAR_DOCUMENTO}}, residente na {{TITULAR_ENDERECO}};
SOCIEDADE RECEPTORA: {{CONTRATANTE_NOME}} HOLDING PATRIMONIAL LTDA, inscrita no CNPJ sob o nº {{CONTRATANTE_CNPJ}}, com sede na {{CONTRATANTE_ENDERECO}}.

CONSIDERANDO:
I. O Artigo 156, § 2º, inciso I da Constituição da República Federativa do Brasil, que outorga imunidade tributária do ITBI na transmissão de bens ou direitos incorporados ao patrimônio de pessoa jurídica em realização de capital;
II. A tese vinculante firmada pelo Supremo Tribunal Federal no julgamento do RE 796.376/SC (TEMA 796 DE REPERCUSSÃO GERAL), segundo a qual a imunidade de ITBI alcança a integralidade dos bens incorporados para formação do capital social subscrito;
III. O permissivo legal do Artigo 23 da Lei Federal nº 9.249/1995, que autoriza a pessoa física a transferir a pessoas jurídicas bens e direitos pelo valor constante da respectiva Declaração de Ajuste Anual do Imposto sobre a Renda da Pessoa Física (DIRPF), sem a ocorrência de fato gerador de ganho de capital;

Resolvem formalizar a integralização do imóvel nas seguintes cláusulas:

CLÁUSULA PRIMEIRA - DA DESCRIÇÃO DO IMÓVEL INTEGRALIZADO
1.1. O CONFERENTE é senhor e legítimo possuidor do seguinte imóvel, livre e desembaraçado de qualquer ônus real, dívidas, hipotecas ou penhoras:
   [DESCREVER IMÓVEL COMPLETO: Denominação, matrícula nº [MATRICULA], Livro 2 do Cartório de Registro de Imóveis da Comarca de [COMARCA], cadastro municipal IPTU nº [IPTU], com área total de [X] m²].

CLÁUSULA SEGUNDA - DO VALOR DE CONFERÊNCIA E REALIZAÇÃO DO CAPITAL
2.1. O imóvel descrito na Cláusula Primeira é neste ato integralizado pelo valor histórico e patrimonial de R$ {{CAPITAL_SOCIAL}} ({{CAPITAL_SOCIAL_EXTENSO}}), valor este idêntico ao consignado na última Declaração de Bens e Direitos (DIRPF) do CONFERENTE perante a Secretaria da Receita Federal do Brasil, em observância estrita ao Artigo 23 da Lei nº 9.249/95.
2.2. A totalidade do montante conferido é destinada estritamente à formação e subscrição de novas quotas sociais do capital social da SOCIEDADE RECEPTORA, emitindo-se quotas ordinárias nominais no valor de R$ 1,00 cada uma.

CLÁUSULA TERCEIRA - DA IMUNIDADE DO ITBI (TEMA 796 DO STF)
3.1. Em virtude de a conferência de bens destinar-se exclusivamente à integralização das quotas subscritas e correspondentes, a operação goza de IMUNIDADE CONSTITUCIONAL ABSOLUTA quanto ao Imposto sobre Transmissão de Bens Imóveis (ITBI), conforme preceitua o Art. 156, § 2º, I da CF/88 e a tese de Repercussão Geral do Tema 796 fixada pelo Pretório Excelso (STF).
3.2. A SOCIEDADE RECEPTORA declara formalmente que sua atividade preponderante NÃO consiste na compra e venda de bens ou direitos imobiliários, locação de bens imóveis ou arrendamento mercantil, inexistindo qualquer incidência da exceção constitucional.

CLÁUSULA QUARTA - DA EFICÁCIA DE TÍTULO TRANSLATIVO (ART. 64 LEI 8.934/94)
4.1. Nos precisos termos do Artigo 64 da Lei Federal nº 8.934/1994, a certidão de arquivamento deste ato societário perante a Junta Comercial do Estado constitui documento legalmente hábil e suficiente para transferência e transcrição do domínio imobiliário perante o Oficial de Registro de Imóveis competente, dispensando a lavratura de escritura pública notarial.

CLÁUSULA QUINTA - DA OUTORGA CONJUGAL E EVICÇÃO
5.1. O(A) cônjuge do CONFERENTE comparece a este ato manifestando sua OUTORGA UXÓRIA/MARITAL expressa e irrevogável, nos termos do Art. 1.647, inciso I do Código Civil.
5.2. O CONFERENTE responde legalmente pela evicção de direito nos termos da legislação civil.`
  },
  {
    id: "CON-060",
    title: "Acordo de Sócios com Drag Along, Tag Along e Cláusula Deadlock Shotgun",
    vertical: "Societário, M&A e Governança Corporativa",
    description: "Instrumento parassocial vinculante de alta densidade técnica (Art. 118 da Lei 6.404/76 e Art. 1.053 CC). Regula direito de preferência, lock-up, tag along 100%, drag along com valuation piso, cláusula shotgun para quebra de empates e vedação de penhora de quotas.",
    vitais: {
      preambulo: "Qualificação de todos os sócios ordinários, preferenciais e interveniência anuente da sociedade empresária.",
      objeto: "Regulamentação parassocial vinculante sobre exercício do direito de voto, restrições à alienação de quotas e estabilidade de gestão.",
      preco: "Fórmulas matemáticas de valuation para fins de opções e liquidações parassociais.",
      vigencia: "Prazo determinado de 5 a 10 anos ou vinculação permanente enquanto perdurar a condição de sócio.",
      protecao: "Cláusula Shotgun (Russian Roulette), Lock-up, Tag Along, Drag Along, Non-Compete e proibição de penhora de quotas por credores particulares.",
      foro: "Câmara de Arbitragem Comercial ou Foro Central da Capital."
    },
    validadeChecklist: {
      agenteCapaz: "Subscrito por 100% dos detentores do capital social com interveniência da sociedade.",
      objetoLicito: "Pacto de direitos patrimoniais disponíveis devidamente arquivado na sede da empresa (Art. 118 da LSA).",
      formaPrescrita: "Escrito particular averbado nos livros societários e arquivado perante a Junta Comercial para eficácia erga omnes."
    },
    riscoEsferas: {
      civil: "Vinculação obrigatória do administrador a não computar votos proferidos em desacordo com o acordo (execução específica Art. 118, § 3º LSA).",
      compliance: "Prevenção contra ingerência de concorrentes e fundos predatórios na governança corporativa.",
      fiscal: "Conformidade das transferências de participações societárias perante a Receita Federal e ausência de simulação tributária."
    },
    boilerplateDraft: `ACORDO DE SÓCIOS E GOVERNANÇA PARASSOCIAL (ART. 118 DA LEI Nº 6.404/76 C/C ART. 1.053 DO CÓDIGO CIVIL)

SÓCIOS SIGNATÁRIOS:
SÓCIO A: {{SOCIO_A_NOME}}, portador do CPF nº {{SOCIO_A_DOCUMENTO}}, titular de [X]% do capital social;
SÓCIO B: {{SOCIO_B_NOME}}, portador do CPF nº {{SOCIO_B_DOCUMENTO}}, titular de [Y]% do capital social;
INTERVENIENTE ANUENTE: {{EMPRESA_DENOMINACAO}} LTDA, inscrita no CNPJ/MF sob o nº {{CONTRATANTE_CNPJ}}, com sede na {{CONTRATANTE_ENDERECO}}, neste ato representada por seus administradores.

CONSIDERANDO A NECESSIDADE DE:
a) Estabelecer regras claras de governança, blindando a sociedade contra impasses operacionais e interferências de terceiros;
b) Disciplinar a alienação de quotas e assegurar direitos recíprocos de proteção a sócios minoritários e controladores;
c) Vincular os administradores para que desconsiderem quaisquer votos divergentes das diretrizes deste instrumento;

Pactuam o presente ACORDO DE SÓCIOS sob as cláusulas que seguem:

CLÁUSULA PRIMEIRA - DO LOCK-UP E DIREITO DE PREFERÊNCIA ABSOLUTO
1.1. Durante o prazo de 36 (trinta e seis) meses contados da assinatura deste instrumento (Período de Lock-up), fica expressamente vedada a qualquer sócio a alienação, cessão ou oneração de quotas a terceiros sem a anuência unânime dos demais sócios.
1.2. Findo o período de Lock-up, caso qualquer sócio receba proposta firme de terceiro de boa-fé, deverá notificar os demais sócios, os quais terão DIREITO DE PREFERÊNCIA ABSOLUTO (Right of First Refusal) para adquirir a totalidade das quotas ofertadas nas mesmas condições de preço e prazo.

CLÁUSULA SEGUNDA - DO DIREITO DE SAÍDA CONJUNTA (TAG ALONG)
2.1. Caso o sócio controlador ou a maioria do capital decida alienar o controle da sociedade a terceiro adquirente, os sócios minoritários terão o DIREITO DE SAÍDA CONJUNTA (Tag Along), ficando a eficácia da venda condicionada à obrigação do adquirente de comprar as quotas dos minoritários pelo mesmo valor unitário pago ao controlador (100% de paridade).

CLÁUSULA TERCEIRA - DA OBRIGAÇÃO DE VENDA CONJUNTA (DRAG ALONG)
3.1. Na hipótese de uma oferta de compra da totalidade de 100% do capital social formulada por terceiro estratégico, e desde que tal oferta seja aprovada por titulares de no mínimo 75% (setenta e cinco por cento) do capital social votante e respeite um valuation mínimo (Floor Valuation), os sócios minoritários ficarão expressamente OBRIGADOS a alienar a totalidade de suas quotas ao adquirente nos mesmos termos e prazos (Drag Along).

CLÁUSULA QUARTA - DO MECANISMO DE RESOLUÇÃO DE IMPASSES (CLÁUSULA SHOTGUN / DEADLOCK)
4.1. Configurado um impasse deliberativo insolúvel (Deadlock) que paralise a administração da sociedade por mais de 45 (quarenta e cinco) dias, qualquer dos sócios poderá acionar o mecanismo de compra ou venda compulsória (Cláusula Shotgun / Roleta Russa), mediante notificação formal fixando um preço unitário por quota e prazos de pagamento.
4.2. O sócio notificado terá o prazo preclusivo de 30 (trinta) dias para optar entre:
   I. VENDER a totalidade de suas quotas ao sócio notificante pelo preço unitário ofertado; OU
   II. COMPRAR a totalidade das quotas do sócio notificante exatamente pelo mesmo preço unitário e condições de pagamento por este propostas.
4.3. O silêncio do sócio notificado no prazo legal importará em anuência tácita e irrevogável para a VENDA compulsória de sua participação societária.

CLÁUSULA QUINTA - DA NÃO CONCORRÊNCIA (NON-COMPETE) E NÃO ALICIAMENTO
5.1. Os sócios obrigam-se, durante a vigência deste instrumento e pelo período de 3 (três) anos após qualquer eventual saída da sociedade, a não atuar, direta ou indiretamente (seja como sócios, consultores ou empregados), em empresas concorrentes, e a não aliciar clientes ou funcionários da sociedade, sob pena de multa não compensatória de R$ 500.000,00 mais perdas e danos.

CLÁUSULA SEXTA - DO ARQUIVAMENTO E DA EXECUÇÃO ESPECÍFICA (ART. 118 DA LSA)
6.1. O presente instrumento é arquivado na sede da Sociedade. Os administradores ficam terminantemente proibidos de registrar transferências de quotas ou lavrar atas de assembleias deliberadas em infração a este pacto, sendo cabível a Execução Específica das obrigações de fazer e não fazer nos termos do Art. 118, § 3º da Lei 6.404/76 e Art. 815 do Código de Processo Civil.`
  },
  {
    id: "CON-061",
    title: "Cláusula de Apuração de Haveres por Balanço de Determinação (STJ REsp 1.877.331/SP)",
    vertical: "Societário, M&A e Governança Corporativa",
    description: "Blindagem definitiva do fluxo de caixa e do patrimônio social contra dissoluções parciais, retiradas ou óbito de sócios. Adoção estrita de Balanço Especial de Determinação (Art. 1.031 CC) com rejeição do Fluxo de Caixa Descontado (FCD) e parcelamento protetivo em até 60 meses.",
    vitais: {
      preambulo: "Cláusula aditiva vinculada ao Contrato Social ou Acordo Parassocial de Sociedade Limitada ou Anônima.",
      objeto: "Fixação inequívoca da metodologia contábil e jurídica de liquidação da quota do sócio retirante, dissidente, excluído ou falecido.",
      preco: "Adoção exclusiva do valor patrimonial real apurado em Balanço de Determinação Especial na data da resolução.",
      vigencia: "Vigência contínua e aplicável a todas as ocorrências de dissolução parcial societária.",
      protecao: "Rejeição expressa ao Fluxo de Caixa Descontado (STJ REsp 1.877.331/SP), carência de 6 meses e parcelamento em até 60 parcelas para impedir falência por descapitalização.",
      foro: "Foro da sede da sociedade ou arbitragem."
    },
    validadeChecklist: {
      agenteCapaz: "Aprovada por sócios representando quórum qualificado em alteração do contrato social.",
      objetoLicito: "Regulamentação permissiva do Art. 1.031 do Código Civil sobre estipulação contratual de liquidação de quotas.",
      formaPrescrita: "Inscrição formal na Junta Comercial para eficácia contra terceiros e herdeiros."
    },
    riscoEsferas: {
      civil: "Proteção contra inventários litigiosos e tentativas de bloqueio judicial das contas correntes da empresa por credores do sócio individual.",
      compliance: "Evita que litígios familiares ou divórcios afetem a continuidade das operações da empresa e salários dos empregados.",
      fiscal: "Apuração contábil correta sem geração indevida de passivos fiscais sobre projeções prognósticas abstratas de lucros futuros."
    },
    boilerplateDraft: `CLÁUSULA CONTRATUAL DE APURAÇÃO DE HAVERES E LIQUIDAÇÃO SOCIETÁRIA (BALANÇO DE DETERMINAÇÃO - ART. 1.031 DO CC E JURISPRUDÊNCIA DO STJ)

CLÁUSULA [X] - DA DISSOLUÇÃO PARCIAL E CRITÉRIO DE APURAÇÃO DE HAVERES:
X.1. Em qualquer hipótese de dissolução parcial da sociedade — seja por retirada voluntária de sócio, exclusão por justa causa, falecimento, recesso ou liquidação judicial de quota por credor particular de sócio —, a apuração de haveres será processada de forma estrita e soberana pelas regras estabelecidas nesta cláusula, com renúncia irretratável a qualquer outro método.
X.2. CRITÉRIO DE AVALIAÇÃO: A apuração do montante devido ao sócio retirante ou aos seus sucessores será realizada com base exclusivamente no VALOR PATRIMONIAL REAL apurado em BALANÇO ESPECIAL DE DETERMINAÇÃO, levantado com data-base estrita no dia da resolução da sociedade em relação ao sócio, nos termos do Artigo 1.031 do Código Civil.
X.3. REJEIÇÃO DO FLUXO DE CAIXA DESCONTADO: Fica terminantemente vedada a adoção da metodologia de Fluxo de Caixa Descontado (FCD) ou de metodologias baseadas em projeções de lucros futuros hipotéticos para cálculo dos haveres societários, em estrita consonância com a jurisprudência pacífica do Superior Tribunal de Justiça (STJ - REsp 1.877.331/SP), haja vista o seu caráter prognóstico e incerto incompatível com a estabilidade patrimonial da sociedade.
X.4. ITENS DO BALANÇO DE DETERMINAÇÃO: O balanço considerará o valor justo dos bens corpóreos e incorpóreos do ativo, deduzindo-se integralmente a totalidade das contingências e passivos certos, prováveis e remotos existentes até a data da ruptura do vínculo societário.
X.5. CONDIÇÕES PROTETIVAS DE PAGAMENTO DOS HAVERES:
   I. CARÊNCIA: O pagamento dos haveres apurados gozará de carência de 180 (cento e oitenta) dias contados da homologação do balanço especial;
   II. PARCELAMENTO: O saldo devedor será adimplido pela sociedade em até 60 (sessenta) parcelas mensais, iguais e sucessivas;
   III. CORREÇÃO MONETÁRIA: As parcelas serão corrigidas exclusivamente pela variação positiva do IPCA/IBGE, sem incidência de juros remuneratórios ou moratórios durante o parcelamento regular;
X.6. A presente cláusula visa preservar a função social da empresa, a manutenção dos postos de trabalho e a liquidez do capital de giro operacional.`
  },
  {
    id: "CON-051",
    title: "Contrato Social de Sociedade Limitada de Alta Blindagem com Quotas Preferenciais (DREI IN 81/2020)",
    vertical: "Societário, M&A e Governança Corporativa",
    description: "Instrumento constitutivo completo para Sociedade Limitada (LTDA) com engenharia de blindagem: emissão de quotas ordinárias e preferenciais sem direito a voto (DREI IN 81/2020), Golden Share para sócio fundador, vedação de atos de mera liberalidade e barreira contra o Art. 50 do Código Civil.",
    vitais: {
      preambulo: "Qualificação completa dos sócios, regimes de casamento com outorga conjugal e endereço completo da sede.",
      objeto: "Objeto social delimitado e perfeitamente aderente aos CNAEs operacionais.",
      preco: "Capital social em moeda corrente, divisão entre Quotas Ordinárias (com voto) e Quotas Preferenciais (sem voto / preferência de dividendos).",
      vigencia: "Prazo de duração indeterminado.",
      protecao: "Cláusula Golden Share de veto do fundador, quóruns qualificados, apuração de haveres por balanço de determinação e barreira contra confusão patrimonial (Art. 50 CC / Lei 13.874/19).",
      foro: "Foro da sede administrativa da sociedade."
    },
    validadeChecklist: {
      agenteCapaz: "Sócios civilmente capazes, sem condenação que vede o comércio (Art. 1.011, § 1º CC).",
      objetoLicito: "Atividades mercantis ou de serviços permitidas pela legislação brasileira.",
      formaPrescrita: "Arquivamento perante a Junta Comercial competente para aquisição da personalidade jurídica."
    },
    riscoEsferas: {
      civil: "Proteção contra ingerência de herdeiros ou terceiros em cargos de administração executiva.",
      compliance: "Regras de compliance e responsabilidade limitada ao montante das quotas integralizadas (Art. 1.052 CC).",
      fiscal: "Distribuição desproporcional de dividendos isentos com fundamento no Art. 1.007 do Código Civil."
    },
    boilerplateDraft: `CONTRATO SOCIAL DE CONSTITUIÇÃO DE SOCIEDADE LIMITADA DE ALTA BLINDAGEM

SÓCIOS CONSTITUINTES:
1. {{SOCIO_A_NOME}}, brasileiro, casado sob o regime de comunhão parcial de bens com outorga conjugal expressa, titular do CPF nº {{SOCIO_A_DOCUMENTO}}, residente em {{SOCIO_A_ENDERECO}}; e
2. {{SOCIO_B_NOME}}, brasileiro, solteiro, maior, titular do CPF nº {{SOCIO_B_DOCUMENTO}}, residente em {{SOCIO_B_ENDERECO}};

Constituem uma Sociedade Limitada nos termos do Código Civil Brasileiro (Lei 10.406/2002) e da Instrução Normativa DREI nº 81/2020:

CLÁUSULA PRIMEIRA - DENOMINAÇÃO E SEDE SOCIAL
1.1. A sociedade adota a denominação social {{EMPRESA_DENOMINACAO}} LTDA e tem sua sede administrativa fixada na cidade de {{EMPRESA_CIDADE}}, Estado de {{EMPRESA_UF}}, na {{EMPRESA_ENDERECO}}.

CLÁUSULA SEGUNDA - DO OBJETO SOCIAL
2.1. O objeto da sociedade compreende o exercício das seguintes atividades: [DESCREVER ATIVIDADES CORRESPONDENTES AOS CNAEs].

CLÁUSULA TERCEIRA - DO CAPITAL SOCIAL E CRIAÇÃO DE QUOTAS PREFERENCIAIS (DREI IN 81/2020)
3.1. O capital social é de R$ {{CAPITAL_SOCIAL}} ({{CAPITAL_SOCIAL_EXTENSO}}), totalmente subscrito e integralizado em moeda corrente nacional, dividido em [X] quotas no valor nominal de R$ 1,00 cada uma.
3.2. CLASSES DE QUOTAS: Com respaldo expresso na Instrução Normativa DREI nº 81/2020 e na aplicação supletiva da Lei das S/A (Art. 1.053, parágrafo único do Código Civil), o capital social é subdividido em:
   I. QUOTAS ORDINÁRIAS (CLASSE A): Com direito a 1 (um) voto por quota em todas as deliberações societárias;
   II. QUOTAS PREFERENCIAIS (CLASSE B): Sem direito a voto nas assembleias ordinárias, com prioridade e preferência na distribuição dos lucros sociais à razão de um acréscimo de 10% sobre o dividendo das ordinárias.

CLÁUSULA QUARTA - DO DIREITO DE VETO ESTRATÉGICO (GOLDEN SHARE)
4.1. Fica outorgada ao sócio fundador {{SOCIO_A_NOME}} uma Quota Especial com Direito de Veto Estratégico (Golden Share), cuja manifestação favorável expressa é requisito impreterível para aprovação de:
   a) Alterações no contrato social ou fusões, cisões, incorporações e M&A;
   b) Alienação de ativos imobilizados de valor superior a 10% do patrimônio social;
   c) Tomada de financiamentos ou assunção de dívidas extraordinárias.

CLÁUSULA QUINTA - DA ADMINISTRAÇÃO E VEDAÇÃO DE ATOS ULTRA VIRES
5.1. A administração da sociedade será exercida isoladamente por {{SOCIO_A_NOME}}, com os mais amplos poderes de gestão.
5.2. Fica expressamente PROIBIDO aos administradores contrair obrigações estranhas ao objeto social, tais como avais, fianças, cauções ou abonos em favor de terceiros ou dos próprios sócios, sendo tais atos considerados nulos e ineficazes perante a sociedade (Teoria dos Atos Ultra Vires).

CLÁUSULA SEXTA - DA SEPARAÇÃO PATRIMONIAL E BARREIRA DO ART. 50 DO CÓDIGO CIVIL
6.1. Em observância ao Art. 49-A e Art. 50 do Código Civil (Lei da Liberdade Econômica nº 13.874/19), haverá separação contábil absoluta entre a sociedade e seus integrantes, ficando vedado o pagamento de quaisquer gastos pessoais dos sócios através de recursos sociais, impedindo a caracterização de confusão patrimonial.

CLÁUSULA SÉTIMA - DA APURAÇÃO DE HAVERES E SUCESSÃO
7.1. O falecimento de sócio não acarretará a dissolução da sociedade, cujos haveres serão liquidados com base em Balanço Especial de Determinação na forma do Art. 1.031 do CC, vedado o fluxo de caixa descontado, com pagamento em até 48 parcelas mensais.`
  },
  {
    id: "CON-052",
    title: "Contrato Social de Sociedade Limitada Unipessoal (SLU) Blindada",
    vertical: "Societário, M&A e Governança Corporativa",
    description: "Constituição de SLU com regras avançadas de proteção contra desconsideração da personalidade jurídica, nomeação de administrador fiduciário sucessório provisório para evitar paralisia em caso de incapacidade ou morte do titular.",
    vitais: {
      preambulo: "Qualificação exaustiva do titular único, RG, CPF, regime matrimonial e residência.",
      objeto: "Atividade econômica delimitada de conformidade com os códigos CNAE.",
      preco: "Capital social nominal integralizado à vista pelo titular.",
      vigencia: "Prazo indeterminado a partir da autenticação na Junta Comercial.",
      protecao: "Segregação patrimonial cabal (Art. 49-A CC), nomeação de gestor de contingência sucessória e proibição de atos ultra vires.",
      foro: "Foro da comarca sede."
    },
    validadeChecklist: {
      agenteCapaz: "Titular plenamente capaz, desimpedido de atos de comércio.",
      objetoLicito: "Atividade econômica lícita e com alvarás aplicáveis.",
      formaPrescrita: "Registro perante a Junta Comercial do Estado."
    },
    riscoEsferas: {
      civil: "Defesa prévia contra desconsideração inversa da personalidade jurídica por dívidas matrimoniais.",
      compliance: "Cumprimento de regras de transparência corporativa sem necessidade de compor sociedade fictícia com sócios laranjas.",
      fiscal: "Enquadramento tributário otimizado no Simples Nacional ou Lucro Presumido."
    },
    boilerplateDraft: `CONTRATO SOCIAL DE CONSTITUIÇÃO DE SOCIEDADE LIMITADA UNIPESSOAL (SLU)

TITULAR ÚNICO CONSTITUINTE:
{{TITULAR_NOME}}, nacionalidade brasileira, estado civil [ESTADO CIVIL], profissão [PROFISSÃO], portador do RG nº {{TITULAR_RG}}, inscrito no CPF sob o nº {{TITULAR_DOCUMENTO}}, residente em {{TITULAR_ENDERECO}}.

Constitui uma Sociedade Limitada Unipessoal nos termos do Artigo 1.052, §§ 1º e 2º do Código Civil Brasileiro:

CLÁUSULA PRIMEIRA - DA DENOMINAÇÃO E SEDE
1.1. A sociedade girará sob a denominação de {{CONTRATANTE_NOME}} LTDA e terá sua sede e domicílio fiscal na {{CONTRATANTE_ENDERECO}}.

CLÁUSULA SEGUNDA - DO OBJETO SOCIAL
2.1. O objeto social consiste em: [INSERIR DESCRIÇÃO DO OBJETO SOCIAL E CNAEs].

CLÁUSULA TERCEIRA - DO CAPITAL SOCIAL
3.1. O capital social é de R$ {{CAPITAL_SOCIAL}} ({{CAPITAL_SOCIAL_EXTENSO}}), dividido em quotas nominais no valor de R$ 1,00 cada, de titularidade exclusiva do sócio único, totalmente subscrito e integralizado em moeda corrente nacional neste ato.

CLÁUSULA QUARTA - DA AUTONOMIA PATRIMONIAL E BARREIRA DA LEI DA LIBERDADE ECONÔMICA
4.1. Nos termos do Art. 49-A e Art. 50 do Código Civil (introduzidos pela Lei nº 13.874/2019), a pessoa jurídica não se confunde com o seu titular, subsistindo autonomia estrita entre as obrigações societárias e o patrimônio particular do constituinte.
4.2. O patrimônio do titular somente responderá por dívidas sociais nas hipóteses taxativas e comprovadas de dolo, fraude manifesta contra credores ou confusão patrimonial sistemática.

CLÁUSULA QUINTA - DO ADMINISTRADOR DE CONTINGÊNCIA SUCESSÓRIA
5.1. Na hipótese de incapacidade civil civilmente comprovada ou falecimento do titular único, para que as atividades, faturamento e contas bancárias não sofram paralisia durante o inventário, fica nomeado como ADMINISTRADOR PROVISÓRIO DE CONTINGÊNCIA o Sr(a). [NOME DO ADMINISTRADOR DE CONTINGÊNCIA], CPF nº [CPF], que exercerá poderes exclusivos de gestão ordinária até a partilha das quotas judiciais ou extrajudiciais.`
  },
  {
    id: "CON-001",
    title: "Mútuo Conversível em Participação Societária com Proteção a Passivos Pretéritos",
    vertical: "Tecnologia, Startups e Inovação",
    description: "Aporte financeiro sob a forma de mútuo conversível para startups e investidores anjo com blindagem expressa contra assunção de passivos tributários, cíveis e trabalhistas pretéritos à conversão (Art. 61-A da LC 123/06).",
    vitais: {
      preambulo: "Qualificação de mutuante (investidor) e mutuária (startup), inclusive quadro de fundadores como intervenientes garantidores.",
      objeto: "Aporte de mútuo conversível com cláusula de proteção patrimonial contra passivos anteriores.",
      preco: "Valor líquido aportado, cap de valuation, percentual de desconto na rodada qualificada e juros moratórios.",
      vigencia: "Prazo de 24 a 36 meses ou gatilho automático de liquidez / rodada futura.",
      protecao: "Imunidade do investidor contra desconsideração da personalidade jurídica antes da conversão em sócio efetivo (Art. 61-A LC 123/06).",
      foro: "Câmara de arbitragem especializada."
    },
    validadeChecklist: {
      agenteCapaz: "Representantes legais munidos de autorização societária e investidor plenamente capaz.",
      objetoLicito: "Mútuo conversível legítimo escriturado contabilmente.",
      formaPrescrita: "Instrumento particular com firmas eletrônicas ICP-Brasil e 2 testemunhas."
    },
    riscoEsferas: {
      civil: "Proteção do investidor: nenhuma dívida da startup pode atingir seu patrimônio pessoal durante o mútuo.",
      compliance: "Prevenção contra diluição indevida dos fundadores e compliance financeiro.",
      fiscal: "Natureza de dívida mercantil que afasta tributação imediata de IRPJ/CSLL como receita operacional."
    },
    boilerplateDraft: `CONTRATO DE MÚTUO CONVERSÍVEL EM PARTICIPAÇÃO SOCIETÁRIA COM BLINDAGEM DE INVESTIDOR (LC 123/06 ART. 61-A)

MUTUANTE (INVESTIDOR): {{INVESTIDOR_NOME}}, CPF/CNPJ nº {{INVESTIDOR_DOCUMENTO}}, com sede/domicílio em {{INVESTIDOR_ENDERECO}};
MUTUÁRIA (STARTUP): {{CONTRATANTE_NOME}}, CNPJ nº {{CONTRATANTE_CNPJ}}, com sede em {{CONTRATANTE_ENDERECO}};
INTERVENIENTES FUNDADORES: [NOMES E QUALIFICAÇÕES DOS SÓCIOS FUNDADORES].

CLÁUSULA PRIMEIRA - DO APORTE E CONVERSÃO
1.1. O MUTUANTE disponibiliza à MUTUÁRIA a quantia de R$ {{VALOR_APORTE}} ({{VALOR_APORTE_EXTENSO}}), a título de mútuo financeiro conversível em participação societária futura.
1.2. O valor poderá ser convertido em quotas representativas de até [X]% do capital social, com desconto de 20% sobre o valuation da próxima Rodada Qualificada de Investimento ou pelo Valuation Cap de R$ [CAP].

CLÁUSULA SEGUNDA - DA IMUNIDADE E BLINDAGEM CONTRA PASSIVOS PRETERITOS
2.1. Nos termos do Artigo 61-A da Lei Complementar nº 123/2006, o MUTUANTE, na condição de credor de mútuo conversível:
   I. Não é considerado sócio e não responderá por qualquer dívida da MUTUÁRIA, inclusive em recuperação judicial ou falência;
   II. Não responderá, nem mesmo subsidiariamente ou por desconsideração da personalidade jurídica, por débitos fiscais, trabalhistas, cíveis, consumeristas ou previdenciários originados antes ou durante a vigência deste mútuo.`
  },
  {
    id: "CON-002",
    title: "Contrato de Vesting com Cliff e Cláusulas Good Leaver e Bad Leaver",
    vertical: "Tecnologia, Startups e Inovação",
    description: "Opção mercantil de aquisição progressiva de quotas por colaboradores e co-founders com carência de Cliff de 12 meses, regras de recompra compulsória de quotas em desligamento e salvaguarda da propriedade intelectual.",
    vitais: {
      preambulo: "Qualificação da startup e do beneficiário colaborador-chave.",
      objeto: "Outorga onerosa de opção mercantil de compra de quotas subordinada a permanência e cumprimento de metas.",
      preco: "Preço simbólico de face para exercício da opção futura.",
      vigencia: "Prazo de 48 meses de vesting, com cliff inegociável de 12 meses.",
      protecao: "Cláusulas rigorosas de Good Leaver (recompra pelo valor patrimonial) e Bad Leaver (perda total das opções sem direito a qualquer indenização).",
      foro: "Foro da comarca da startup."
    },
    validadeChecklist: {
      agenteCapaz: "Beneficiário capaz e sociedade autorizada por aprovação prévia dos sócios.",
      objetoLicito: "Opção mercantil com natureza comercial desvinculada de salário (sem reflexos trabalhistas).",
      formaPrescrita: "Instrumento privado escrito."
    },
    riscoEsferas: {
      civil: "Retenção da propriedade intelectual gerada exclusivamente em benefício da sociedade.",
      compliance: "Termo de não aliciamento e não concorrência pós-saída.",
      fiscal: "Mitigação do risco de autuação trabalhista mediante respeito à onerosidade da opção mercantil."
    },
    boilerplateDraft: `CONTRATO DE OPÇÃO MERCANTIL DE AQUISIÇÃO DE QUOTAS (VESTING E CLIFF)

CONTRATANTE: {{CONTRATANTE_NOME}}, inscrita no CNPJ sob o nº {{CONTRATANTE_CNPJ}};
BENEFICIÁRIO: {{BENEFICIARIO_NOME}}, inscrito no CPF sob o nº {{BENEFICIARIO_DOCUMENTO}}.

CLÁUSULA PRIMEIRA - DO CLIFF E CRONOGRAMA DE VESTING
1.1. O BENEFICIÁRIO fará jus ao direito de opção de compra de até {{PERCENTUAL_MAXIMO}}% das quotas sociais, condicionado a um prazo inicial de carência (CLIFF) inegociável de 12 (doze) meses contados da celebração deste contrato.
1.2. Se houver rescisão antes do término do Cliff, nenhuma quota será devida ao BENEFICIÁRIO.
1.3. Superado o Cliff, a aquisição ocorrerá de forma linear à razão de 1/36 por mês subsequente.

CLÁUSULA SEGUNDA - DA DISTINÇÃO ENTRE GOOD LEAVER E BAD LEAVER
2.1. Hipótese de Bad Leaver (justa causa, crime, quebra de sigilo ou concorrência desleal): o BENEFICIÁRIO perde imediatamente todas as opções não exercidas e as já exercidas poderão ser recompradas pela SOCIEDADE pelo valor nominal original de R$ 1,00 por quota.
2.2. Hipótese de Good Leaver (morte, invalidez permanente ou dispensa imotivada): o BENEFICIÁRIO preserva as quotas vestidas até a data da ruptura ou poderá ser indenizado pelo Balanço de Determinação.`
  },
  {
    id: "CON-251",
    title: "Acordo de Confidencialidade (NDA) Bilateral e Proteção de Segredos Industriais",
    vertical: "Proteção, Sigilo e Propriedade Intelectual",
    description: "Pacto de sigilo bilateral para negociações de M&A, auditorias societárias e parcerias estratégicas, com multa penal tarifada e proteção nos moldes da LGPD (Lei 13.709/18) e Lei de Propriedade Industrial (Lei 9.279/96).",
    vitais: {
      preambulo: "Qualificação minuciosa das partes e seus respectivos representantes legais.",
      objeto: "Delimitação abrangente de informações confidenciais comerciais, financeiras, cadastrais e de software.",
      preco: "Gratuito na vigência, estipulando multa penal cominatória prefixada em caso de violação.",
      vigencia: "Prazo de 5 (cinco) anos mesmo após a extinção das tratativas negociais.",
      protecao: "Proibição de cópias, engenharia reversa e dever de destruição certificada de arquivos após auditoria.",
      foro: "Foro de eleição ou câmara arbitral."
    },
    validadeChecklist: {
      agenteCapaz: "Representantes legais autorizados pelos atos constitutivos das partes.",
      objetoLicito: "Proteção de segredos empresariais e propriedade intelectual.",
      formaPrescrita: "Instrumento particular com assinatura digital qualificada."
    },
    riscoEsferas: {
      civil: "Multa penal que dispensa a comprovação de prejuízo concreto na ação de cobrança.",
      compliance: "Atendimento aos princípios da LGPD na salvaguarda de dados de terceiros.",
      fiscal: "Indenização não faturável por ausência de prestação de serviços."
    },
    boilerplateDraft: `ACORDO DE CONFIDENCIALIDADE (NDA) BILATERAL E PROTEÇÃO DE SEGREDOS DE NEGÓCIO

PARTE A: {{CONTRATANTE_NOME}}, CNPJ nº {{CONTRATANTE_CNPJ}}, com sede em {{CONTRATANTE_ENDERECO}};
PARTE B: {{RECEPTORA_NOME}}, CNPJ/CPF nº {{RECEPTORA_DOCUMENTO}}, residente/sediada em {{RECEPTORA_ENDERECO}}.

CLÁUSULA PRIMEIRA - DO ESCOPO DE SIGILO
1.1. As partes reconhecem que trocarão dados estratégicos, societários, fiscais, relatórios contábeis, algoritmos e informações negociais para fins de avaliação de parceria/M&A, os quais constituem segredos industriais protegidos pela Lei nº 9.279/1996 e pela Lei Geral de Proteção de Dados (Lei nº 13.709/2018).

CLÁUSULA SEGUNDA - DA PENALIDADE POR QUEBRA DE SIGILO
2.1. O descumprimento de qualquer dever de sigilo sujeitará a parte infratora ao pagamento de MULTA PENAL NÃO COMPENSATÓRIA no valor de R$ 250.000,00 (duzentos e cinquenta mil reais), sem prejuízo de apuração de perdas e danos complementares perante o Poder Judiciário.`
  },
  {
    id: "CON-100",
    title: "Contrato de Prestação de Serviço do Sistema para Cliente",
    vertical: "Comercial, Parcerias e Distribuição",
    description: "Instrumento contratual de prestação de serviços de tecnologia, software como serviço (SaaS), suporte técnico continuado e licenciamento da plataforma Vértice para clientes corporativos.",
    vitais: {
      preambulo: "Qualificação completa da CONTRATADA (Vértice Tecnologia) e da CONTRATANTE (Cliente usuário), com dados cadastrais e endereço.",
      objeto: "Licenciamento de software em nuvem (SaaS), módulos operacionais integrados, banco de dados seguro e suporte técnico.",
      preco: "Definição do plano contratado, periodicidade, condições de pagamento, desconto de pontualidade e multa rescisória mitigada.",
      vigencia: "Prazo de acordo com o plano ou prazo indeterminado com aviso prévio de 30 dias.",
      protecao: "Garantia de níveis de serviço (SLA), proteção de dados nos termos da LGPD (Lei 13.709/18) e sigilo absoluto das informações financeiras.",
      foro: "Foro da comarca da sede da CONTRATADA."
    },
    validadeChecklist: {
      agenteCapaz: "Representantes legais plenamente investidos de poderes de representação societária ou por procuração.",
      objetoLicito: "Licenciamento de software e serviços computacionais de acordo com a Lei de Software (Lei nº 9.609/98).",
      formaPrescrita: "Instrumento particular formal assinado eletronicamente conforme MP nº 2.200-2/2001."
    },
    riscoEsferas: {
      civil: "Limitação de responsabilidade a danos diretos comprovados, vedando indenizações por lucros cessantes decorrentes de instabilidades de terceiros.",
      compliance: "Total conformidade com o Marco Civil da Internet (Lei 12.965/14) e LGPD (Lei 13.709/18).",
      fiscal: "Adequação estrita quanto à tributação de ISS/PIS/COFINS sobre licenciamento e cessão de uso de software."
    },
    boilerplateDraft: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE TECNOLOGIA E LICENCIAMENTO DO SISTEMA

CONTRATADA: {{PRESTADOR_NOME}}, inscrita no CNPJ sob o nº {{PRESTADOR_DOCUMENTO}}, com sede em {{PRESTADOR_ENDERECO}};
CONTRATANTE: {{CONTRATANTE_NOME}}, inscrita no CNPJ sob o nº {{CONTRATANTE_CNPJ}}, com sede em {{CONTRATANTE_ENDERECO}}.

CLÁUSULA PRIMEIRA - DO OBJETO E ESCOPO DO SOFTWARE
1.1. O objeto do presente instrumento é a cessão de licença de uso do software em nuvem VÉRTICE AUDITOR FISCAL & SOCIETÁRIO e a prestação de suporte técnico contínuo.
1.2. A CONTRATADA compromete-se com a disponibilidade do sistema (SLA de 99,5%) e segurança das informações.

CLÁUSULA SEGUNDA - DA CONFIDENCIALIDADE E LGPD
2.1. Os dados da CONTRATANTE são estritamente confidenciais e tratados com base na Lei Geral de Proteção de Dados (Lei nº 13.709/2018).`
  },
  {
    id: "CON-102",
    title: "Contrato de Parceria Comercial e Distribuição Estratégica",
    vertical: "Comercial, Parcerias e Distribuição",
    description: "Regulamentação de relacionamento comercial entre parceiros para indicação de clientes, comissionamento e expansão de mercado sem vínculo empregatício.",
    vitais: {
      preambulo: "Qualificação dos parceiros comerciais com menção aos seus respectivos representantes estatutários.",
      objeto: "Aliança estratégica para distribuição conjunta, prospecção e mútua cooperação mercadológica.",
      preco: "Repasse percentual sobre comissões ou receitas auferidas de clientes efetivamente convertidos.",
      vigencia: "Prazo de 12 meses renovável automaticamente mediante ausência de notificação em contrário.",
      protecao: "Cláusula de não aliciamento de funcionários e sigilo absoluto sobre listas de prospects e margens comerciais.",
      foro: "Foro da comarca do principal polo de atuação comercial das partes."
    },
    validadeChecklist: {
      agenteCapaz: "Representantes legais com autorização expressa em seus respectivos atos constitutivos.",
      objetoLicito: "Cooperação interempresarial legítima com base no princípio da função social da empresa (Art. 421 CC).",
      formaPrescrita: "Instrumento particular com subscrição de duas testemunhas idôneas."
    },
    riscoEsferas: {
      civil: "Independência estrita das empresas, sem solidariedade perante obrigações com terceiros ou consumidores finais.",
      compliance: "Vedação terminante a práticas anticompetitivas, corrupção ou descumprimento de códigos de ética setoriais.",
      fiscal: "Emissão obrigatória de nota fiscal de comissionamento/intermediação de negócios para regularidade fiscal."
    },
    boilerplateDraft: `CONTRATO DE PARCERIA COMERCIAL E DISTRIBUIÇÃO ESTRATÉGICA

PARCEIRA A: {{CONTRATANTE_NOME}}, CNPJ nº {{CONTRATANTE_CNPJ}}, com sede em {{CONTRATANTE_ENDERECO}};
PARCEIRA B: {{RECEPTORA_NOME}}, CNPJ nº {{RECEPTORA_DOCUMENTO}}, com sede em {{RECEPTORA_ENDERECO}}.

CLÁUSULA PRIMEIRA - DA PARCERIA E INDEPENDÊNCIA
1.1. As partes estabelecem aliança de cooperação para mútua indicação de oportunidades na área de gestão tributária e societária.
1.2. Inexiste qualquer vínculo de emprego, sociedade de fato ou solidariedade passiva entre as partes.

CLÁUSULA SEGUNDA - DO COMISSIONAMENTO
2.1. O comissionamento acordado incidirá sobre o faturamento líquido recebido dos clientes originados pela PARCEIRA B, quitado mensalmente até o dia 10 do mês seguinte.`
  }
];

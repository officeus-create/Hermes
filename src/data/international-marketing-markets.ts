export type InternationalMarketService = {
  slug: string;
  title: string;
  description: string;
  eyebrow: string;
  h1: string;
  intro: string;
  targetQueries: string[];
  points: Array<{ title: string; body: string }>;
  measurement: string;
  faq: Array<{ question: string; answer: string }>;
};

export type InternationalMarketingMarket = {
  countryCode: "it" | "es";
  countryName: string;
  city: string;
  citySlug: string;
  language: "it" | "es";
  hubTitle: string;
  hubDescription: string;
  eyebrow: string;
  hubH1: string;
  hubIntro: string;
  evidenceLabel: string;
  evidenceIntro: string;
  evidence: string[];
  servicesLabel: string;
  servicesHeading: string;
  processLabel: string;
  processHeading: string;
  process: Array<{ title: string; body: string }>;
  ctaLabel: string;
  ctaHeading: string;
  ctaBody: string;
  ctaButton: string;
  boundary: string;
  services: InternationalMarketService[];
};

export const padovaMarket: InternationalMarketingMarket = {
  countryCode: "it",
  countryName: "Italia",
  city: "Padova",
  citySlug: "padova",
  language: "it",
  hubTitle: "Web, SEO e Social Media Marketing a Padova | Hermes",
  hubDescription: "Servizi per aziende di Padova: realizzazione siti web, SEO e visibilità AI/GEO, social media marketing, crescita organica e campagne Meta Ads con misurazione delle richieste.",
  eyebrow: "Padova · Italia · Marketing digitale",
  hubH1: "Siti web, SEO e social media marketing per aziende di Padova.",
  hubIntro: "Un percorso locale per imprese che vogliono costruire o migliorare il sito, aumentare la visibilità su Google e nei motori AI, pubblicare contenuti social con continuità e testare campagne a pagamento senza creare pagine locali artificiali o promesse di risultati.",
  evidenceLabel: "Domanda verificata",
  evidenceIntro: "Il cluster parte da ricerche commerciali osservate nel database italiano, non da combinazioni geografiche generate automaticamente.",
  evidence: [
    "agenzia web padova / agenzie web padova — circa 260 ricerche mensili",
    "web agency padova — circa 210 ricerche mensili",
    "realizzazione siti web padova — circa 110 ricerche mensili, difficoltà contenuta",
    "seo padova — circa 90 ricerche mensili",
    "agenzia seo padova — circa 70 ricerche mensili",
    "social media manager padova — circa 50 ricerche mensili",
  ],
  servicesLabel: "Servizi locali",
  servicesHeading: "Tre pagine proprietarie, ognuna con un intento distinto.",
  processLabel: "Metodo",
  processHeading: "Dalla visibilità alla richiesta qualificata.",
  process: [
    { title: "1. Intento", body: "Colleghiamo ogni famiglia di ricerca a una sola pagina canonica e manteniamo sito, SEO e social come decisioni separate ma coordinate." },
    { title: "2. Fondamenta", body: "Allineiamo messaggio, struttura, tracking, contenuti, prove disponibili e percorso di contatto prima di aumentare pagine o budget." },
    { title: "3. Esperimenti", body: "Testiamo una modifica o un canale alla volta: pagina, snippet, contenuto organico, creatività o campagna a pagamento." },
    { title: "4. Evidenza", body: "Valutiamo impression, click, visite utili, richieste, qualità del lead e stato commerciale senza confondere reach con ricavi." },
  ],
  ctaLabel: "Prossimo passo",
  ctaHeading: "Descrivi il primo problema di crescita da risolvere.",
  ctaBody: "Possiamo partire dal sito, dalla visibilità SEO/GEO, dai social organici o da una campagna Meta Ads. Il primo obiettivo è identificare il collo di bottiglia e il test più piccolo che può produrre evidenza utile.",
  ctaButton: "Richiedi una revisione",
  boundary: "Hermes non dichiara un ufficio fisico a Padova e non garantisce ranking, lead, vendite o ricavi. La rilevanza locale deriva da servizi reali per il mercato, contenuti utili, corretta architettura e risultati misurati.",
  services: [
    {
      slug: "realizzazione-siti-web",
      title: "Realizzazione Siti Web Padova | Siti Aziendali & SEO | Hermes",
      description: "Realizzazione siti web per aziende di Padova: UX responsive, struttura commerciale, SEO tecnico, analytics e percorsi di contatto misurabili.",
      eyebrow: "Padova · Realizzazione siti web",
      h1: "Realizzazione siti web per aziende di Padova.",
      intro: "Progettiamo siti aziendali attorno ai servizi reali, alle domande dei clienti e all'azione che il visitatore deve compiere. Il progetto può includere nuova realizzazione o redesign, SEO tecnico, contenuti, analytics e integrazioni approvate.",
      targetQueries: ["realizzazione siti web padova", "web agency padova", "agenzia web padova", "agenzia web marketing padova"],
      points: [
        { title: "Architettura commerciale", body: "Separiamo servizi, prove, FAQ, aree servite e CTA in modo che ogni pagina abbia uno scopo chiaro per utenti e motori di ricerca." },
        { title: "Design e sviluppo responsive", body: "Costruiamo una gerarchia leggibile su desktop e mobile, con componenti mantenibili e attenzione ad accessibilità e performance." },
        { title: "SEO e misurazione dal lancio", body: "Canonical, metadata, schema supportato, sitemap, analytics e tracciamento delle CTA fanno parte della verifica prima della pubblicazione." },
      ],
      measurement: "Controlliamo salute tecnica, impression e click organici, visite alle pagine di servizio, avvio/completamento delle richieste e qualità delle conversazioni generate.",
      faq: [
        { question: "Serve un sito completamente nuovo?", answer: "Non sempre. Se la piattaforma attuale può sostenere struttura, SEO, mobile, tracking e conversione, può essere più efficiente un redesign o un miglioramento graduale." },
        { question: "Il sito include SEO?", answer: "Le fondamenta tecniche e l'architettura search-friendly possono essere incluse. Un programma SEO continuativo viene definito separatamente in base alla domanda, alla concorrenza e ai dati disponibili." },
        { question: "Garantite richieste o posizionamenti?", answer: "No. Possiamo migliorare sito, misurazione e visibilità, ma ranking, domanda, comportamento dei clienti e vendite non sono controllabili o garantibili." },
      ],
    },
    {
      slug: "seo",
      title: "SEO Padova | Posizionamento, Local SEO & Visibilità AI/GEO | Hermes",
      description: "SEO per aziende di Padova: SEO tecnico, posizionamento locale, contenuti, internal linking, Search Console e visibilità GEO/AI su motori e assistenti AI.",
      eyebrow: "Padova · SEO + GEO/AI",
      h1: "SEO e visibilità AI/GEO per aziende di Padova.",
      intro: "Un unico owner per la scoperta organica: prima rendiamo chiari servizi, entità, pagine canoniche e segnali locali, poi misuriamo Google e la presenza nei risultati generativi senza creare pagine duplicate per ogni variazione di keyword.",
      targetQueries: ["seo padova", "agenzia seo padova", "consulente seo padova", "consulenza seo padova", "posizionamento siti web padova"],
      points: [
        { title: "SEO tecnico e on-page", body: "Verifichiamo crawl, indexability, canonical, metadata, schema, sitemap, performance e corrispondenza tra query e pagina proprietaria." },
        { title: "Local SEO reale", body: "Costruiamo rilevanza intorno a servizi e mercato effettivi, citazioni legittime e profili idonei senza indirizzi o sedi inventate." },
        { title: "GEO e AI visibility", body: "Rendiamo più chiari fatti, servizi, entità, FAQ e fonti utili e osserviamo se Hermes viene citata o menzionata in ChatGPT, Gemini, Copilot, Perplexity e Google AI quando disponibile." },
      ],
      measurement: "Separiamo crawl/index, impression, posizione, CTR, landing, CTA, lead qualificato e citazioni AI. Una menzione AI o un miglior ranking non viene chiamato ricavo senza evidenza downstream.",
      faq: [
        { question: "GEO sostituisce la SEO?", answer: "No. La visibilità nei sistemi generativi dipende anche da una base web comprensibile, entità coerenti, contenuti utili e fonti affidabili. Per questo SEO e GEO vengono misurate insieme ma non confuse." },
        { question: "Create molte pagine per quartieri o comuni?", answer: "Solo se esistono domanda distinta, servizio reale e contenuto utile. Non usiamo permutazioni locali sottili o doorway page." },
        { question: "Potete garantire una citazione in ChatGPT o Gemini?", answer: "No. Possiamo migliorare chiarezza, accessibilità e segnali pubblici, poi misurare le osservazioni dei provider. Le risposte dei sistemi AI restano esterne al controllo di Hermes." },
      ],
    },
    {
      slug: "social-media",
      title: "Social Media Marketing Padova | Instagram, Facebook, Threads & Meta Ads | Hermes",
      description: "Social media marketing per aziende di Padova: strategia organica, Reels e script, Instagram/Facebook/Threads, Meta Ads, landing e tracciamento delle richieste.",
      eyebrow: "Padova · Social media + Meta Ads",
      h1: "Social media marketing organico e Meta Ads per Padova.",
      intro: "Costruiamo un sistema di contenuti attorno a domande, prove, obiezioni e offerte, poi colleghiamo reach e traffico a una destinazione misurabile. Le campagne a pagamento vengono testate solo quando offerta, landing e follow-up possono sostenere il traffico.",
      targetQueries: ["social media manager padova", "social media marketing padova", "agenzia social media marketing padova", "agenzia marketing padova"],
      points: [
        { title: "Crescita organica", body: "Pianifichiamo rubriche, hook, Reels, caption e call to action per Instagram, Facebook e Threads senza copiare lo stesso contenuto in modo meccanico." },
        { title: "Meta Ads e targeting", body: "Impostiamo campagne e test di audience/creatività con tracking e landing coerenti; il budget media resta separato salvo accordo esplicito." },
        { title: "Social → sito → lead", body: "UTM, landing, eventi e processo di risposta collegano il contenuto o l'annuncio alla richiesta e alla successiva qualificazione commerciale." },
      ],
      measurement: "Osserviamo reach utile, visite al profilo, sessioni al sito, CTA, richieste, costo per azione qualificata quando c'è paid media e qualità del lead. Follower e view restano metriche diagnostiche.",
      faq: [
        { question: "Gestite sia organico sia advertising?", answer: "Sì, quando entrambi servono lo stesso obiettivo. Possono anche essere attivati separatamente: prima contenuto organico, prima Meta Ads oppure un test coordinato." },
        { question: "Su quali piattaforme lavorate?", answer: "Il nucleo attuale può includere Instagram, Facebook e Threads; altri canali vengono aggiunti solo quando il pubblico e il formato li rendono utili." },
        { question: "Garantite follower o lead?", answer: "No. Hermes gestisce ricerca, contenuto, campagne, landing, tracking e ottimizzazione concordati, ma piattaforme, aste pubblicitarie e comportamento del pubblico non sono garantibili." },
      ],
    },
  ],
};

export const madridMarket: InternationalMarketingMarket = {
  countryCode: "es",
  countryName: "España",
  city: "Madrid",
  citySlug: "madrid",
  language: "es",
  hubTitle: "Marketing Digital Madrid | Diseño Web, SEO y Redes Sociales | Hermes",
  hubDescription: "Servicios para empresas de Madrid: diseño y desarrollo web, SEO y visibilidad GEO/IA, redes sociales, crecimiento orgánico y campañas Meta Ads con medición de leads.",
  eyebrow: "Madrid · España · Marketing digital",
  hubH1: "Diseño web, SEO y redes sociales para empresas de Madrid.",
  hubIntro: "Un experimento local orientado a demanda comercial real: páginas web que convierten, SEO y visibilidad en buscadores/IA, contenido orgánico y campañas de pago conectadas a un recorrido medible desde la visita hasta el lead cualificado.",
  evidenceLabel: "Demanda verificada",
  evidenceIntro: "Madrid fue elegido frente a Valencia y Barcelona porque muestra demanda comercial consistente en web, SEO y social, no por generar más páginas geográficas.",
  evidence: [
    "consultor / consultora SEO Madrid — alrededor de 590 búsquedas mensuales",
    "agencia diseño web Madrid — alrededor de 390 búsquedas mensuales",
    "SEO Madrid / posicionamiento SEO Madrid — alrededor de 390 búsquedas mensuales",
    "diseño de páginas web Madrid / desarrollo web Madrid — alrededor de 320 búsquedas mensuales",
    "agencia redes sociales Madrid — alrededor de 90 búsquedas mensuales",
  ],
  servicesLabel: "Servicios locales",
  servicesHeading: "Tres propietarios canónicos para tres decisiones de compra.",
  processLabel: "Método",
  processHeading: "Medir el primer cuello de botella antes de escalar.",
  process: [
    { title: "1. Intención", body: "Asignamos cada familia de búsquedas a una sola URL útil y evitamos que páginas similares compitan entre sí." },
    { title: "2. Base", body: "Alineamos oferta, contenido, UX, tracking, prueba disponible y siguiente acción antes de aumentar tráfico." },
    { title: "3. Prueba", body: "Ejecutamos un cambio controlado en SEO, contenido social, landing o paid media con una hipótesis y un owner." },
    { title: "4. Resultado", body: "Comparamos visibilidad, clics, acciones, leads cualificados y estado comercial en ventanas equivalentes." },
  ],
  ctaLabel: "Siguiente paso",
  ctaHeading: "Empieza por el problema comercial más cercano al dinero.",
  ctaBody: "Podemos revisar primero la web, el SEO/GEO, las redes orgánicas o una campaña Meta Ads. La primera entrega es una prioridad medible, no una lista infinita de tácticas.",
  ctaButton: "Solicitar revisión",
  boundary: "Hermes no declara una oficina física en Madrid y no garantiza rankings, menciones de IA, leads, ventas ni ingresos. La relevancia local se basa en un mercado objetivo real, servicios disponibles y evidencia observable.",
  services: [
    {
      slug: "diseno-web",
      title: "Diseño Web Madrid | Desarrollo Web, SEO y Conversión | Hermes",
      description: "Diseño y desarrollo web para empresas de Madrid: UX responsive, arquitectura comercial, SEO técnico, analítica, formularios y rutas de conversión medibles.",
      eyebrow: "Madrid · Diseño y desarrollo web",
      h1: "Diseño y desarrollo web para empresas de Madrid.",
      intro: "Construimos o rediseñamos sitios alrededor de servicios reales, intención de búsqueda, confianza y una acción principal clara. La base técnica incluye estructura mantenible, mobile, SEO y medición antes del lanzamiento.",
      targetQueries: ["agencia diseño web madrid", "diseño de paginas web madrid", "desarrollo web madrid", "paginas web madrid", "diseño web wordpress madrid"],
      points: [
        { title: "Arquitectura y conversión", body: "Separamos servicios, audiencias, prueba, FAQ y CTA para que cada página resuelva una decisión concreta y pueda medirse." },
        { title: "Diseño responsive y desarrollo", body: "Priorizamos lectura, velocidad, accesibilidad, componentes mantenibles y la ruta principal en móvil y escritorio." },
        { title: "SEO y analítica desde el lanzamiento", body: "Canonical, metadata, schema compatible, sitemap, eventos y atribución se validan antes de llamar a una página lista para producción." },
      ],
      measurement: "Revisamos salud técnica, visibilidad orgánica, landing sessions, inicios/completados de contacto y calidad de las conversaciones generadas por cada owner.",
      faq: [
        { question: "¿Necesito una web nueva?", answer: "No necesariamente. Si la plataforma actual puede soportar la arquitectura, SEO, medición y experiencia móvil necesarias, puede ser mejor un rediseño por fases." },
        { question: "¿Incluye posicionamiento SEO?", answer: "Incluye una base técnica y una arquitectura preparada para búsqueda cuando forma parte del alcance. El crecimiento SEO continuo se planifica con demanda y datos separados." },
        { question: "¿Garantizáis posiciones o clientes?", answer: "No. Podemos mejorar la web, medición y visibilidad, pero los rankings, demanda, comportamiento del usuario y ventas dependen de sistemas externos y del mercado." },
      ],
    },
    {
      slug: "seo",
      title: "SEO Madrid | Posicionamiento, SEO Local & Visibilidad GEO/IA | Hermes",
      description: "SEO para empresas de Madrid: SEO técnico, posicionamiento local, contenidos, Search Console y visibilidad GEO/IA para Google y asistentes generativos.",
      eyebrow: "Madrid · SEO + GEO/IA",
      h1: "SEO y visibilidad GEO/IA para empresas de Madrid.",
      intro: "Trabajamos la visibilidad como una cadena: servicio real → owner canónico → crawl/index → consulta → visita → acción → lead. La capa GEO/IA añade claridad de entidad, respuestas útiles y observación de menciones/citas sin prometer presencia en ningún modelo.",
      targetQueries: ["consultor seo madrid", "consultora seo madrid", "seo madrid", "posicionamiento seo madrid", "posicionamiento web en madrid"],
      points: [
        { title: "SEO técnico y arquitectura", body: "Auditamos indexabilidad, canonical, metadata, schema, internal linking y relación query→page antes de reescribir contenido sin diagnóstico." },
        { title: "SEO local sin ubicaciones falsas", body: "La relevancia se construye con mercado real, servicios, perfiles elegibles, citas coherentes y contenido útil, no con oficinas virtuales creadas para posicionar." },
        { title: "GEO y búsqueda con IA", body: "Mejoramos la legibilidad pública de entidades, servicios, hechos y FAQ y medimos menciones/citas en ChatGPT, Gemini, Copilot, Perplexity y Google AI cuando haya observación disponible." },
      ],
      measurement: "Separamos indexación, impresiones, posición, CTR, landing, CTA, lead cualificado y visibilidad AI. No atribuimos ingresos a una mejora de ranking sin reconciliación comercial posterior.",
      faq: [
        { question: "¿Qué significa GEO?", answer: "Es la optimización de la presencia y comprensión de una marca o servicio en experiencias de búsqueda generativa. Complementa la SEO tradicional; no la sustituye." },
        { question: "¿Crearéis páginas para todos los barrios de Madrid?", answer: "No por defecto. Una URL local nueva necesita demanda distinta, servicio real, contenido único y una ruta de conversión; de lo contrario puede convertirse en doorway content." },
        { question: "¿Podéis garantizar aparecer en ChatGPT o Google AI?", answer: "No. Podemos mejorar la claridad y las señales públicas y medir observaciones, pero la selección de fuentes y respuestas pertenece a cada proveedor." },
      ],
    },
    {
      slug: "redes-sociales",
      title: "Agencia de Redes Sociales Madrid | Contenido Orgánico & Meta Ads | Hermes",
      description: "Redes sociales para empresas de Madrid: estrategia, contenido orgánico, Reels, Instagram/Facebook/Threads, Meta Ads, landing y tracking de leads.",
      eyebrow: "Madrid · Redes sociales + Meta Ads",
      h1: "Contenido orgánico, redes sociales y Meta Ads para Madrid.",
      intro: "Convertimos conocimiento del negocio en un sistema repetible de contenido y conectamos cada CTA con una página o flujo medible. Paid media se activa como experimento cuando la oferta, landing y capacidad de respuesta están preparadas.",
      targetQueries: ["agencia redes sociales madrid", "agencia marketing digital madrid", "agencias de marketing digital madrid"],
      points: [
        { title: "Contenido orgánico", body: "Diseñamos pilares, hooks, Reels, captions y cadencia para Instagram, Facebook y Threads alrededor de preguntas y objeciones reales del comprador." },
        { title: "Meta Ads y segmentación", body: "Estructuramos campañas, audiencias, retargeting y pruebas creativas con eventos y landing alineados; el gasto publicitario se mantiene separado salvo acuerdo." },
        { title: "Atribución y follow-up", body: "UTM, eventos y recepción de leads conectan publicación/anuncio con web, consulta, calificación y siguiente acción del equipo comercial." },
      ],
      measurement: "Medimos alcance útil, sesiones, acciones, leads, coste por acción cualificada cuando existe paid media y disposición comercial. Seguidores y visualizaciones son diagnóstico, no el objetivo final.",
      faq: [
        { question: "¿Trabajáis orgánico y publicidad?", answer: "Sí, juntos o por separado según el primer cuello de botella. No hace falta activar ambos canales al mismo tiempo." },
        { question: "¿Qué redes se incluyen?", answer: "El núcleo puede cubrir Instagram, Facebook y Threads. Otros canales se añaden solo cuando el público y el formato justifican el trabajo adicional." },
        { question: "¿Garantizáis leads o crecimiento de seguidores?", answer: "No. Hermes puede gestionar investigación, contenido, campañas, landing, tracking y optimización acordados; la respuesta del público y las subastas de plataforma siguen siendo externas." },
      ],
    },
  ],
};

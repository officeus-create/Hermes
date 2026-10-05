export type CatalogClientStrategyText = { uk: string; en: string };

export type CatalogClientStrategyBlock = {
  number: number;
  title: CatalogClientStrategyText;
  body: CatalogClientStrategyText;
  bullets?: CatalogClientStrategyText[];
};

export type CatalogClientStrategy = {
  businessId: string;
  observedAt: string;
  sequence: CatalogClientStrategyText[];
  blocks: CatalogClientStrategyBlock[];
  crmFields: string[];
  trainingMethod?: CatalogClientStrategyText[];
  scopes?: {
    name: CatalogClientStrategyText;
    outcome: CatalogClientStrategyText;
    boundary: CatalogClientStrategyText;
  }[];
};

const t = (uk: string, en: string): CatalogClientStrategyText => ({ uk, en });

export const catalogClientStrategies: Record<string, CatalogClientStrategy> = {
  "catalog-ua-kons-na-bis-bila-tserkva": {
    businessId: "catalog-ua-kons-na-bis-bila-tserkva",
    observedAt: "2026-10-05",
    sequence: [
      t("Audit: public + internal evidence", "Audit: public + internal evidence"),
      t("Organic Programming", "Organic Programming"),
      t("Stable Organic Baseline", "Stable Organic Baseline"),
      t("Controlled Paid Learning на organic winners", "Controlled Paid Learning on organic winners"),
      t("Signal Gate", "Signal Gate"),
      t("Offer hypothesis", "Offer hypothesis"),
      t("Funnel + CRM attribution", "Funnel + CRM attribution"),
      t("Sale → delivery → verified outcome", "Sale → delivery → verified outcome")
    ],
    blocks: [
      {
        number: 1,
        title: t("Для кого і що робимо", "Who this is for and what we are solving"),
        body: t(
          "Для «Конс на Бі$»: source-bounded digital audit, аналіз Instagram та інших каналів, organic-first план і вимірюваний шлях до 7-тижневої програми «Стратегія керованого зростання у бізнесі». Публічний профіль не видає гіпотези за підтверджені результати.",
          "For Kons na Bis: a source-bounded digital audit, Instagram and cross-channel review, an organic-first growth plan, and a measurable path to the seven-week Managed Business Growth Strategy program. The public profile does not present hypotheses as verified outcomes."
        )
      },
      {
        number: 2,
        title: t("Як ми зрозуміли задачу і рішення", "How we understood the task and solution"),
        body: t(
          "Задача — зв’язати контент, звернення, консультацію, рішення про навчання та подальший результат. Рішення — спочатку отримати внутрішню аналітику, запрограмувати органіку і сформувати стабільний baseline; paid використовується як контрольоване навчання на повторюваних organic winners. Лише після signal gate формуються offer/funnel hypotheses.",
          "The task is to connect content, inquiry, consultation, enrollment decision, and downstream outcome. The solution starts with internal analytics, organic programming, and a stable baseline; paid media is then used as controlled learning on repeatable organic winners. Offer and funnel hypotheses follow only after the signal gate."
        )
      },
      {
        number: 3,
        title: t("Що підтверджено, а що ні", "What is verified and what is not"),
        body: t(
          "Підтверджені публічно: офіційний сайт, 7-тижнева програма, Instagram, Facebook, Threads, TikTok, YouTube і Telegram як публічні surfaces. Не підтверджені публічно: Instagram Insights, Meta Ads performance, CAC, LTV, ROMI, attributable revenue, conversion uplift або business outcome від Hermes.",
          "Publicly verified: the official website, seven-week program, and the public Instagram, Facebook, Threads, TikTok, YouTube, and Telegram surfaces. Not publicly verified: Instagram Insights, Meta Ads performance, CAC, LTV, ROMI, attributable revenue, conversion uplift, or any Hermes-driven business outcome."
        )
      },
      {
        number: 4,
        title: t("Що містить цей приклад", "What this example contains"),
        body: t(
          "Digital Audit по Website · Google · Instagram · Facebook · Threads · TikTok · YouTube · Telegram; channel-role system; readiness gates; funnel/offer hypothesis; MindMap; KPI definitions; CRM attribution model; Candidate Assessment; 3–6 month media-plan logic.",
          "Digital Audit across Website · Google · Instagram · Facebook · Threads · TikTok · YouTube · Telegram; a channel-role system; readiness gates; funnel/offer hypothesis; MindMap; KPI definitions; CRM attribution model; Candidate Assessment; and 3–6 month media-plan logic."
        )
      },
      {
        number: 5,
        title: t("Ключові інсайти КНБ", "Key KNB insights"),
        body: t(
          "У КНБ вже є сильна медійна база і кілька каналів. Найбільша можливість — не просто збільшити обсяг контенту, а зробити один customer identity і вимірювати шлях content asset → CTA → qualified inquiry → consultation → sale → cohort → completion → renewal. Кожен канал має роль, а не окрему незалежну воронку.",
          "KNB already has a strong media base across multiple channels. The largest opportunity is not simply increasing content volume, but maintaining one customer identity and measuring content asset → CTA → qualified inquiry → consultation → sale → cohort → completion → renewal. Each channel gets a role rather than its own disconnected funnel."
        ),
        bullets: [
          t("Instagram / TikTok / YouTube — organic discovery, education and proof.", "Instagram / TikTok / YouTube — organic discovery, education, and proof."),
          t("Threads — hypothesis engine: питання, заперечення, hooks і content backlog.", "Threads — hypothesis engine for questions, objections, hooks, and the content backlog."),
          t("Telegram — nurture / retention із збереженням source history.", "Telegram — nurture / retention with source history preserved."),
          t("Facebook — proof / retarget / paid learning лише після readiness та CRM attribution.", "Facebook — proof / retarget / paid learning only after readiness and CRM attribution.")
        ]
      },
      {
        number: 6,
        title: t("Чернетка шляху до заявки", "Draft path to inquiry"),
        body: t(
          "Organic content → trackable CTA → існуюча консультація КНБ → qualification / problem-fit → signal gate → offer hypothesis → відповідність 7-тижневій програмі → рішення → delivery → measured outcome → renewal / club. До signal gate paid не використовується як спосіб «знайти оффер» без baseline.",
          "Organic content → trackable CTA → existing KNB consultation → qualification / problem fit → signal gate → offer hypothesis → seven-week program fit → decision → delivery → measured outcome → renewal / club. Before the signal gate, paid media is not used to search blindly for an offer without a baseline."
        )
      },
      {
        number: 7,
        title: t("Аналітика і CRM", "Analytics and CRM"),
        body: t(
          "CRM повинна зберігати source_channel, content_id, campaign_id, CTA/keyword, entry_offer, primary pain, baseline, recommended_module, manager, consultation status, program fit, objection, sale/revenue, cohort, completion і renewal. Instagram → Telegram → consultation не створюють нову людину щоразу.",
          "CRM should preserve source_channel, content_id, campaign_id, CTA/keyword, entry_offer, primary pain, baseline, recommended_module, manager, consultation status, program fit, objection, sale/revenue, cohort, completion, and renewal. Instagram → Telegram → consultation must not create a new person each time."
        )
      },
      {
        number: 8,
        title: t("Чим відрізняється підхід", "How the approach differs"),
        body: t(
          "Ми розділяємо факт, гіпотезу і результат. Public audit не підміняє internal analytics; органіка створює baseline; paid перевіряє повторювані сигнали; CRM з’єднує marketing із sales та delivery. Unknown не перетворюється на zero або вигадану проблему.",
          "We separate fact, hypothesis, and outcome. Public audit does not substitute for internal analytics; organic activity creates the baseline; paid media tests repeatable signals; CRM connects marketing to sales and delivery. Unknown is never converted into zero or an invented problem."
        )
      },
      {
        number: 9,
        title: t("Етапи реалізації", "Implementation stages"),
        body: t(
          "Етап 1: доступи + evidence map + baseline. Етап 2: organic programming і content matrix. Етап 3: repeatable winners і controlled paid learning. Етап 4: signal gate, offer/funnel hypothesis. Етап 5: CRM attribution і consultation workflow. Етап 6: sale/delivery/outcome feedback loop. Робочий горизонт плану — 3–6 місяців, а не обіцянка миттєвого результату.",
          "Stage 1: access + evidence map + baseline. Stage 2: organic programming and content matrix. Stage 3: repeatable winners and controlled paid learning. Stage 4: signal gate and offer/funnel hypothesis. Stage 5: CRM attribution and consultation workflow. Stage 6: sale/delivery/outcome feedback loop. The operating horizon is 3–6 months rather than a promise of instant results."
        )
      },
      {
        number: 10,
        title: t("Вартість і scope", "Pricing and scope"),
        body: t(
          "Затверджена ціна цього обсягу не публікується без погодженого scope. Можна почати з analysis, перейти до measured pilot і лише потім до CRM / growth integration. Це не три вигадані тарифи, а три рівні робіт.",
          "A price for this scope is not published without an agreed scope. Work can start with analysis, move to a measured pilot, and only then to CRM / growth integration. These are not invented pricing tiers; they are three levels of work."
        )
      },
      {
        number: 11,
        title: t("Доступний перший крок", "Available first step"),
        body: t(
          "Підтвердити owner-access до потрібної аналітики, одну бізнес-ціль і один measurable path. Після цього формується 3–6 month media plan. Paid/offer запуск не рекомендується до readiness gate.",
          "Confirm owner access to the required analytics, one business goal, and one measurable path. From there, build the 3–6 month media plan. Paid/offer launch is not recommended before the readiness gate."
        )
      }
    ],
    crmFields: [
      "source_channel","content_id","campaign_id","cta_keyword","entry_offer",
      "primary_pain","baseline","recommended_module","manager","consultation_status",
      "program_fit","objection","sale_revenue","cohort","completion","renewal"
    ],
    trainingMethod: [
      t("1 · Питання — спочатку колонка порожня", "1 · Question — leave the column blank first"),
      t("2 · Усвідомлення", "2 · Awareness"),
      t("3 · Розуміння", "3 · Understanding"),
      t("4 · Застосування", "4 · Application"),
      t("Після 2–4 повертаємось до 1 і формуємо наводящі питання.", "After completing 2–4, return to 1 and write leading questions.")
    ],
    scopes: [
      {
        name: t("Аналіз і пріоритети", "Analysis and priorities"),
        outcome: t("Source-based audit, readiness map, next actions.", "Source-based audit, readiness map, and next actions."),
        boundary: t("Без заявленого growth/result до перевірки.", "No claimed growth/result before verification.")
      },
      {
        name: t("Вимірюваний пілот", "Measured pilot"),
        outcome: t("Один measurable path, baseline і comparison logic.", "One measurable path, baseline, and comparison logic."),
        boundary: t("Paid тільки після organic signal gate.", "Paid only after the organic signal gate.")
      },
      {
        name: t("CRM / Growth integration", "CRM / Growth integration"),
        outcome: t("Attribution від content/source до consultation, sale і outcome.", "Attribution from content/source to consultation, sale, and outcome."),
        boundary: t("Потрібні owner-approved доступи та поля.", "Requires owner-approved access and fields.")
      }
    ]
  }
};

export function getCatalogClientStrategy(businessId: string) {
  return catalogClientStrategies[businessId] ?? null;
}

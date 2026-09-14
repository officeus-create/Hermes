import type { AcademyLaunchTrack } from "./academy-country-registry";

export type AcademyCountryPageCopy = {
  slug: string;
  locale: string;
  ogLocale: string;
  title: string;
  description: string;
  eyebrow: string;
  lead: string;
  tracksTitle: string;
  tracks: Record<AcademyLaunchTrack, { title: string; body: string }>;
  processTitle: string;
  process: string;
  futureTitle: string;
  futureBody: string;
  gateTitle: string;
  gateBody: string;
  apply: string;
};

export const academyCountryPageCopy: Record<string, AcademyCountryPageCopy> = {
  vietnam: {
    slug:"vietnam", locale:"vi", ogLocale:"vi_VN", title:"Hermes Academy tại Việt Nam | Kỹ năng logistics, marketing, sales và vận hành", description:"Lộ trình học trực tuyến tại Việt Nam về logistics Hoa Kỳ, marketing, sales và vận hành. Đăng ký được xem xét bởi con người; không cam kết việc làm hoặc thu nhập.", eyebrow:"Việt Nam · Hermes Business Academy", lead:"Học kỹ năng để làm việc với thị trường quốc tế. Chương trình dùng một nguồn kiến thức Hermes chung, được bản địa hoá bằng tiếng Việt và kiểm tra trước khi xuất bản.", tracksTitle:"Bốn hướng phát triển kỹ năng", processTitle:"Lộ trình tham gia", process:"Đăng ký → phỏng vấn → học → thực hành có giám sát → đánh giá → có thể được xem xét cho cơ hội phù hợp", futureTitle:"Sau quá trình học", futureBody:"Ứng viên đạt yêu cầu có thể được xem xét cho thực hành nâng cao, công việc theo dự án hoặc vai trò đại diện phù hợp. Không có lời hứa về việc làm, thu nhập hay khách hàng.", gateTitle:"Điều kiện trước khi tham gia", gateBody:"Lịch học, ngôn ngữ, phạm vi, giá, phương thức thanh toán và điều kiện tham gia được xác nhận cho từng đợt tuyển sinh sau khi xem xét hồ sơ.", apply:"Gửi đăng ký",
    tracks:{logistics:{title:"Logistics Hoa Kỳ",body:"Điều phối, quy trình vận tải, giao tiếp thương mại và thực hành dựa trên tài liệu được phê duyệt."},marketing:{title:"Marketing",body:"Nghiên cứu doanh nghiệp, nội dung, SEO/GEO, social media, media plan và đo lường."},sales:{title:"Sales & đàm phán",body:"Khám phá nhu cầu, cuộc gọi, đề xuất, xử lý phản đối và bàn giao khách hàng."},operations:{title:"COO / Vận hành",body:"Hệ thống, KPI, phân công trách nhiệm, kiểm soát thực thi và phát triển đội ngũ."}}
  },
  philippines: {
    slug:"philippines", locale:"fil", ogLocale:"fil_PH", title:"Hermes Academy Philippines | Logistics, Marketing, Sales at Operations", description:"Online training pathway para sa U.S. logistics, marketing, sales at operations sa Philippines. Human review ang admission; walang garantiyang trabaho o kita.", eyebrow:"Philippines · Hermes Business Academy", lead:"Bumuo ng practical skills para sa international business work. Iisang Hermes knowledge base ang pinagmumulan, tapos inaangkop sa lokal na wika at sinusuri bago ilathala.", tracksTitle:"Apat na learning path", processTitle:"Paano gumagana", process:"Application → interview → training → supervised practice → assessment → posibleng consideration para sa angkop na opportunity", futureTitle:"Pagkatapos ng training", futureBody:"Ang kwalipikadong participant ay maaaring i-review para sa advanced practice, project work o representative role kapag may angkop na pangangailangan. Walang garantiyang trabaho, kita o kliyente.", gateTitle:"Bago ang enrollment", gateBody:"Ang schedule, language, scope, price, payment path at participation terms ay kinukumpirma sa bawat cohort pagkatapos ng application review.", apply:"Mag-apply",
    tracks:{logistics:{title:"U.S. Logistics",body:"Dispatch, transport workflows, commercial communication at supervised practice gamit ang approved material."},marketing:{title:"Marketing",body:"Business research, content, SEO/GEO, social media, media planning at measurement."},sales:{title:"Sales & negotiation",body:"Discovery calls, qualification, proposals, objections at handoff sa delivery team."},operations:{title:"COO / Operations",body:"Systems, KPI, ownership, execution control at team development."}}
  },
  tajikistan: {
    slug:"tajikistan", locale:"tg", ogLocale:"tg_TJ", title:"Hermes Academy Тоҷикистон | Логистика, маркетинг, фурӯш ва амалиёт", description:"Роҳи омӯзиши онлайн барои логистикаи ИМА, маркетинг, фурӯш ва амалиёт дар Тоҷикистон. Қабул бо баррасии инсонӣ; кор ё даромад кафолат дода намешавад.", eyebrow:"Тоҷикистон · Hermes Business Academy", lead:"Малакаҳои амалӣ барои кори байналмилалиро омӯзед. Мазмун аз як манбаи тасдиқшудаи Hermes меояд, баъд маҳаллӣ ва пеш аз нашр санҷида мешавад.", tracksTitle:"Чор самти омӯзиш", processTitle:"Раванди иштирок", process:"Ариза → мусоҳиба → омӯзиш → таҷрибаи назоратшаванда → арзёбӣ → баррасии эҳтимолӣ барои имконияти мувофиқ", futureTitle:"Пас аз омӯзиш", futureBody:"Иштирокчии мувофиқ метавонад барои таҷрибаи пешрафта, кори лоиҳавӣ ё нақши намояндагӣ баррасӣ шавад. Кор, даромад ё муштарӣ кафолат дода намешавад.", gateTitle:"Пеш аз қабул", gateBody:"Ҷадвал, забон, ҳаҷм, нарх, роҳи пардохт ва шартҳои иштирок барои ҳар гурӯҳ баъди баррасии ариза тасдиқ мешаванд.", apply:"Ариза фиристед",
    tracks:{logistics:{title:"Логистикаи ИМА",body:"Диспетчерӣ, ҷараёнҳои нақлиётӣ, муоширати тиҷоратӣ ва таҷриба бо маводи тасдиқшуда."},marketing:{title:"Маркетинг",body:"Таҳқиқи бизнес, контент, SEO/GEO, шабакаҳои иҷтимоӣ ва андозагирӣ."},sales:{title:"Фурӯш ва гуфтушунид",body:"Муайян кардани ниёз, зангҳо, пешниҳодҳо, эътирозҳо ва супоридани муштарӣ."},operations:{title:"COO / Амалиёт",body:"Системаҳо, KPI, масъулият, назорати иҷро ва рушди даста."}}
  },
  morocco: {
    slug:"morocco", locale:"ar", ogLocale:"ar_MA", title:"Hermes Academy المغرب | اللوجستيات والتسويق والمبيعات والعمليات", description:"مسار تدريب أونلاين في المغرب حول اللوجستيات الأمريكية والتسويق والمبيعات وإدارة العمليات. القبول يخضع لمراجعة بشرية ولا يوجد ضمان للعمل أو الدخل.", eyebrow:"المغرب · Hermes Business Academy", lead:"طوّر مهارات عملية للعمل مع الأسواق الدولية. يعتمد المحتوى على مصدر Hermes موحّد، ثم يُترجم ويُراجع قبل النشر.", tracksTitle:"أربعة مسارات للتعلّم", processTitle:"كيف تبدأ", process:"طلب → مقابلة → تدريب → ممارسة بإشراف → تقييم → إمكانية النظر في فرصة مناسبة", futureTitle:"بعد التدريب", futureBody:"قد تتم مراجعة المشاركين المؤهلين لممارسة متقدمة أو عمل بالمشروعات أو دور تمثيلي مناسب. لا يوجد ضمان لوظيفة أو دخل أو عملاء.", gateTitle:"قبل التسجيل", gateBody:"يتم تأكيد الجدول واللغة والنطاق والسعر وطريقة الدفع وشروط المشاركة لكل دفعة بعد مراجعة الطلب.", apply:"قدّم طلبك",
    tracks:{logistics:{title:"اللوجستيات الأمريكية",body:"التنسيق وعمليات النقل والتواصل التجاري والممارسة باستخدام مواد معتمدة."},marketing:{title:"التسويق",body:"بحث الأعمال والمحتوى وSEO/GEO ووسائل التواصل والتخطيط والقياس."},sales:{title:"المبيعات والتفاوض",body:"اكتشاف الاحتياجات والمكالمات والتأهيل والعروض والاعتراضات وتسليم العميل."},operations:{title:"COO / العمليات",body:"الأنظمة وKPI وتوزيع المسؤوليات ومراقبة التنفيذ وتطوير الفريق."}}
  },
  moldova: {
    slug:"moldova", locale:"ro", ogLocale:"ro_MD", title:"Hermes Academy Moldova | Logistică, marketing, vânzări și operațiuni", description:"Program online pentru Moldova: logistică SUA, marketing, vânzări și operațiuni. Admiterea este evaluată de o persoană; nu există garanție de angajare sau venit.", eyebrow:"Moldova · Hermes Business Academy", lead:"Dezvoltă competențe practice pentru colaborarea cu piețe internaționale. Conținutul pornește dintr-o singură bază Hermes, apoi este localizat și verificat înainte de publicare.", tracksTitle:"Patru direcții de dezvoltare", processTitle:"Cum funcționează", process:"Aplicare → interviu → instruire → practică supravegheată → evaluare → posibilă analiză pentru o oportunitate potrivită", futureTitle:"După instruire", futureBody:"Participanții calificați pot fi analizați pentru practică avansată, proiecte sau roluri de reprezentare potrivite. Nu sunt garantate locul de muncă, venitul sau clienții.", gateTitle:"Înainte de înscriere", gateBody:"Calendarul, limba, conținutul, prețul, metoda de plată și condițiile sunt confirmate pentru fiecare cohortă după analiza aplicației.", apply:"Trimite aplicația",
    tracks:{logistics:{title:"Logistică SUA",body:"Dispecerat, fluxuri de transport, comunicare comercială și practică bazată pe materiale aprobate."},marketing:{title:"Marketing",body:"Cercetare de business, conținut, SEO/GEO, social media, media planning și măsurare."},sales:{title:"Vânzări & negociere",body:"Discovery, apeluri, calificare, propuneri, obiecții și handoff către echipa de livrare."},operations:{title:"COO / Operațiuni",body:"Sisteme, KPI, responsabilități, controlul execuției și dezvoltarea echipei."}}
  },
  romania: {
    slug:"romania", locale:"ro", ogLocale:"ro_RO", title:"Hermes Academy România | Logistică, marketing, vânzări și operațiuni", description:"Program online pentru România: logistică SUA, marketing, vânzări și operațiuni. Admiterea este evaluată de o persoană; nu există garanție de angajare sau venit.", eyebrow:"România · Hermes Business Academy", lead:"Dezvoltă competențe pentru colaborarea cu piețe internaționale. Conținutul folosește aceeași bază Hermes, apoi este localizat și verificat înainte de publicare.", tracksTitle:"Patru direcții de dezvoltare", processTitle:"Cum funcționează", process:"Aplicare → interviu → instruire → practică supravegheată → evaluare → posibilă analiză pentru o oportunitate potrivită", futureTitle:"După instruire", futureBody:"Participanții calificați pot fi analizați pentru practică avansată, proiecte sau roluri de reprezentare potrivite. Nu sunt garantate locul de muncă, venitul sau clienții.", gateTitle:"Înainte de înscriere", gateBody:"Calendarul, limba, conținutul, prețul, metoda de plată și condițiile sunt confirmate pentru fiecare cohortă după analiza aplicației.", apply:"Trimite aplicația",
    tracks:{logistics:{title:"Logistică SUA",body:"Dispecerat, fluxuri de transport, comunicare comercială și practică bazată pe materiale aprobate."},marketing:{title:"Marketing",body:"Cercetare de business, conținut, SEO/GEO, social media, media planning și măsurare."},sales:{title:"Vânzări & negociere",body:"Discovery, apeluri, calificare, propuneri, obiecții și handoff către echipa de livrare."},operations:{title:"COO / Operațiuni",body:"Sisteme, KPI, responsabilități, controlul execuției și dezvoltarea echipei."}}
  },
};

export const englishAcademyCountryCopy = (country: string) => ({
  title: `Hermes Academy ${country} | Logistics, Marketing, Sales & Operations`,
  description: `Online Hermes Academy pathway for ${country}: U.S. logistics, marketing, sales and operations. Applications receive human review; employment and income are not guaranteed.`,
  eyebrow: `${country} · Hermes Business Academy`,
  lead: `Build practical skills for international business work. The country page uses one approved Hermes knowledge base, then applies localization, current-fact review and publication QA.`,
  tracksTitle: "Four skill pathways",
  processTitle: "How the pathway works",
  process: "Application → Interview → Training → Supervised practice → Assessment → Possible consideration for an appropriate opportunity",
  futureTitle: "What may come after training",
  futureBody: "Qualified participants may be considered for advanced practice, project work or an appropriate representative role when there is a real need. Employment, income, clients and representation are not guaranteed.",
  gateTitle: "Before enrollment",
  gateBody: "Schedule, language, scope, price, payment path and participation terms are confirmed for each cohort after application review.",
  apply: "Apply for review",
  tracks: {
    logistics:{title:"U.S. Logistics",body:"Dispatch, transportation workflows, commercial communication and supervised practice based on approved material."},
    marketing:{title:"Marketing",body:"Business research, content, SEO/GEO, social media, media planning and measurement."},
    sales:{title:"Sales & negotiation",body:"Discovery, calls, qualification, proposals, objections and handoff to the delivery team."},
    operations:{title:"COO / Operations",body:"Systems, KPI, ownership, execution control and team development."},
  },
});

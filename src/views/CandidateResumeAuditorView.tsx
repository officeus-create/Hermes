import React, { useState } from 'react';
import { 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Upload, 
  Sparkles, 
  Share2, 
  ExternalLink, 
  Bot, 
  TrendingUp, 
  Search, 
  Zap, 
  Lock,
  MessageSquare,
  ArrowRight,
  Copy,
  Check
} from 'lucide-react';

export const CandidateResumeAuditorView: React.FC = () => {
  const [resumeText, setResumeText] = useState(`Владимир Волкогон | Lead Full-Stack & AI Engineer
Email: vladimir@example.com | Handle: @vladimir_dev

ОПЫТ РАБОТЫ:
- Senior AI & SaaS Architect (2023 - Наст. время)
  Разработка автономных ИИ-агентов, React 19, TypeScript, Next.js, Node.js, PyTorch.
- Senior Full-Stack Engineer (2020 - 2023)
  Оптимизация высоконагруженных CRM, GraphQL, PostgreSQL, Docker, CI/CD.

НАВЫКИ:
TypeScript, React, Node.js, Python, ИИ-оркестрация, REST API, TailwindCSS, Git.`);

  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<{
    atsScore: number;
    status: 'PASS' | 'WARNING' | 'BLACK_HOLE_RISK';
    missingKeywords: string[];
    riskFactors: string[];
    improvements: string[];
  } | null>({
    atsScore: 88,
    status: 'PASS',
    missingKeywords: ['Docker Containerization', 'Kubernetes', 'Microservices', 'System Architecture'],
    riskFactors: [
      'Отсутствует прямое упоминание ATS-ключей "Pyometrics / Workday Readiness"',
      'Форматирование опыта требует добавления метрик результативности (% роста, $ сэкономлено)'
    ],
    improvements: [
      'Добавьте 3 ключевых слова по микросервисам для прохождения 90%+ ATS-фильтров',
      'Замените открытый телефон на Hermes Connect Bio Link для защиты от спама'
    ]
  });

  const [copiedLink, setCopiedLink] = useState(false);
  const [targetTargetJob, setTargetJob] = useState('Senior Full-Stack & AI Engineer');

  const handleRunAudit = () => {
    setIsAuditing(true);
    setTimeout(() => {
      setIsAuditing(false);
      setAuditResult({
        atsScore: 92,
        status: 'PASS',
        missingKeywords: ['CI/CD Pipelines', 'GraphQL Query Optimization', 'AWS Serverless'],
        riskFactors: [
          'Незначительный риск по отсутствию AWS-сертификации для корпоративных ATS (Workday)'
        ],
        improvements: [
          'Ваше резюме на 92% защищено от авто-отклонения в Pyometrics и Taleo',
          'Ссылка на прямой ИИ-чат Hermes Connect готова к публикации'
        ]
      });
    }, 1200);
  };

  const handleCopyBioLink = () => {
    navigator.clipboard.writeText('https://hermes-connect.com/c/vladimir-dev');
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Header Banner: Anti-ATS Black Hole Defense */}
      <section className="glass-panel p-6 lg:p-8 bg-gradient-to-r from-slate-900 via-[#0B0D12] to-purple-950/40 border-purple-500/30">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold">
              <ShieldAlert className="w-3.5 h-3.5 text-purple-400" />
              <span>ЗАЩИТА ОТ «ALGORITHMIC BLACK HOLE»</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white font-heading">
              ИИ-Аудит Резюме и Обход ATS-Фильтров (Pyometrics & Workday)
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              90% работодателей используют ИИ-скрининг (Pyometrics, Taleo, Workday), который автоматически заносит кандидата в теневой бан до 330 дней. Hermes Connect проверяет резюме и выдает прямую ссылку для работодателей.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="p-3 rounded-2xl bg-slate-900/90 border border-white/10 text-center">
              <p className="text-[10px] text-slate-400 uppercase font-bold">ATS Readines Index</p>
              <p className="text-2xl font-black text-emerald-400 font-heading">
                {auditResult ? `${auditResult.atsScore} / 100` : '—'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid Layout: Editor & Real-Time Audit */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Resume Input & Target Role */}
        <div className="lg:col-span-6 glass-panel p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              <h2 className="text-sm font-bold text-white">Текст Резюме для Проверки</h2>
            </div>
            <span className="text-[10px] text-slate-400">Форматирование: Plain / Markdown</span>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-slate-300 font-medium">Желаемая должность / Вакансия:</label>
            <input 
              type="text" 
              value={targetTargetJob}
              onChange={(e) => setTargetJob(e.target.value)}
              className="w-full bg-slate-900/90 border border-white/15 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              placeholder="Например: Senior React & AI Engineer"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs text-slate-300 font-medium">Содержимое резюме (Experience, Skills, Bio):</label>
            <textarea 
              rows={12}
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              className="w-full bg-slate-900/90 border border-white/15 rounded-xl p-3 text-xs text-slate-200 font-mono leading-relaxed focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          <button
            onClick={handleRunAudit}
            disabled={isAuditing}
            className="w-full btn-primary py-3 justify-center text-sm font-semibold"
          >
            {isAuditing ? (
              <>
                <Zap className="w-4 h-4 animate-spin text-amber-300" />
                <span>Симуляция ATS-скрининга Pyometrics...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Запустить ИИ-Аудит и Повысить Score</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Audit Score, Missing Keywords & Bio Link */}
        <div className="lg:col-span-6 space-y-6">
          {/* ATS Score Diagnosis */}
          {auditResult && (
            <div className="glass-panel p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  {auditResult.status === 'PASS' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                  )}
                  <h2 className="text-sm font-bold text-white">Статус Прохождения ATS-Фильтров</h2>
                </div>
                <span className="badge badge-emerald">БЕЗОПАСНО ДЛЯ PYOMETRICS</span>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">ATS Pass Probability</span>
                  <span className="text-emerald-400 font-bold">{auditResult.atsScore}%</span>
                </div>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-white/10">
                  <div 
                    className="bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 h-full transition-all duration-500"
                    style={{ width: `${auditResult.atsScore}%` }}
                  />
                </div>
              </div>

              {/* Missing Keywords Analysis */}
              <div className="space-y-2 pt-2">
                <p className="text-xs font-bold text-slate-200">Рекомендуемые ключевые слова для добавления:</p>
                <div className="flex flex-wrap gap-1.5">
                  {auditResult.missingKeywords.map((kw, i) => (
                    <span key={i} className="text-[11px] px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 font-medium">
                      + {kw}
                    </span>
                  ))}
                </div>
              </div>

              {/* Concrete Action Steps */}
              <div className="space-y-2 pt-2 border-t border-white/10">
                <p className="text-xs font-bold text-slate-200">ИИ-Рекомендации по доработке:</p>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {auditResult.improvements.map((imp, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{imp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* 🔗 DIRECT HERMES CONNECT CANDIDATE LINK (Bypasses Phone Spammers) */}
          <div className="glass-panel p-5 space-y-4 bg-gradient-to-br from-indigo-950/40 via-slate-900 to-purple-950/30 border-indigo-500/30">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">Прямая Ссылка Кандидата в Hermes Connect</h3>
              </div>
              <p className="text-xs text-slate-300">
                Вместо откликов с личным телефоном, укажите эту ссылку в резюме. Рекрутер сразу попадает в ваш персональный ИИ-чат в Hermes Connect для назначения собеседования!
              </p>
            </div>

            <div className="flex items-center gap-2 bg-slate-900/90 p-2 rounded-xl border border-white/15">
              <input 
                type="text" 
                readOnly
                value="https://hermes-connect.com/c/vladimir-dev"
                className="bg-transparent text-xs text-indigo-300 font-mono flex-1 focus:outline-none px-2"
              />
              <button
                onClick={handleCopyBioLink}
                className="btn-secondary text-xs py-1.5 px-3 bg-indigo-500/20 text-indigo-200 border-indigo-500/40 hover:bg-indigo-500/30"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Скопировано</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Скопировать</span>
                  </>
                )}
              </button>
            </div>

            {/* Broadcast Multi-Portal Button */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">Авто-распространение по бесплатным платформам</span>
              <button className="btn-primary text-xs py-1.5 px-3">
                <Share2 className="w-3.5 h-3.5" />
                <span>Опубликовать везде</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

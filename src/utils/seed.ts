/**
 * Стартовый план v2 — запуск YouTube-канала, 5 этапов, 12 недель
 * Этап 0: Фундамент → Этап 1: Телеграм-база → Этап 2: Контент-завод (цикл)
 * Этап 3: Прогрев (фон с нед. 3) → Этап 4: Рост и аналитика (фон с нед. 4)
 */
import { db } from '../db/schema'
import type { Goal, Project, Task } from '../types'

// ─── ID ───────────────────────────────────────────────────────────────────────
export const SEED_GOAL = 'seed2-goal-youtube'
const P = {
  fundament: 'seed2-p0-fundament',
  telegram:  'seed2-p1-telegram',
  content:   'seed2-p2-content',
  progrev:   'seed2-p3-progrev',
  analytics: 'seed2-p4-analytics',
}
const tid = (n: number) => `seed2-t${String(n).padStart(3, '0')}`

// ─── Цель ─────────────────────────────────────────────────────────────────────
const GOAL: Goal = {
  id: SEED_GOAL,
  title: 'Запустить YouTube-канал',
  description: 'Русскоязычный канал: AI + вайбкодинг решает реальные жизненные задачи. Стадия: прогрев + сбор Telegram-базы.',
  color: '#22c55e',
  createdAt: new Date(),
}

// ─── Проекты (по одному на этап) ─────────────────────────────────────────────
const PROJECTS: Project[] = [
  { id: P.fundament, title: 'Этап 0 · Фундамент',          goalId: SEED_GOAL, status: 'active', totalTime: 0, createdAt: new Date(), nextActionId: tid(1) },
  { id: P.telegram,  title: 'Этап 1 · Телеграм-база',      goalId: SEED_GOAL, status: 'active', totalTime: 0, createdAt: new Date(), nextActionId: tid(8) },
  { id: P.content,   title: 'Этап 2 · Контент-завод',      goalId: SEED_GOAL, status: 'active', totalTime: 0, createdAt: new Date(), nextActionId: tid(14) },
  { id: P.progrev,   title: 'Этап 3 · Прогрев (с нед. 3)', goalId: SEED_GOAL, status: 'active', totalTime: 0, createdAt: new Date(), nextActionId: tid(58) },
  { id: P.analytics, title: 'Этап 4 · Рост + аналитика',   goalId: SEED_GOAL, status: 'active', totalTime: 0, createdAt: new Date(), nextActionId: tid(69) },
]

// ─── Задачи ───────────────────────────────────────────────────────────────────
type Raw = { n: number; proj: string; week: number; title: string; min: number }

const RAW: Raw[] = [

  // ══════════════════════════════════════════════════════
  //  ЭТАП 0 · ФУНДАМЕНТ (неделя 1)
  //  Зависит от: ничего · Открывает: все остальные этапы
  // ══════════════════════════════════════════════════════
  { n:1,  proj:P.fundament, week:1, min:30, title:'Выписать 8 ниш-болей канала и по 2 примера вопроса зрителя для каждой' },
  { n:2,  proj:P.fundament, week:1, min:15, title:'Написать слоган канала в 1 строку: «[кому] решить [что] с помощью [чем]»' },
  { n:3,  proj:P.fundament, week:1, min:30, title:'Создать аккаунт YouTube, заполнить имя, описание и ссылки' },
  { n:4,  proj:P.fundament, week:1, min:30, title:'Сгенерировать 5 вариантов аватара в AI и выбрать один' },
  { n:5,  proj:P.fundament, week:1, min:45, title:'Создать баннер канала в Canva 1920×1080 и загрузить на YouTube' },
  { n:6,  proj:P.fundament, week:1, min:45, title:'Настроить место съёмки: свет, фон, микрофон — записать тестовый дубль' },
  { n:7,  proj:P.fundament, week:1, min:20, title:'Создать аккаунты TikTok и Instagram, заполнить bio и ссылки' },

  // ══════════════════════════════════════════════════════
  //  ЭТАП 1 · ТЕЛЕГРАМ-БАЗА (неделя 1–2)
  //  Зависит от: создан YouTube · Открывает: CTA для контент-завода
  // ══════════════════════════════════════════════════════
  { n:8,  proj:P.telegram, week:1, min:20, title:'Создать Telegram-канал, написать bio и описание' },
  { n:9,  proj:P.telegram, week:1, min:45, title:'Написать и закрепить пост-знакомство: кто я, о чём канал, что получишь' },
  { n:10, proj:P.telegram, week:2, min:20, title:'Настроить ссылку на исходник kaizen-steps (GitHub Release или Google Drive)' },
  { n:11, proj:P.telegram, week:2, min:30, title:'Написать пост-лид-магнит: «Подпишись → получи исходник kaizen-steps»' },
  { n:12, proj:P.telegram, week:2, min:20, title:'Сделать Google-форму предзаписи на интенсив — 3 вопроса' },
  { n:13, proj:P.telegram, week:2, min:20, title:'Написать пост-анонс предзаписи со ссылкой на форму' },

  // ══════════════════════════════════════════════════════
  //  ЭТАП 2 · КОНТЕНТ-ЗАВОД (недели 1–12, повторяющийся цикл)
  //  Зависит от: Этапы 0 и 1 · Строгий порядок внутри цикла:
  //  Ш1 собрать/выбрать → Ш2 сценарий → Ш3 снять/монтаж → Ш4 нарезать → Ш5 выложить
  // ══════════════════════════════════════════════════════

  // ── Видео 1: kaizen-steps / продуктивность (нед. 1–3) ──
  // Ш1: выбор боли + подготовка приложения
  { n:14, proj:P.content, week:1, min:20, title:'Выписать 7 личных болей прокрастинации как основу сценария' },
  { n:15, proj:P.content, week:1, min:30, title:'Подготовить демо kaizen-steps: добавить тестовые задачи и цели для съёмки' },
  // Ш2: сценарий
  { n:16, proj:P.content, week:2, min:30, title:'Набросать структуру видео о kaizen-steps: хук → боль → решение → демо → CTA' },
  { n:17, proj:P.content, week:2, min:60, title:'Написать полный сценарий длинного видео про kaizen-steps' },
  // Ш3: съёмка + монтаж
  { n:18, proj:P.content, week:2, min:45, title:'Записать скринкаст: демо kaizen-steps — инбокс, задачи, AI-строка' },
  { n:19, proj:P.content, week:2, min:45, title:'Снять себя в кадре: вступление и объяснение методики Дорофеева' },
  { n:20, proj:P.content, week:3, min:60, title:'Смонтировать длинное видео о kaizen-steps: склейка, субтитры, переходы' },
  { n:21, proj:P.content, week:3, min:45, title:'Наложить скринкаст на монолог, выровнять звук, добавить музыку' },
  // Ш4: нарезать короткие
  { n:22, proj:P.content, week:3, min:45, title:'Нарезать 3 коротких клипа из длинного видео о kaizen-steps' },
  // Ш5: выложить
  { n:23, proj:P.content, week:3, min:20, title:'Написать описание длинного видео с CTA: ссылка на исходник в Telegram' },
  { n:24, proj:P.content, week:3, min:30, title:'Выложить длинное на YouTube + 3 коротких на TikTok/Instagram/YouTube Shorts' },

  // ── Видео 2: напоминалка о лекарствах / здоровье (нед. 3–4) ──
  // Ш1
  { n:25, proj:P.content, week:3, min:60, title:'Собрать приложение-напоминалку о лекарствах через вайбкодинг (Bolt + GPT)' },
  // Ш2
  { n:26, proj:P.content, week:4, min:45, title:'Написать сценарий о напоминалке: боль → 40 минут сборки → демо → скачай' },
  // Ш3
  { n:27, proj:P.content, week:4, min:60, title:'Снять и смонтировать длинное видео о напоминалке лекарств' },
  // Ш4
  { n:28, proj:P.content, week:4, min:30, title:'Нарезать 3 коротких из видео о напоминалке' },
  // Ш5
  { n:29, proj:P.content, week:4, min:20, title:'Написать описание + выложить напоминалку на всех платформах' },

  // ── Видео 3: домашка как игра / дети (нед. 5–6) ──
  // Ш1
  { n:30, proj:P.content, week:5, min:60, title:'Собрать приложение-геймификатор домашнего задания через вайбкодинг' },
  // Ш2
  { n:31, proj:P.content, week:5, min:45, title:'Написать сценарий: «ребёнок не хочет делать домашку» → игровое приложение за вечер' },
  // Ш3
  { n:32, proj:P.content, week:6, min:60, title:'Снять и смонтировать длинное видео о геймификации домашки' },
  // Ш4
  { n:33, proj:P.content, week:6, min:30, title:'Нарезать 3 коротких из видео о домашке' },
  // Ш5
  { n:34, proj:P.content, week:6, min:20, title:'Написать описание + выложить видео о геймификации домашки' },

  // ── Видео 4: карточки по сериалу / языки (нед. 7–8) ──
  // Ш1
  { n:35, proj:P.content, week:7, min:60, title:'Собрать приложение языковых карточек под конкретный сериал' },
  // Ш2
  { n:36, proj:P.content, week:7, min:45, title:'Написать сценарий: «учу испанский через «Деньги Хайста» — карточки за вечер»' },
  // Ш3
  { n:37, proj:P.content, week:8, min:60, title:'Снять и смонтировать длинное видео о языковых карточках' },
  // Ш4
  { n:38, proj:P.content, week:8, min:30, title:'Нарезать 3 коротких из видео о карточках' },
  // Ш5
  { n:39, proj:P.content, week:8, min:20, title:'Написать описание + выложить видео о карточках на всех платформах' },

  // ── Видео 5: планировщик свиданий / отношения (нед. 9–10) ──
  // Ш1
  { n:40, proj:P.content, week:9,  min:60, title:'Собрать приложение с идеями свиданий под бюджет через вайбкодинг' },
  // Ш2
  { n:41, proj:P.content, week:9,  min:45, title:'Написать сценарий: «не знаю куда пойти с женой» → решение за вечер' },
  // Ш3
  { n:42, proj:P.content, week:10, min:60, title:'Снять и смонтировать длинное видео о планировщике свиданий' },
  // Ш4
  { n:43, proj:P.content, week:10, min:30, title:'Нарезать 3 коротких из видео о планировщике свиданий' },
  // Ш5
  { n:44, proj:P.content, week:10, min:20, title:'Написать описание + выложить видео о планировщике свиданий' },

  // ── Видео 6: конспект-машина / учёба (нед. 11–12) ──
  // Ш1
  { n:45, proj:P.content, week:11, min:60, title:'Собрать конспект-машину: загрузить лекцию → получить карточки (API + вайбкодинг)' },
  // Ш2
  { n:46, proj:P.content, week:11, min:45, title:'Написать сценарий: «конспектирую лекцию за 5 минут с AI» — демо конспект-машины' },
  // Ш3
  { n:47, proj:P.content, week:12, min:60, title:'Снять и смонтировать длинное видео о конспект-машине' },
  // Ш4
  { n:48, proj:P.content, week:12, min:30, title:'Нарезать 3 коротких из видео о конспект-машине' },
  // Ш5
  { n:49, proj:P.content, week:12, min:20, title:'Написать описание + выложить видео о конспект-машине' },

  // ══════════════════════════════════════════════════════
  //  ЭТАП 3 · ПРОГРЕВ (фоновый поток, с недели 3)
  //  Зависит от: есть Telegram-канал + вышло первое видео
  //  Открывает: доверие аудитории и список предзаписи
  // ══════════════════════════════════════════════════════
  { n:50, proj:P.progrev, week:3,  min:30, title:'Написать пост о мыслетопливе по Дорофееву: одна ключевая мысль' },
  { n:51, proj:P.progrev, week:3,  min:20, title:'Написать тизер следующего видео + задать вопрос аудитории' },
  { n:52, proj:P.progrev, week:4,  min:30, title:'Написать пост: «Как я перестал прокрастинировать — одна техника»' },
  { n:53, proj:P.progrev, week:4,  min:15, title:'Написать пост-вопрос: «Какая ваша главная боль с [тема недели]?»' },
  { n:54, proj:P.progrev, week:5,  min:20, title:'Написать пост: закулисье сборки приложения — 1 скриншот + 3 предложения' },
  { n:55, proj:P.progrev, week:6,  min:20, title:'Написать пост: «Почему выбрал именно эту боль для этого видео»' },
  { n:56, proj:P.progrev, week:7,  min:30, title:'Написать мини-урок: «Как формулировать задачу по Дорофееву за 30 секунд»' },
  { n:57, proj:P.progrev, week:8,  min:15, title:'Запустить Telegram-опрос: «О какой боли снять следующее видео?»' },
  { n:58, proj:P.progrev, week:9,  min:20, title:'Написать пост: честная метрика — подписчики, просмотры, выводы за 7 недель' },
  { n:59, proj:P.progrev, week:10, min:25, title:'Написать пост-напоминание о предзаписи + лид-магнит (исходник видео 5)' },
  { n:60, proj:P.progrev, week:11, min:20, title:'Написать тизер финального видео + призыв поделиться каналом' },
  { n:61, proj:P.progrev, week:12, min:30, title:'Написать итоговый пост: 3 вещи, которые понял за 12 недель ведения канала' },

  // ══════════════════════════════════════════════════════
  //  ЭТАП 4 · РОСТ И АНАЛИТИКА (фоновый поток, с недели 4)
  //  Зависит от: есть минимум 2 видео для сравнения
  //  Открывает: улучшение хуков и понимание аудитории
  // ══════════════════════════════════════════════════════
  { n:62, proj:P.analytics, week:4,  min:20, title:'Открыть YouTube Studio, записать в таблицу: показы, CTR, просмотры видео 1–2' },
  { n:63, proj:P.analytics, week:4,  min:20, title:'Прочитать первые 10 комментариев и ответить на каждый лично' },
  { n:64, proj:P.analytics, week:6,  min:15, title:'Сравнить удержание видео 1 и 2 в YouTube Studio, записать вывод в 1 предложение' },
  { n:65, proj:P.analytics, week:6,  min:20, title:'Придумать 3 альтернативных хука для следующего видео на основе данных' },
  { n:66, proj:P.analytics, week:8,  min:20, title:'Открыть TikTok Analytics, найти топ-3 видео по охвату и общую закономерность' },
  { n:67, proj:P.analytics, week:8,  min:30, title:'Ответить на все комментарии за последние 2 недели на всех платформах' },
  { n:68, proj:P.analytics, week:10, min:20, title:'Записать 5 идей для новых видео из комментариев и вопросов в Telegram' },
  { n:69, proj:P.analytics, week:12, min:45, title:'Написать отчёт: цифры, выводы, шаблон контент-завода на следующий квартал' },
  { n:70, proj:P.analytics, week:12, min:30, title:'Пересмотреть структуру цикла и обновить шаблон для видео 7–12' },
]

function toTask(r: Raw): Task {
  return {
    id:        tid(r.n),
    title:     r.title,
    projectId: r.proj,
    goalId:    SEED_GOAL,
    status:    'todo',
    isToday:   false,
    timeSpent: 0,
    createdAt: new Date(Date.now() + r.n), // уникальная дата для правильной сортировки
  }
}

// ─── Сброс старых данных + новый seed ────────────────────────────────────────
export async function resetAndSeed(): Promise<{ goals: number; projects: number; tasks: number }> {
  await db.transaction('rw', [db.goals, db.projects, db.tasks, db.timeEntries], async () => {
    // Удаляем ВСЁ (приложение персональное, данных немного)
    await db.tasks.clear()
    await db.projects.clear()
    await db.goals.clear()
    await db.timeEntries.clear()

    // Загружаем новый план
    await db.goals.add(GOAL)
    await db.projects.bulkAdd(PROJECTS)
    await db.tasks.bulkAdd(RAW.map(toTask))
  })
  return { goals: 1, projects: PROJECTS.length, tasks: RAW.length }
}

// Оставляем старые имена для обратной совместимости
export const seedPlan     = resetAndSeed
export const isSeedLoaded = async () => Boolean(await db.goals.get(SEED_GOAL))

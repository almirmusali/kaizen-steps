/**
 * Стартовый план: запуск YouTube-канала на 12 недель
 * 4 проекта, 1 цель, 71 задача — методика Дорофеева / кайдзен
 */
import { db } from '../db/schema'
import type { Goal, Project, Task } from '../types'

// ─── Стабильные ID (не меняются при повторном вызове) ─────────────────────────
const IDS = {
  goal:    'seed-goal-youtube',
  p1:      'seed-proj-fundament',
  p2:      'seed-proj-content',
  p3:      'seed-proj-telegram',
  p4:      'seed-proj-analytics',
}

function tid(n: number) { return `seed-task-${String(n).padStart(3, '0')}` }

// ─── Данные ───────────────────────────────────────────────────────────────────
const GOAL: Goal = {
  id: IDS.goal,
  title: 'Запустить YouTube-канал',
  description: 'Русскоязычный канал о решении реальных жизненных задач с помощью AI и вайбкодинга. Стадия: прогрев + сбор Telegram-базы.',
  color: '#22c55e',
  createdAt: new Date(),
}

const PROJECTS: Project[] = [
  { id: IDS.p1, title: 'Фундамент канала',        goalId: IDS.goal, status: 'active', totalTime: 0, createdAt: new Date() },
  { id: IDS.p2, title: 'Контент-завод',            goalId: IDS.goal, status: 'active', totalTime: 0, createdAt: new Date() },
  { id: IDS.p3, title: 'Телеграм и предзапись',    goalId: IDS.goal, status: 'active', totalTime: 0, createdAt: new Date() },
  { id: IDS.p4, title: 'Рост и аналитика',         goalId: IDS.goal, status: 'active', totalTime: 0, createdAt: new Date() },
]

type SeedTask = { n: number; title: string; proj: string; week: number; min: number; tags?: string }

const RAW: SeedTask[] = [
  // ── Фундамент канала ──
  { n:1,  proj:IDS.p1, week:1,  min:30, title:'Выписать 8 ниш-болей канала и по 2 примера вопроса зрителя для каждой' },
  { n:2,  proj:IDS.p1, week:1,  min:15, title:'Написать слоган канала в 1 строку по формуле «[кому] решить [что] с помощью [чем]»' },
  { n:3,  proj:IDS.p1, week:1,  min:30, title:'Создать аккаунт YouTube, заполнить имя, описание и ссылки' },
  { n:4,  proj:IDS.p1, week:1,  min:30, title:'Сгенерировать 5 вариантов аватара в AI и выбрать один' },
  { n:5,  proj:IDS.p1, week:1,  min:30, title:'Снять 60-секундный ролик «кто я и о чём канал» — один дубль на телефон' },
  { n:6,  proj:IDS.p1, week:1,  min:45, title:'Смонтировать ролик в CapCut: субтитры и фоновая музыка' },
  { n:7,  proj:IDS.p1, week:1,  min:15, title:'Выложить ролик как первый Short на YouTube с описанием и 5 хештегами' },
  { n:8,  proj:IDS.p1, week:2,  min:45, title:'Создать баннер канала в Canva 1920×1080 и загрузить на YouTube' },
  { n:9,  proj:IDS.p1, week:2,  min:20, title:'Создать аккаунт TikTok, заполнить bio, выложить первый ролик' },
  { n:10, proj:IDS.p1, week:2,  min:15, title:'Создать Instagram, выложить тот же ролик как Reels' },
  { n:11, proj:IDS.p1, week:2,  min:45, title:'Настроить место съёмки: свет, фон, микрофон — сделать тестовый дубль' },

  // ── Контент-завод: видео 1 kaizen-steps ──
  { n:12, proj:IDS.p2, week:1,  min:20, title:'Выписать 7 личных болей прокрастинации как основу для сценария о kaizen-steps' },
  { n:13, proj:IDS.p2, week:1,  min:30, title:'Набросать структуру длинного видео: хук → боль → решение → демо → CTA' },
  { n:14, proj:IDS.p2, week:2,  min:60, title:'Написать полный сценарий длинного видео про kaizen-steps' },
  { n:15, proj:IDS.p2, week:2,  min:45, title:'Записать скринкаст: добавить задачу, разобрать инбокс, спросить AI в kaizen-steps' },
  { n:16, proj:IDS.p2, week:2,  min:45, title:'Снять себя в кадре: вступление и объяснение методики Дорофеева' },
  { n:17, proj:IDS.p2, week:3,  min:60, title:'Смонтировать длинное видео о kaizen-steps: склейка, субтитры, переходы' },
  { n:18, proj:IDS.p2, week:3,  min:45, title:'Наложить скринкаст поверх монолога, выровнять звук в длинном видео' },
  { n:19, proj:IDS.p2, week:3,  min:45, title:'Нарезать 3 коротких клипа из длинного видео о kaizen-steps' },
  { n:20, proj:IDS.p2, week:3,  min:20, title:'Написать описание длинного видео с CTA: ссылка на исходник в Telegram' },
  { n:21, proj:IDS.p2, week:3,  min:30, title:'Выложить длинное на YouTube + 3 коротких на все платформы' },

  // ── Видео 2: напоминалка лекарств ──
  { n:22, proj:IDS.p2, week:3,  min:60, title:'Собрать приложение-напоминалку о лекарствах через вайбкодинг (Bolt/Cursor + GPT)' },
  { n:23, proj:IDS.p2, week:3,  min:45, title:'Написать сценарий видео о напоминалке: боль → сборка → демо → скачай' },
  { n:24, proj:IDS.p2, week:4,  min:60, title:'Снять и смонтировать длинное видео о напоминалке лекарств' },
  { n:25, proj:IDS.p2, week:4,  min:50, title:'Нарезать 3 коротких о напоминалке и выложить на всех платформах' },

  // ── Видео 3: домашка как игра ──
  { n:26, proj:IDS.p2, week:5,  min:60, title:'Собрать приложение-геймификатор домашнего задания через вайбкодинг' },
  { n:27, proj:IDS.p2, week:5,  min:45, title:'Написать сценарий видео о геймификации домашки' },
  { n:28, proj:IDS.p2, week:6,  min:90, title:'Снять, смонтировать длинное видео о геймификации + нарезать 3 коротких' },
  { n:29, proj:IDS.p2, week:6,  min:20, title:'Выложить длинное и короткие о геймификации + описание с CTA в Telegram' },

  // ── Видео 4: карточки по сериалу ──
  { n:30, proj:IDS.p2, week:7,  min:60, title:'Собрать приложение языковых карточек под конкретный сериал' },
  { n:31, proj:IDS.p2, week:7,  min:45, title:'Написать сценарий: «учу испанский через «Деньги Хайста»»' },
  { n:32, proj:IDS.p2, week:8,  min:90, title:'Снять, смонтировать длинное видео о карточках + нарезать 3 коротких' },
  { n:33, proj:IDS.p2, week:8,  min:20, title:'Выложить длинное + 3 коротких о карточках на все платформы' },

  // ── Видео 5: планировщик свиданий ──
  { n:34, proj:IDS.p2, week:9,  min:60, title:'Собрать приложение с идеями свиданий под бюджет через вайбкодинг' },
  { n:35, proj:IDS.p2, week:9,  min:45, title:'Написать сценарий: «не знаю куда пойти с женой» → решение за вечер' },
  { n:36, proj:IDS.p2, week:10, min:90, title:'Снять, смонтировать + нарезать 3 коротких о планировщике свиданий' },
  { n:37, proj:IDS.p2, week:10, min:20, title:'Выложить планировщик свиданий на всех платформах + описание' },

  // ── Видео 6: конспект-машина ──
  { n:38, proj:IDS.p2, week:11, min:60, title:'Собрать конспект-машину: загрузить лекцию → получить карточки (API + вайбкодинг)' },
  { n:39, proj:IDS.p2, week:11, min:45, title:'Написать сценарий видео о конспект-машине' },
  { n:40, proj:IDS.p2, week:12, min:90, title:'Снять, смонтировать длинное + нарезать 3 коротких о конспект-машине' },
  { n:41, proj:IDS.p2, week:12, min:20, title:'Выложить конспект-машину на всех платформах + описание с CTA' },

  // ── Телеграм и предзапись ──
  { n:42, proj:IDS.p3, week:2,  min:20, title:'Создать Telegram-канал, написать bio и описание' },
  { n:43, proj:IDS.p3, week:2,  min:45, title:'Написать и закрепить пост-знакомство: кто я, о чём канал, что получишь' },
  { n:44, proj:IDS.p3, week:2,  min:30, title:'Написать пост-лид-магнит: «Подпишись → получи исходник kaizen-steps»' },
  { n:45, proj:IDS.p3, week:2,  min:20, title:'Настроить ссылку на исходник kaizen-steps (GitHub Release или Google Drive)' },
  { n:46, proj:IDS.p3, week:3,  min:30, title:'Написать пост о мыслетопливе по Дорофееву: одна ключевая мысль' },
  { n:47, proj:IDS.p3, week:3,  min:20, title:'Сделать Google-форму предзаписи на будущий интенсив (3 вопроса)' },
  { n:48, proj:IDS.p3, week:3,  min:20, title:'Написать анонс-пост в Telegram: «Открыл список предзаписи» + ссылка на форму' },
  { n:49, proj:IDS.p3, week:4,  min:30, title:'Написать пост: «Как я перестал прокрастинировать — одна техника»' },
  { n:50, proj:IDS.p3, week:4,  min:15, title:'Написать пост-вопрос: «Какая ваша главная боль с продуктивностью?»' },
  { n:51, proj:IDS.p3, week:5,  min:20, title:'Написать пост: закулисье сборки приложения — 1 скриншот + 3 предложения' },
  { n:52, proj:IDS.p3, week:5,  min:15, title:'Написать тизер следующего видео + вопрос к аудитории в Telegram' },
  { n:53, proj:IDS.p3, week:6,  min:20, title:'Написать пост: «Почему выбрал именно эту боль для этого видео»' },
  { n:54, proj:IDS.p3, week:7,  min:30, title:'Написать мини-урок: «Как формулировать задачу по Дорофееву за 30 сек»' },
  { n:55, proj:IDS.p3, week:8,  min:15, title:'Запустить Telegram-опрос: «О какой боли снять следующее видео?»' },
  { n:56, proj:IDS.p3, week:9,  min:20, title:'Написать честную метрику-пост: подписчики, просмотры, выводы за 7 недель' },
  { n:57, proj:IDS.p3, week:10, min:25, title:'Написать пост-напоминание о предзаписи + новый лид-магнит (исходник видео 5)' },
  { n:58, proj:IDS.p3, week:12, min:30, title:'Написать итоговый пост: 3 вещи, которые понял за 12 недель ведения канала' },

  // ── Рост и аналитика ──
  { n:59, proj:IDS.p4, week:4,  min:20, title:'Открыть YouTube Studio и записать в таблицу: показы, CTR, просмотры видео 1–2' },
  { n:60, proj:IDS.p4, week:4,  min:20, title:'Прочитать первые 10 комментариев и ответить на каждый лично' },
  { n:61, proj:IDS.p4, week:6,  min:15, title:'Сравнить удержание видео 1 и 2 в YouTube Studio, записать вывод в 1 предложении' },
  { n:62, proj:IDS.p4, week:6,  min:20, title:'Придумать 3 альтернативных хука для следующего видео на основе данных' },
  { n:63, proj:IDS.p4, week:8,  min:20, title:'Открыть TikTok Analytics, записать топ-3 видео по охвату и найти общее' },
  { n:64, proj:IDS.p4, week:8,  min:30, title:'Ответить на все комментарии за последние 2 недели на всех платформах' },
  { n:65, proj:IDS.p4, week:10, min:20, title:'Записать 5 идей для новых видео из комментариев и вопросов в Telegram' },
  { n:66, proj:IDS.p4, week:12, min:45, title:'Написать итоговый отчёт: цифры, выводы, шаблон контент-завода на следующий квартал' },
  { n:67, proj:IDS.p4, week:12, min:30, title:'Пересмотреть структуру контент-завода и обновить шаблон для видео 7–12' },
]

// Первые задачи по каждому проекту — nextAction
const FIRST_NEXT: Record<string, number> = {
  [IDS.p1]: 1,
  [IDS.p2]: 12,
  [IDS.p3]: 42,
  [IDS.p4]: 59,
}

function toTask(s: SeedTask): Task {
  return {
    id:         tid(s.n),
    title:      s.title,
    projectId:  s.proj,
    goalId:     IDS.goal,
    status:     'todo',
    isToday:    false,
    timeSpent:  0,
    createdAt:  new Date(),
  }
}

// ─── Основная функция ─────────────────────────────────────────────────────────
export async function seedPlan(): Promise<{ goals: number; projects: number; tasks: number }> {
  // Проверяем, не засеяно ли уже
  const existing = await db.goals.get(IDS.goal)
  if (existing) {
    throw new Error('План уже загружен')
  }

  // Устанавливаем nextActionId для каждого проекта
  const projects = PROJECTS.map(p => ({
    ...p,
    nextActionId: tid(FIRST_NEXT[p.id]),
  }))

  const tasks = RAW.map(toTask)

  await db.transaction('rw', [db.goals, db.projects, db.tasks], async () => {
    await db.goals.add(GOAL)
    await db.projects.bulkAdd(projects)
    await db.tasks.bulkAdd(tasks)
  })

  return { goals: 1, projects: projects.length, tasks: tasks.length }
}

export async function isSeedLoaded(): Promise<boolean> {
  const g = await db.goals.get(IDS.goal)
  return Boolean(g)
}

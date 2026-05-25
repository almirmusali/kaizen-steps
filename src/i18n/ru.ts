export const ru = {
  // Навигация
  nav: {
    home:       'Главная',
    inbox:      'Входящие',
    projects:   'Проекты',
    goals:      'Цели',
    review:     'Обзор',
    journal:    'Журнал',
    aiSettings: 'AI-помощник',
  },

  // Главный экран
  home: {
    nextStep:       'Следующий шаг',
    noSteps:        'Нет задач на сегодня',
    todayList:      'Сегодня',
    addToDay:       'Добавить шаг на день',
    done:           'Готово',
    askAI:          'Спросить AI или написать задачу…',
    overload:       'Слишком много задач. Оставь 1–3 самых важных.',
    twoMinRule:     '< 2 минут — сделай сейчас',
  },

  // Инбокс
  inbox: {
    title:       'Входящие',
    placeholder: 'Мысль, идея, дело — сбрось сюда…',
    empty:       'Входящие пусты. Отличная работа.',
    processAll:  'Разобрать всё',
    process:     'Разобрать',
    deleteItem:  'Удалить',
    makeTask:    'Превратить в задачу',
    makeProject: 'Это проект',
    doNow:       'Сделать сейчас (< 2 мин)',
  },

  // Задачи
  tasks: {
    title:       'Задачи',
    noTasks:     'Нет задач',
    addTask:     'Добавить задачу',
    placeholder: 'Формулировка «делаю не думая»…',
    decompose:   'Раздробить',
    markDone:    'Отметить выполненной',
    scheduleDay: 'На сегодня',
    timeSpent:   'Потрачено',
    timer:       'Таймер',
    manualTime:  'Добавить время вручную',
  },

  // Проекты
  projects: {
    title:       'Проекты',
    noProjects:  'Нет проектов',
    addProject:  'Новый проект',
    nextAction:  'Следующее действие',
    noAction:    'Нет следующего действия — добавь шаг',
    totalTime:   'Всего времени',
    complete:    'Завершить проект',
  },

  // Цели
  goals: {
    title:       'Цели',
    noGoals:     'Нет целей',
    addGoal:     'Добавить цель',
    attention:   'Баланс внимания',
    notMoved:    'Давно не двигалась',
    overloaded:  'Перегружена',
  },

  // Обзор
  review: {
    daily:       'Ежедневный обзор',
    weekly:      'Еженедельная ретроспектива',
    progress:    'Прогресс за неделю',
    done:        'Что сделал сегодня?',
    blockers:    'Что мешало?',
    nextStep:    'Один маленький шаг завтра',
    save:        'Сохранить',
    stepsCount:  'шагов',
    timeSpent:   'времени',
  },

  // Журнал
  journal: {
    title:       'Дневник',
    placeholder: 'Инсайт, вывод, наблюдение о себе…',
    askAI:       'Попросить AI найти закономерности',
    add:         'Записать',
  },

  // Настройки AI
  aiSettings: {
    title:       'Настройки AI-помощника',
    goalsLabel:  'Мои цели (что важно для AI)',
    instruction: 'Инструкция для AI',
    rhythm:      'Мой ритм и ограничения',
    autonomy:    'Режим автономии',
    suggest:     'Предлагает — я подтверждаю',
    auto:        'Назначает сам',
    adaptive:    'Адаптивно',
    apiKeyHint:  'Добавь ANTHROPIC_API_KEY в .env для подключения AI',
    save:        'Сохранить настройки',
  },

  // Общее
  common: {
    save:    'Сохранить',
    cancel:  'Отмена',
    delete:  'Удалить',
    edit:    'Редактировать',
    confirm: 'Подтвердить',
    apply:   'Применить',
    skip:    'Пропустить',
    add:     'Добавить',
    back:    'Назад',
    theme:   'Тема',
    light:   'Светлая',
    dark:    'Тёмная',
    export:  'Экспорт данных',
    import:  'Импорт данных',
  },

  ai: {
    thinking:   'AI думает…',
    noKey:      'Подключи API-ключ в настройках AI',
    error:      'Ошибка AI',
    pending:    'Применить предложения AI?',
    applied:    'Применено',
    pendingActions: (n: number) => `${n} ${n === 1 ? 'действие' : 'действия'} ожидают подтверждения`,
  },
} as const

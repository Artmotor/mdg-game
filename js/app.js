// Состояние приложения
const state = {
    currentQuestion: 0,
    score: 0,
    timer: null,
    timeLeft: 15,
    userData: {
        name: 'Ветеринар',
        photo: 'images/icons/vet.png'
    },
    showPromoFrequency: 3 // Показывать рекламу курсов каждый 3-й вопрос
};

// Элементы DOM
const elements = {
    startScreen: document.getElementById('start-screen'),
    quizScreen: document.getElementById('quiz-screen'),
    resultScreen: document.getElementById('result-screen'),
    finalScreen: document.getElementById('final-screen'),
    rulesScreen: document.getElementById('rules-screen'),
    startBtn: document.getElementById('start-btn'),
    rulesBtn: document.getElementById('rules-btn'),
    backBtn: document.getElementById('back-btn'),
    nextBtn: document.getElementById('next-btn'),
    restartBtn: document.getElementById('restart-btn'),
    questionText: document.getElementById('question-text'),
    trueBtn: document.getElementById('true-btn'),
    falseBtn: document.getElementById('false-btn'),
    progressFill: document.getElementById('progress-fill'),
    progressText: document.getElementById('progress-text'),
    timerElement: document.getElementById('timer'),
    resultTitle: document.getElementById('result-title'),
    resultExplanation: document.getElementById('result-explanation'),
    finalScore: document.getElementById('final-score'),
    scoreMessage: document.getElementById('score-message'),
    achievements: document.getElementById('achievements'),
    userName: document.getElementById('user-name'),
    userPhoto: document.getElementById('user-photo'),
    coursePromoResult: document.getElementById('course-promo-result'),
    recommendedCourses: document.getElementById('recommended-courses')
};

// Инициализация приложения
function initApp() {
    // Запрашиваем имя игрока
    const playerName = localStorage.getItem('vet-quiz-name') || 'Ветеринар';
    const playerPhoto = localStorage.getItem('vet-quiz-photo') || 'images/icons/vet.png';
    
    state.userData.name = playerName;
    state.userData.photo = playerPhoto;
    updateUserInfo();
    
    // Назначаем обработчики событий
    elements.startBtn.addEventListener('click', startQuiz);
    elements.rulesBtn.addEventListener('click', showRules);
    elements.backBtn.addEventListener('click', hideRules);
    elements.nextBtn.addEventListener('click', nextQuestion);
    elements.restartBtn.addEventListener('click', restartQuiz);
    elements.trueBtn.addEventListener('click', () => checkAnswer(true));
    elements.falseBtn.addEventListener('click', () => checkAnswer(false));
    
    // Если есть сохраненная игра
    const savedGame = localStorage.getItem('vet-quiz-saved-game');
    if (savedGame) {
        const confirmRestore = confirm('Обнаружена сохраненная игра. Хотите продолжить?');
        if (confirmRestore) {
            const gameState = JSON.parse(savedGame);
            state.currentQuestion = gameState.currentQuestion;
            state.score = gameState.score;
            startQuiz();
        }
    }
}

// Обновление информации о пользователе
function updateUserInfo() {
    elements.userName.textContent = state.userData.name;
    elements.userPhoto.src = state.userData.photo;
}

// Начало викторины
function startQuiz() {
    showQuestion();
    elements.startScreen.style.display = 'none';
    elements.quizScreen.style.display = 'flex';
}

// Показать правила
function showRules() {
    elements.startScreen.style.display = 'none';
    elements.rulesScreen.style.display = 'flex';
}

// Скрыть правила
function hideRules() {
    elements.rulesScreen.style.display = 'none';
    elements.startScreen.style.display = 'flex';
}

// Показать вопрос
function showQuestion() {
    resetTimer();
    startTimer();
    
    const question = questions[state.currentQuestion];
    elements.questionText.textContent = question.text;
    elements.progressText.textContent = `${state.currentQuestion + 1}/${questions.length}`;
    elements.progressFill.style.width = `${(state.currentQuestion / questions.length) * 100}%`;
    
    // Сохраняем прогресс
    saveGameState();
}

// Запуск таймера
function startTimer() {
    state.timeLeft = 15;
    elements.timerElement.textContent = state.timeLeft;
    
    state.timer = setInterval(() => {
        state.timeLeft--;
        elements.timerElement.textContent = state.timeLeft;
        
        if (state.timeLeft <= 0) {
            clearInterval(state.timer);
            timeOut();
        }
    }, 1000);
}

// Сброс таймера
function resetTimer() {
    clearInterval(state.timer);
    state.timeLeft = 15;
    elements.timerElement.textContent = state.timeLeft;
}

// Время вышло
function timeOut() {
    const question = questions[state.currentQuestion];
    showResult(false, question);
}

// Проверка ответа
function checkAnswer(answer) {
    clearInterval(state.timer);
    
    const question = questions[state.currentQuestion];
    const isCorrect = answer === question.isTrue;
    
    if (isCorrect) {
        state.score++;
    }
    
    showResult(isCorrect, question);
}

// Показать результат
function showResult(isCorrect, question) {
    elements.quizScreen.style.display = 'none';
    elements.resultScreen.style.display = 'flex';
    
    elements.resultTitle.textContent = isCorrect ? '✅ Правильно!' : '❌ Неверно!';
    
    let explanation = `<p><strong>${isCorrect ? 'Вы правы!' : 'Правильный ответ:'} Это утверждение ${question.isTrue ? 'ВЕРНО' : 'НЕВЕРНО'}.</strong></p>`;
    explanation += `<p>${question.explanation}</p>`;
    
    if (question.tip) {
        explanation += `<div class="tip"><p>💡 <strong>Совет:</strong> ${question.tip}</p></div>`;
    }
    
    elements.resultExplanation.innerHTML = explanation;
    
    // Показываем рекламу курсов каждый N-й вопрос
    if ((state.currentQuestion + 1) % state.showPromoFrequency === 0) {
        elements.coursePromoResult.style.display = 'block';
    } else {
        elements.coursePromoResult.style.display = 'none';
    }
}

// Следующий вопрос
function nextQuestion() {
    state.currentQuestion++;
    
    if (state.currentQuestion < questions.length) {
        elements.resultScreen.style.display = 'none';
        elements.quizScreen.style.display = 'flex';
        showQuestion();
    } else {
        showFinalScreen();
    }
}

// Показать финальный экран
function showFinalScreen() {
    elements.resultScreen.style.display = 'none';
    elements.finalScreen.style.display = 'flex';
    
    elements.finalScore.textContent = state.score;
    
    // Определяем сообщение в зависимости от результата
    let message = '';
    if (state.score >= 18) {
        message = 'Отличный результат! Вы настоящий эксперт в своей области!';
    } else if (state.score >= 12) {
        message = 'Хороший результат! Наши курсы помогут вам углубить знания.';
    } else {
        message = 'Есть над чем поработать. Рекомендуем пройти обучение.';
    }
    elements.scoreMessage.textContent = message;
    
    // Показываем достижения
    showAchievements();
    
    // Рекомендуем курсы
    recommendCourses();
    
    // Очищаем сохраненную игру
    localStorage.removeItem('vet-quiz-saved-game');
}

// Показать достижения
function showAchievements() {
    elements.achievements.innerHTML = '';
    
    const achievements = [];
    
    if (state.score >= 18) {
        achievements.push({
            title: 'Эксперт по мелким животным',
            description: 'Вы показали отличные знания в ветеринарии',
            icon: 'trophy.png'
        });
    } else if (state.score >= 12) {
        achievements.push({
            title: 'Практикующий специалист',
            description: 'У вас хорошая база, но есть куда расти',
            icon: 'trophy.png'
        });
    } else {
        achievements.push({
            title: 'Начинающий ветеринар',
            description: 'Рекомендуем пройти обучение для повышения квалификации',
            icon: 'trophy.png'
        });
    }
    
    // Добавляем достижения в DOM
    achievements.forEach(achievement => {
        const achievementElement = document.createElement('div');
        achievementElement.className = 'achievement';
        achievementElement.innerHTML = `
            <img src="images/icons/${achievement.icon}" alt="Значок">
            <div>
                <strong>${achievement.title}</strong>
                <p>${achievement.description}</p>
            </div>
        `;
        elements.achievements.appendChild(achievementElement);
    });
}

// Рекомендовать курсы
function recommendCourses() {
    elements.recommendedCourses.innerHTML = '';
    
    const courses = [
        {
            title: 'Современные аспекты пульмонологии в практике ветеринарного врача',
            description: 'Диагностика и лечение заболеваний дыхательной системы',
            url: 'https://dpo.v-gau.ru/programs/pulmonology'
        },
        {
            title: 'Сердечно-легочная реанимация',
            description: 'Современные протоколы СЛР для мелких животных',
            url: 'https://dpo.v-gau.ru/programs/cardiopulmonary-resuscitation'
        }
    ];
    
    // Добавляем дополнительные курсы в зависимости от результатов
    if (state.score < 12) {
        courses.push({
            title: 'Реконструктивная хирургия собак и кошек',
            description: 'Методы реконструкции для закрытия сложных дефектов кожи и тканей у собак и кошек',
            url: 'https://dpo.v-gau.ru/programs/reconstructive-surgery'
        });
    }
    
    if (state.score >= 15) {
        courses.push({
            title: 'Школа ветеринарной стоматологии',
            description: 'Продвинутые техники в стоматологии и хирургии',
            url: 'https://dpo.v-gau.ru/programs/veterinary-dentistry'
        });
    }
    
    // Добавляем курсы в DOM
    courses.forEach(course => {
        const courseElement = document.createElement('div');
        courseElement.className = 'course-card';
        courseElement.innerHTML = `
            <h4>${course.title}</h4>
            <p>${course.description}</p>
        `;
        elements.recommendedCourses.appendChild(courseElement);
    });
}

// Перезапуск викторины
function restartQuiz() {
    state.currentQuestion = 0;
    state.score = 0;
    elements.finalScreen.style.display = 'none';
    startQuiz();
}

// Сохранить состояние игры
function saveGameState() {
    const gameState = {
        currentQuestion: state.currentQuestion,
        score: state.score
    };
    localStorage.setItem('vet-quiz-saved-game', JSON.stringify(gameState));
}

// Инициализация приложения при загрузке
document.addEventListener('DOMContentLoaded', initApp);
var translations = {
    vi: {
        title: 'Pomodoro Timer',
        subtitle: 'Tập trung & Học tập Hiệu quả',
        studyTime: 'Thời gian học',
        breakTime: 'Thời gian nghỉ',
        completedToday: 'Hôm nay đã hoàn thành',
        stats: 'Thống kê học tập',
        today: 'Hôm nay',
        history: 'Lịch sử học tập',
        days: 'ngày',
        noData: 'Chưa có dữ liệu học tập',
        clearHistory: 'Xóa toàn bộ lịch sử',
        confirmClear: 'Bạn có chắc muốn xóa toàn bộ lịch sử?',
        view: 'Xem chi tiết',
        namePh: 'Đặt tên cho phiên học này...',
        tip: '💡 Tip: Hãy tập trung cao độ trong thời gian học và nghỉ ngơi đầy đủ!',
        total: 'Số Pomodoro',
        time: 'Tổng thời gian',
        min: 'phút',
        study: 'Study (phút)',
        break: 'Break (phút)'
    },
    en: {
        title: 'Pomodoro Timer',
        subtitle: 'Focus & Study Efficiently',
        studyTime: 'Study Time',
        breakTime: 'Break Time',
        completedToday: 'Completed Today',
        stats: 'Study Statistics',
        today: 'Today',
        history: 'Study History',
        days: 'days',
        noData: 'No study data yet',
        clearHistory: 'Clear All History',
        confirmClear: 'Are you sure you want to clear all history?',
        view: 'View Details',
        namePh: 'Name this study session...',
        tip: '💡 Tip: Stay focused during study time and take proper breaks!',
        total: 'Pomodoros',
        time: 'Total Time',
        min: 'minutes',
        study: 'Study (minutes)',
        break: 'Break (minutes)'
    }
};

var state = {
    mode: '25/5',
    customStudy: 25,
    customBreak: 5,
    isStudying: true,
    timeLeft: 1500,
    isRunning: false,
    isDarkMode: false,
    history: [],
    language: 'vi',
    timerInterval: null
};

function init() {
    loadData();
    updateLanguageUI();
    applyTheme();
    updateUI();
    attachEventListeners();
}

function loadData() {
    try {
        var savedHistory = localStorage.getItem('pomodoroHistory');
        var savedDarkMode = localStorage.getItem('darkMode');
        var savedLanguage = localStorage.getItem('language');
        
        if (savedHistory) {
            state.history = JSON.parse(savedHistory);
        }
        if (savedDarkMode) {
            state.isDarkMode = savedDarkMode === 'true';
        }
        if (savedLanguage) {
            state.language = savedLanguage;
        }
    } catch (e) {
        console.error('Error loading data:', e);
    }
}

function saveData() {
    try {
        localStorage.setItem('pomodoroHistory', JSON.stringify(state.history));
        localStorage.setItem('darkMode', state.isDarkMode.toString());
        localStorage.setItem('language', state.language);
    } catch (e) {
        console.error('Error saving data:', e);
    }
}

function attachEventListeners() {
    document.getElementById('btnLang').addEventListener('click', toggleLanguage);
    document.getElementById('btnStats').addEventListener('click', toggleStats);
    document.getElementById('btnDark').addEventListener('click', toggleDarkMode);
    document.getElementById('btnFs').addEventListener('click', toggleFullscreen);
    document.getElementById('btn25').addEventListener('click', function() { setMode('25/5'); });
    document.getElementById('btn50').addEventListener('click', function() { setMode('50/10'); });
    document.getElementById('btnCustom').addEventListener('click', function() { setMode('custom'); });
    document.getElementById('customStudy').addEventListener('change', updateCustomTime);
    document.getElementById('customBreak').addEventListener('change', updateCustomTime);
    document.getElementById('playBtn').addEventListener('click', toggleTimer);
    document.getElementById('resetBtn').addEventListener('click', resetTimer);
    document.getElementById('btnView').addEventListener('click', toggleStats);
    document.getElementById('btnClose').addEventListener('click', toggleStats);
    document.getElementById('btnClear').addEventListener('click', clearHistory);
}

function getCurrentMode() {
    if (state.mode === 'custom') {
        return { study: state.customStudy, break: state.customBreak };
    }
    if (state.mode === '25/5') {
        return { study: 25, break: 5 };
    }
    return { study: 50, break: 10 };
}

function formatTime(seconds) {
    var minutes = Math.floor(seconds / 60);
    var secs = seconds % 60;
    var minStr = minutes < 10 ? '0' + minutes : minutes.toString();
    var secStr = secs < 10 ? '0' + secs : secs.toString();
    return minStr + ':' + secStr;
}

function getTodayPomodoros() {
    var today = new Date().toDateString();
    return state.history.filter(function(p) {
        return new Date(p.date).toDateString() === today;
    });
}

function getTodayMinutes() {
    var todayPomodoros = getTodayPomodoros();
    return todayPomodoros.reduce(function(sum, p) {
        return sum + p.duration;
    }, 0);
}

function getStudyDays() {
    var uniqueDays = {};
    state.history.forEach(function(p) {
        var dateStr = new Date(p.date).toDateString();
        uniqueDays[dateStr] = true;
    });
    var days = Object.keys(uniqueDays);
    days.sort(function(a, b) {
        return new Date(b) - new Date(a);
    });
    return days;
}

function getPomodorosByDate(dateString) {
    return state.history.filter(function(p) {
        return new Date(p.date).toDateString() === dateString;
    });
}

function toggleTimer() {
    state.isRunning = !state.isRunning;
    
    if (state.isRunning) {
        state.timerInterval = setInterval(function() {
            if (state.timeLeft > 0) {
                state.timeLeft--;
                updateUI();
            } else {
                handleTimerComplete();
            }
        }, 1000);
    } else {
        if (state.timerInterval) {
            clearInterval(state.timerInterval);
        }
    }
    
    updateUI();
}

function handleTimerComplete() {
    try {
        document.getElementById('sound').play();
    } catch (e) {
        console.log('Could not play sound');
    }
    
    if (state.isStudying) {
        var nameInput = document.getElementById('pomodoroName');
        var sessionName = nameInput.value || 'Unnamed Session';
        
        var newPomodoro = {
            id: Date.now(),
            name: sessionName,
            date: new Date().toISOString(),
            duration: getCurrentMode().study,
            mode: state.mode
        };
        
        state.history.push(newPomodoro);
        saveData();
        nameInput.value = '';
    }
    
    state.isStudying = !state.isStudying;
    state.isRunning = false;
    
    if (state.timerInterval) {
        clearInterval(state.timerInterval);
    }
    
    var mode = getCurrentMode();
    state.timeLeft = (state.isStudying ? mode.study : mode.break) * 60;
    
    updateUI();
}

function resetTimer() {
    state.isRunning = false;
    
    if (state.timerInterval) {
        clearInterval(state.timerInterval);
    }
    
    var mode = getCurrentMode();
    state.timeLeft = (state.isStudying ? mode.study : mode.break) * 60;
    
    updateUI();
}

function setMode(newMode) {
    state.mode = newMode;
    state.isRunning = false;
    
    if (state.timerInterval) {
        clearInterval(state.timerInterval);
    }
    
    state.isStudying = true;
    
    var mode = getCurrentMode();
    state.timeLeft = mode.study * 60;
    
    document.getElementById('btn25').classList.remove('active');
    document.getElementById('btn50').classList.remove('active');
    document.getElementById('btnCustom').classList.remove('active');
    
    if (newMode === '25/5') {
        document.getElementById('btn25').classList.add('active');
    } else if (newMode === '50/10') {
        document.getElementById('btn50').classList.add('active');
    } else {
        document.getElementById('btnCustom').classList.add('active');
    }
    
    var customInputs = document.getElementById('customInputs');
    if (newMode === 'custom') {
        customInputs.classList.remove('hidden');
    } else {
        customInputs.classList.add('hidden');
    }
    
    updateUI();
}

function updateCustomTime() {
    var studyInput = document.getElementById('customStudy');
    var breakInput = document.getElementById('customBreak');
    
    state.customStudy = parseInt(studyInput.value) || 25;
    state.customBreak = parseInt(breakInput.value) || 5;
    
    if (state.mode === 'custom' && !state.isRunning) {
        var mode = getCurrentMode();
        state.timeLeft = (state.isStudying ? mode.study : mode.break) * 60;
        updateUI();
    }
}

function toggleDarkMode() {
    state.isDarkMode = !state.isDarkMode;
    saveData();
    applyTheme();
    updateUI();
}

function applyTheme() {
    var body = document.body;
    var darkIcon = document.getElementById('darkIcon');
    
    if (state.isDarkMode) {
        body.classList.add('dark');
        darkIcon.textContent = '☀️';
    } else {
        body.classList.remove('dark');
        darkIcon.textContent = '🌙';
    }
}

function toggleLanguage() {
    state.language = state.language === 'vi' ? 'en' : 'vi';
    saveData();
    updateLanguageUI();
    updateUI();
}

function updateLanguageUI() {
    var t = translations[state.language];
    
    document.getElementById('mainTitle').textContent = t.title;
    document.getElementById('mainSubtitle').textContent = t.subtitle;
    document.getElementById('completedText').textContent = t.completedToday;
    document.getElementById('viewText').textContent = t.view;
    document.getElementById('tipText').textContent = t.tip;
    document.getElementById('statsTitle').textContent = '📊 ' + t.stats;
    document.getElementById('todayTitle').textContent = '📅 ' + t.today;
    document.getElementById('totalLabel').textContent = t.total;
    document.getElementById('timeLabel').textContent = t.time;
    document.getElementById('minsText').textContent = t.min;
    document.getElementById('historyTitle').textContent = '📆 ' + t.history;
    document.getElementById('noData').textContent = t.noData;
    document.getElementById('clearText').textContent = t.clearHistory;
    document.getElementById('studyLabel').textContent = t.study;
    document.getElementById('breakLabel').textContent = t.break;
    document.getElementById('pomodoroName').placeholder = t.namePh;
}

function toggleStats() {
    var timerView = document.getElementById('timerView');
    var statsView = document.getElementById('statsView');
    
    timerView.classList.toggle('hide');
    statsView.classList.toggle('show');
    
    if (statsView.classList.contains('show')) {
        renderStats();
    }
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
}

function clearHistory() {
    var t = translations[state.language];
    if (confirm(t.confirmClear)) {
        state.history = [];
        saveData();
        renderStats();
        updateUI();
    }
}

function updateUI() {
    document.getElementById('timeDisplay').textContent = formatTime(state.timeLeft);
    
    var t = translations[state.language];
    var statusText = document.getElementById('statusText');
    var statusBadge = document.getElementById('statusBadge');
    
    statusText.textContent = state.isStudying ? t.studyTime : t.breakTime;
    
    if (state.isStudying) {
        statusBadge.className = 'status-badge study';
    } else {
        statusBadge.className = 'status-badge break';
    }
    
    var mode = getCurrentMode();
    var total = (state.isStudying ? mode.study : mode.break) * 60;
    var progress = ((total - state.timeLeft) / total) * 100;
    var circumference = 2 * Math.PI * 120;
    var offset = circumference * (1 - progress / 100);
    
    var progressCircle = document.getElementById('progressCircle');
    progressCircle.style.strokeDashoffset = offset;
    
    if (state.isStudying) {
        progressCircle.classList.remove('break');
    } else {
        progressCircle.classList.add('break');
    }
    
    var playBtn = document.getElementById('playBtn');
    playBtn.textContent = state.isRunning ? '⏸️' : '▶️';
    
    var todayCount = getTodayPomodoros().length;
    document.getElementById('todayCount').textContent = todayCount;
    
    var nameInput = document.getElementById('pomodoroName');
    document.getElementById('sessionName').textContent = nameInput.value;
    
    var body = document.body;
    if (!state.isStudying && !state.isDarkMode) {
        body.classList.add('break-mode');
    } else {
        body.classList.remove('break-mode');
    }
}

function renderStats() {
    var todayPomodoros = getTodayPomodoros();
    var todayMinutes = getTodayMinutes();
    
    document.getElementById('statsTodayCount').textContent = todayPomodoros.length;
    document.getElementById('statsTodayMins').textContent = todayMinutes;
    
    var studyDays = getStudyDays();
    var historyList = document.getElementById('historyList');
    historyList.innerHTML = '';
    
    var noData = document.getElementById('noData');
    var btnClear = document.getElementById('btnClear');
    
    if (studyDays.length === 0) {
        noData.style.display = 'block';
        btnClear.classList.add('hidden');
        return;
    }
    
    noData.style.display = 'none';
    btnClear.classList.remove('hidden');
    
    var t = translations[state.language];
    var locale = state.language === 'vi' ? 'vi-VN' : 'en-US';
    
    studyDays.forEach(function(day) {
        var pomodoros = getPomodorosByDate(day);
        var totalMinutes = pomodoros.reduce(function(sum, p) {
            return sum + p.duration;
        }, 0);
        
        var dayGroup = document.createElement('div');
        dayGroup.className = 'day-group';
        
        var date = new Date(day);
        var dateStr = date.toLocaleDateString(locale, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        var dayHeader = document.createElement('div');
        dayHeader.className = 'day-header';
        dayHeader.innerHTML = '<span class="date">' + dateStr + '</span>' +
                             '<span class="summary">' + pomodoros.length + ' pomodoros • ' + 
                             totalMinutes + ' ' + t.min + '</span>';
        
        dayGroup.appendChild(dayHeader);
        
        pomodoros.forEach(function(p) {
            var sessionItem = document.createElement('div');
            sessionItem.className = 'session-item';
            sessionItem.innerHTML = '<div class="session-name-item">' +
                                   '<span>✅</span>' +
                                   '<span>' + p.name + '</span>' +
                                   '</div>' +
                                   '<div class="session-duration">' + 
                                   p.duration + ' ' + t.min + '</div>';
            dayGroup.appendChild(sessionItem);
        });
        
        historyList.appendChild(dayGroup);
    });
}

window.addEventListener('load', init);

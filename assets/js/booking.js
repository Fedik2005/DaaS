// assets/js/booking.js
console.log("Booking.js loaded!");

let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

// ===== СИСТЕМА ВКЛАДОК =====
function openTab(tabName) {
    const tabContents = document.getElementsByClassName('tab-content');
    for (let i = 0; i < tabContents.length; i++) {
        tabContents[i].classList.remove('active');
    }

    const tabButtons = document.getElementsByClassName('tab-button');
    for (let i = 0; i < tabButtons.length; i++) {
        tabButtons[i].classList.remove('active');
    }

    document.getElementById(tabName).classList.add('active');
    event.currentTarget.classList.add('active');

    if (tabName === 'calendar') {
        loadCalendar();
        loadCalendarStats();
    } else if (tabName === 'catalog') {
        loadDevices();
    }
}

// ===== КАТАЛОГ УСТРОЙСТВ =====
function loadDevices() {
    const db = firebase.firestore();
    
    db.collection("drones").get().then((querySnapshot) => {
        const devicesContainer = document.getElementById('devicesContainer');
        devicesContainer.innerHTML = '';
        
        if (querySnapshot.empty) {
            devicesContainer.innerHTML = '<p>Дроны не найдены</p>';
            return;
        }
        
        querySnapshot.forEach((doc) => {
            const device = doc.data();
            
            // Создаем красивую карточку
            const deviceCard = `
                <div class="device-card">
                    <div class="device-image-container">
                        <img src="${device.image}" alt="${device.name}" class="device-image">
                    </div>
                    <div class="device-info">
                        <h3>${device.name}</h3>
                        <p class="device-description">${device.description}</p>
                        
                        <!-- Features без галочек, обычным текстом -->
                        <div class="device-features">
                            <h4>Характеристики:</h4>
                            <p class="features-text">${device.features}</p>
                        </div>
                        
                        <button onclick="bookDevice('${doc.id}')" class="book-button">
                            ${device.isAvailable ? '🛸 Забронировать дрон' : '❌ Недоступно'}
                        </button>
                    </div>
                </div>
            `;
            devicesContainer.innerHTML += deviceCard;
        });
    }).catch((error) => {
        console.error("Error loading drones:", error);
        document.getElementById('devicesContainer').innerHTML = '<p>Ошибка загрузки дронов</p>';
    });
}

// Функция преобразования времени в минуты
function timeToMinutes(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
}

// Функция преобразования минут в время
function minutesToTime(totalMinutes) {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

// Функция проверки валидности даты
function isValidDate(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Проверяем что дата корректна и не в прошлом
    return date instanceof Date && !isNaN(date) && date >= today;
}

// Функция проверки валидности времени
function isValidTime(timeString) {
    const timeRegex = /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/;
    if (!timeRegex.test(timeString)) return false;
    
    const [hours, minutes] = timeString.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes;
    
    // Время должно быть между 08:00 и 18:00
    return totalMinutes >= 8 * 60 && totalMinutes <= 18 * 60;
}

// Функция получения максимальной доступной даты (текущий год + 1)
function getMaxAvailableDate() {
    const now = new Date();
    const maxDate = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
    return maxDate.toISOString().split('T')[0];
}

// ОСНОВНАЯ ФУНКЦИЯ БРОНИРОВАНИЯ
function bookDevice(deviceId) {
    const db = firebase.firestore();
    
    db.collection("drones").doc(deviceId).get().then((doc) => {
        const device = doc.data();
        
        if (!device.isAvailable) {
            alert('❌ Этот дрон временно недоступен для бронирования');
            return;
        }
        
        const today = new Date().toISOString().split('T')[0];
        const maxDate = getMaxAvailableDate();
        
        const bookingDate = prompt(`Введите дату бронирования (ГГГГ-ММ-ДД):\n• Сегодня: ${today}\n• Бронирование доступно на 1 год вперед`, today);
        
        if (!bookingDate) return;
        
        // ПРОВЕРКА ДАТЫ
        if (!isValidDate(bookingDate)) {
            alert('❌ Неверная дата! Дата должна быть корректной, не из прошлого и не дальше 1 года.');
            return;
        }
        
        const bookingTime = prompt("Введите время начала (ЧЧ:ММ):\n• Доступное время: с 08:00 до 18:00", "10:00");
        
        if (!bookingTime) return;
        
        // ПРОВЕРКА ВРЕМЕНИ
        if (!isValidTime(bookingTime)) {
            alert('❌ Неверное время! Бронирование доступно только с 08:00 до 18:00.');
            return;
        }
        
        const address = prompt("Адрес объекта для съёмки:", "Москва, ул. Примерная, 123");
        const projectType = prompt("Тип проекта:", "Топографическая съёмка");
        
        if (bookingDate && bookingTime && address && projectType) {
            // ДЛЯ ДРОНОВ СТАНДАРТНАЯ ПРОДОЛЖИТЕЛЬНОСТЬ 4 ЧАСА
            const durationHours = 4;
            const endTime = minutesToTime(timeToMinutes(bookingTime) + (durationHours * 60));
            
            // ПРОВЕРКА ЧТО БРОНИРОВАНИЕ НЕ ВЫХОДИТ ЗА 18:00
            if (timeToMinutes(endTime) > 18 * 60) {
                alert('❌ Бронирование выходит за пределы рабочего времени! Последнее доступное время для начала: 14:00 (чтобы закончить к 18:00).');
                return;
            }
            
            // ПРОВЕРЯЕМ НАЛИЧИЕ КОНФЛИКТУЮЩИХ БРОНИРОВАНИЙ
            checkBookingConflict(deviceId, bookingDate, bookingTime, durationHours)
                .then((hasConflict) => {
                    if (hasConflict) {
                        alert('❌ Дрон занят в выбранное время! Съёмка дрона занимает 4 часа. Выберите другое время или дату.');
                    } else {
                        // СОЗДАЕМ БРОНИРОВАНИЕ
                        createBooking(deviceId, device.name, bookingDate, bookingTime, durationHours, address, projectType, device.price || 0);
                    }
                })
                .catch((error) => {
                    console.error("Ошибка при проверке бронирования:", error);
                    alert('❌ Произошла ошибка при проверке доступности дрона');
                });
        }
    });
}

// Функция проверки конфликтов бронирований С ФИКСИРОВАННОЙ ПРОДОЛЖИТЕЛЬНОСТЬЮ
function checkBookingConflict(deviceId, date, startTime, durationHours) {
    const db = firebase.firestore();
    
    console.log("🔍 Проверяем конфликт для:", { deviceId, date, startTime, durationHours });
    
    // Получаем ВСЕ бронирования этого дрона на выбранную дату
    return db.collection("bookings")
        .where("deviceId", "==", deviceId)
        .where("date", "==", date)
        .get()
        .then((querySnapshot) => {
            console.log("📊 Найдено броней на эту дату:", querySnapshot.size);
            
            const newBookingStart = timeToMinutes(startTime);
            const newBookingEnd = newBookingStart + (durationHours * 60);
            
            let hasConflict = false;
            
            querySnapshot.forEach((doc) => {
                const existingBooking = doc.data();
                
                // ДЛЯ ВСЕХ БРОНЕЙ ИСПОЛЬЗУЕМ ФИКСИРОВАННУЮ ПРОДОЛЖИТЕЛЬНОСТЬ 4 ЧАСА
                const existingDuration = 4;
                const existingStart = timeToMinutes(existingBooking.time);
                const existingEnd = existingStart + (existingDuration * 60);
                
                console.log("Существующая бронь:", {
                    time: existingBooking.time,
                    start: existingStart,
                    end: existingEnd,
                    duration: existingDuration
                });
                
                console.log("Новая бронь:", {
                    time: startTime,
                    start: newBookingStart,
                    end: newBookingEnd,
                    duration: durationHours
                });
                
                // ПРОВЕРЯЕМ ПЕРЕСЕЧЕНИЕ ИНТЕРВАЛОВ
                const timeConflict = (
                    (newBookingStart >= existingStart && newBookingStart < existingEnd) ||
                    (newBookingEnd > existingStart && newBookingEnd <= existingEnd) ||
                    (newBookingStart <= existingStart && newBookingEnd >= existingEnd)
                );
                
                if (timeConflict) {
                    hasConflict = true;
                    console.log("❌ КОНФЛИКТ обнаружен! Интервалы пересекаются");
                }
            });
            
            console.log("Результат проверки конфликтов:", hasConflict);
            return hasConflict;
        });
}

// Функция создания бронирования
function createBooking(deviceId, deviceName, date, time, duration, address, projectType, price) {
    const db = firebase.firestore();
    
    const endTime = minutesToTime(timeToMinutes(time) + (duration * 60));
    
    db.collection("bookings").add({
        deviceId: deviceId,
        deviceName: deviceName,
        date: date,
        time: time,
        endTime: endTime,
        duration: duration,
        address: address,
        projectType: projectType,
        price: price,
        createdAt: new Date(),
        bookingId: generateBookingId()
    }).then(() => {
        alert(`✅ Дрон "${deviceName}" забронирован!\n📅 Дата: ${date}\n⏰ Время: ${time}-${endTime} (${duration} часов)\n📍 Объект: ${address}\n🎯 Проект: ${projectType}`);
        
        if (document.getElementById('calendar').classList.contains('active')) {
            loadCalendar();
            loadCalendarStats();
        }
    }).catch((error) => {
        console.error("Ошибка при создании бронирования:", error);
        alert('❌ Произошла ошибка при бронировании дрона');
    });
}

// Генерация уникального ID брони
function generateBookingId() {
    return 'BK' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
}

// ===== КАЛЕНДАРЬ =====
function loadCalendar() {
    const monthNames = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
    const calendarElement = document.getElementById('monthCalendar');
    
    calendarElement.innerHTML = `
        <div class="calendar-header">
            <h2>${monthNames[currentMonth]} ${currentYear}</h2>
            <div class="calendar-nav">
                <button onclick="changeMonth(-1)">← Пред</button>
                <button onclick="changeMonth(1)">След →</button>
            </div>
        </div>
        <div class="calendar-grid" id="calendarGrid">
            <!-- Дни недели -->
            <div class="calendar-day-header">Пн</div>
            <div class="calendar-day-header">Вт</div>
            <div class="calendar-day-header">Ср</div>
            <div class="calendar-day-header">Чт</div>
            <div class="calendar-day-header">Пт</div>
            <div class="calendar-day-header">Сб</div>
            <div class="calendar-day-header">Вс</div>
        </div>
    `;
    
    generateCalendarDays();
    loadBookingsForCalendar();
}

function generateCalendarDays() {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    
    const calendarGrid = document.getElementById('calendarGrid');
    
    // Пустые ячейки перед первым днем
    for (let i = 0; i < startingDay; i++) {
        calendarGrid.innerHTML += `<div class="calendar-day empty"></div>`;
    }
    
    // Дни месяца
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const isToday = today.getDate() === day && today.getMonth() === currentMonth && today.getFullYear() === currentYear;
        
        calendarGrid.innerHTML += `
            <div class="calendar-day ${isToday ? 'today' : ''}" onclick="showDayDetails('${dateStr}')">
                <div class="day-number">${day}</div>
                <div class="booking-badge" id="badge-${dateStr}" style="display: none;">0</div>
            </div>
        `;
    }
}

function changeMonth(direction) {
    currentMonth += direction;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    } else if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    loadCalendar();
    loadCalendarStats();
}

function loadBookingsForCalendar() {
    const db = firebase.firestore();
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    
    db.collection("bookings")
        .where("date", ">=", firstDay.toISOString().split('T')[0])
        .where("date", "<=", lastDay.toISOString().split('T')[0])
        .get().then((querySnapshot) => {
            
        const bookingsByDate = {};
        querySnapshot.forEach((doc) => {
            const booking = doc.data();
            if (!bookingsByDate[booking.date]) {
                bookingsByDate[booking.date] = 0;
            }
            bookingsByDate[booking.date]++;
        });
        
        // Обновляем бейджики
        for (const [date, count] of Object.entries(bookingsByDate)) {
            const badge = document.getElementById(`badge-${date}`);
            if (badge) {
                badge.style.display = 'block';
                badge.textContent = count;
                
                // Добавляем класс дням с бронированиями
                const dayElement = badge.parentElement;
                dayElement.classList.add('has-bookings');
            }
        }
    });
}

function showDayDetails(date) {
    const db = firebase.firestore();
    
    db.collection("bookings").where("date", "==", date).get().then((querySnapshot) => {
        const dayDetails = document.getElementById('dayDetails');
        const dateObj = new Date(date);
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        
        dayDetails.innerHTML = `<h3>📅 Бронирования на ${dateObj.toLocaleDateString('ru-RU', options)}</h3>`;
        
        if (querySnapshot.empty) {
            dayDetails.innerHTML += '<p>На этот день бронирований нет</p>';
            return;
        }
        
        let bookingsHTML = '<div class="bookings-list">';
        querySnapshot.forEach((doc) => {
            const booking = doc.data();
            // ДЛЯ ВСЕХ БРОНЕЙ ИСПОЛЬЗУЕМ ФИКСИРОВАННУЮ ПРОДОЛЖИТЕЛЬНОСТЬ 4 ЧАСА
            const duration = 4;
            const endTime = minutesToTime(timeToMinutes(booking.time) + (duration * 60));
            
            bookingsHTML += `
                <div class="booking-item">
                    <strong>${booking.deviceName}</strong><br>
                    <span>⏰ ${booking.time} - ${endTime} (${duration}ч)</span><br>
                    <span>📍 ${booking.address}</span><br>
                    <span>🎯 ${booking.projectType || 'Не указан'}</span>
                </div>
            `;
        });
        bookingsHTML += '</div>';
        dayDetails.innerHTML += bookingsHTML;
    });
}

function loadCalendarStats() {
    const today = new Date().toISOString().split('T')[0];
    const db = firebase.firestore();
    
    // Статистика за сегодня
    db.collection("bookings").where("date", "==", today).get().then((querySnapshot) => {
        document.getElementById('todayBookings').textContent = querySnapshot.size;
        
        let totalRevenue = 0;
        querySnapshot.forEach((doc) => {
            totalRevenue += doc.data().price || 0;
        });
        document.getElementById('todayRevenue').textContent = totalRevenue + ' ₽';
    });
    
    // Занятые устройства сегодня
    db.collection("bookings").where("date", "==", today).get().then((querySnapshot) => {
        const busyDeviceIds = new Set();
        querySnapshot.forEach((doc) => {
            busyDeviceIds.add(doc.data().deviceId);
        });
        document.getElementById('busyDevices').textContent = busyDeviceIds.size;
    });
}

// ===== ТЕХПОДДЕРЖКА =====
function callSupport() {
    alert("📞 Звонок на номер: +7 (999) 123-45-67");
}

function sendEmail() {
    window.location.href = "mailto:support@daas.ru?subject=Поддержка DaaS&body=Здравствуйте! У меня вопрос по поводу...";
}

// Загружаем устройства при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    loadDevices();
});

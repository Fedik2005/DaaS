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

function bookDevice(deviceId) {
    const db = firebase.firestore();
    
    db.collection("drones").doc(deviceId).get().then((doc) => {
        const device = doc.data();
        
        if (!device.isAvailable) {
            alert('❌ Этот дрон временно недоступен для бронирования');
            return;
        }
        
        const bookingDate = prompt("Введите дату бронирования (ГГГГ-ММ-ДД):", new Date().toISOString().split('T')[0]);
        const bookingTime = prompt("Введите время бронирования (ЧЧ:ММ):", "10:00");
        const address = prompt("Адрес объекта для съёмки:", "Москва, ул. Примерная, 123");
        const projectType = prompt("Тип проекта:", "Топографическая съёмка");
        
        if (bookingDate && bookingTime && address && projectType) {
            db.collection("bookings").add({
                deviceId: deviceId,
                deviceName: device.name,
                date: bookingDate,
                time: bookingTime,
                address: address,
                projectType: projectType,
                price: device.price || 0,
                status: "active",
                createdAt: new Date()
            }).then(() => {
                alert(`✅ Дрон "${device.name}" забронирован!\n📅 Дата: ${bookingDate}\n⏰ Время: ${bookingTime}\n📍 Объект: ${address}\n Проект: ${projectType}`);
                
                if (document.getElementById('calendar').classList.contains('active')) {
                    loadCalendar();
                    loadCalendarStats();
                }
            });
        }
    });
}

// Функция для красивого форматирования features
function formatFeatures(featuresText) {
    if (!featuresText) return '';
    
    // Разделяем features по символу + и создаем список
    const featuresArray = featuresText.split('+').filter(f => f.trim() !== '');
    
    if (featuresArray.length === 0) return '';
    
    let featuresHTML = '<div class="features-list">';
    featuresArray.forEach(feature => {
        featuresHTML += `<div class="feature-item">✅ ${feature.trim()}</div>`;
    });
    featuresHTML += '</div>';
    
    return featuresHTML;
}

function bookDevice(deviceId) {
    const db = firebase.firestore();
    
    db.collection("drones").doc(deviceId).get().then((doc) => {
        const device = doc.data();
        
        if (!device.isAvailable) {
            alert('❌ Этот дрон временно недоступен для бронирования');
            return;
        }
        
        const bookingDate = prompt("Введите дату бронирования (ГГГГ-ММ-ДД):", new Date().toISOString().split('T')[0]);
        const bookingTime = prompt("Введите время бронирования (ЧЧ:ММ):", "10:00");
        const address = prompt("Адрес объекта для съёмки:", "Москва, ул. Примерная, 123");
        const projectType = prompt("Тип проекта:", "Топографическая съёмка");
        
        if (bookingDate && bookingTime && address && projectType) {
            db.collection("bookings").add({
                deviceId: deviceId,
                deviceName: device.name,
                date: bookingDate,
                time: bookingTime,
                address: address,
                projectType: projectType,
                price: device.price || 0,
                status: "active",
                createdAt: new Date()
            }).then(() => {
                alert(`✅ Дрон "${device.name}" забронирован!\n📅 Дата: ${bookingDate}\n⏰ Время: ${bookingTime}\n📍 Объект: ${address}\n🎯 Проект: ${projectType}`);
                
                if (document.getElementById('calendar').classList.contains('active')) {
                    loadCalendar();
                    loadCalendarStats();
                }
            });
        }
    });
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
            bookingsHTML += `
                <div class="booking-item">
                    <strong>${booking.deviceName}</strong><br>
                    <span>⏰ ${booking.time}</span><br>
                    <span>📍 ${booking.address}</span><br>
                    <span>💵 ${booking.price} ₽</span>
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
            totalRevenue += doc.data().price;
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

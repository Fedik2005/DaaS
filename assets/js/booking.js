// assets/js/booking.js
console.log("Booking.js loaded!");

// ===== СИСТЕМА ВКЛАДОК =====
function openTab(tabName) {
    // Скрыть все вкладки
    const tabContents = document.getElementsByClassName('tab-content');
    for (let i = 0; i < tabContents.length; i++) {
        tabContents[i].classList.remove('active');
    }

    // Убрать активность у всех кнопок
    const tabButtons = document.getElementsByClassName('tab-button');
    for (let i = 0; i < tabButtons.length; i++) {
        tabButtons[i].classList.remove('active');
    }

    // Показать выбранную вкладку
    document.getElementById(tabName).classList.add('active');
    event.currentTarget.classList.add('active');

    // Загрузить данные для вкладки
    if (tabName === 'calendar') {
        loadCalendarData();
    } else if (tabName === 'catalog') {
        loadDevices();
    }
}

// ===== КАТАЛОГ УСТРОЙСТВ =====
function loadDevices() {
    console.log("Loading devices from Firebase...");
    
    const db = firebase.firestore();
    
    db.collection("devices").get().then((querySnapshot) => {
        const devicesContainer = document.getElementById('devicesContainer');
        console.log("Found devices:", querySnapshot.size);
        
        devicesContainer.innerHTML = '';
        
        if (querySnapshot.empty) {
            devicesContainer.innerHTML = '<p>Устройства не найдены</p>';
            return;
        }
        
        querySnapshot.forEach((doc) => {
            const device = doc.data();
            console.log("Device:", device);
            
            const deviceCard = `
                <div class="device-card">
                    <img src="${device.image}" alt="${device.name}">
                    <h3>${device.name}</h3>
                    <p>${device.description}</p>
                    <p class="price">${device.price} ₽/день</p>
                    <button onclick="bookDevice('${doc.id}')">Забронировать</button>
                </div>
            `;
            devicesContainer.innerHTML += deviceCard;
        });
    }).catch((error) => {
        console.error("Error loading devices:", error);
        document.getElementById('devicesContainer').innerHTML = '<p>Ошибка загрузки устройств</p>';
    });
}

function bookDevice(deviceId) {
    const db = firebase.firestore();
    
    db.collection("devices").doc(deviceId).get().then((doc) => {
        const device = doc.data();
        const bookingDate = prompt("Введите дату бронирования (ГГГГ-ММ-ДД):", "2024-01-15");
        const bookingTime = prompt("Введите время бронирования (ЧЧ:ММ):", "14:00");
        const address = prompt("Адрес доставки/использования:", "Москва, ул. Примерная, 123");
        
        if (bookingDate && bookingTime && address) {
            // Сохраняем бронирование в Firebase
            db.collection("bookings").add({
                deviceId: deviceId,
                deviceName: device.name,
                date: bookingDate,
                time: bookingTime,
                address: address,
                price: device.price,
                status: "active",
                createdAt: new Date()
            }).then(() => {
                alert(`Устройство "${device.name}" забронировано на ${bookingDate} в ${bookingTime}`);
                loadCalendarData(); // Обновляем календарь
            });
        }
    });
}

// ===== СИСТЕМА КАЛЕНДАРЯ И ОТЧЕТНОСТИ =====
function loadCalendarData() {
    loadDayDetails();
    loadCalendarStats();
    loadDeviceFilter();
}

function loadDayDetails() {
    const dateFilter = document.getElementById('dateFilter').value || new Date().toISOString().split('T')[0];
    const deviceFilter = document.getElementById('deviceCalendarFilter').value;
    
    const db = firebase.firestore();
    let query = db.collection("bookings").where("date", "==", dateFilter);
    
    if (deviceFilter) {
        query = query.where("deviceId", "==", deviceFilter);
    }
    
    query.get().then((querySnapshot) => {
        const dayDetails = document.getElementById('dayDetails');
        dayDetails.innerHTML = '<h3>Бронирования на ' + dateFilter + '</h3>';
        
        if (querySnapshot.empty) {
            dayDetails.innerHTML += '<p>Нет бронирований на эту дату</p>';
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
    
    // Занятые устройства
    db.collection("bookings").where("date", "==", today).get().then((querySnapshot) => {
        const busyDeviceIds = new Set();
        querySnapshot.forEach((doc) => {
            busyDeviceIds.add(doc.data().deviceId);
        });
        document.getElementById('busyDevices').textContent = busyDeviceIds.size;
    });
}

function loadDeviceFilter() {
    const db = firebase.firestore();
    const deviceFilter = document.getElementById('deviceCalendarFilter');
    
    db.collection("devices").get().then((querySnapshot) => {
        deviceFilter.innerHTML = '<option value="">Все устройства</option>';
        querySnapshot.forEach((doc) => {
            const device = doc.data();
            deviceFilter.innerHTML += `<option value="${doc.id}">${device.name}</option>`;
        });
    });
}

// ===== СИСТЕМА ТЕХПОДДЕРЖКИ =====
function callSupport() {
    alert("Звонок на номер: +7 (999) 123-45-67");
}

function startChat() {
    alert("Чат с менеджером открывается...");
}

function sendEmail() {
    window.location.href = "mailto:support@daas.ru";
}

function showHelp(problemType) {
    const supportForm = document.getElementById('supportForm');
    const problems = {
        'booking': 'Проблема с бронированием',
        'device': 'Не работает устройство', 
        'payment': 'Ошибка оплаты',
        'other': 'Другая проблема'
    };
    
    supportForm.innerHTML = `
        <h4>Опишите проблему: ${problems[problemType]}</h4>
        <textarea id="problemDescription" placeholder="Подробно опишите проблему..." rows="4"></textarea>
        <button onclick="submitSupportRequest('${problemType}')">Отправить запрос</button>
    `;
}

function submitSupportRequest(problemType) {
    const description = document.getElementById('problemDescription').value;
    if (description) {
        alert("Запрос в поддержку отправлен! Мы свяжемся с вами в течение 15 минут.");
        document.getElementById('supportForm').innerHTML = '';
    } else {
        alert("Пожалуйста, опишите проблему");
    }
}

// Загружаем устройства при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    loadDevices();
    // Устанавливаем сегодняшнюю дату в фильтр
    document.getElementById('dateFilter').value = new Date().toISOString().split('T')[0];
});

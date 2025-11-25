// js/booking.js
function loadDevices() {
    const db = firebase.firestore();
    
    db.collection("devices").get().then((querySnapshot) => {
        const devicesContainer = document.getElementById('devicesContainer');
        devicesContainer.innerHTML = '';
        
        querySnapshot.forEach((doc) => {
            const device = doc.data();
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
    });
}

function bookDevice(deviceId) {
    alert(`Бронируем устройство с ID: ${deviceId}`);
    // Здесь позже добавим логику бронирования
}

// Загружаем устройства при загрузке страницы
document.addEventListener('DOMContentLoaded', loadDevices);

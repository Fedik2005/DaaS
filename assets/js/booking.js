// assets/js/booking.js
console.log("Booking.js loaded!");

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
    alert(`Бронируем устройство с ID: ${deviceId}`);
}

// Загружаем устройства при загрузке страницы
document.addEventListener('DOMContentLoaded', loadDevices);

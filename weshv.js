// Initializing the map with Ahmedabad coordinates
const ahmedabadCoords = [23.0225, 72.5714];
const map = L.map('map').setView(ahmedabadCoords, 12);
const markers = {};
const foodJourneys = [];

// Adding OpenStreetMap tile layer to the map
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

const iconSize = [50, 50];

// Define all icons
const donorIcon = L.divIcon({ html: '🍲', className: 'donor-icon', iconSize: iconSize });
const ngoIcon = L.divIcon({ html: '🏢', className: 'ngo-icon', iconSize: iconSize });
const volunteerIcon = L.divIcon({ html: '🙋', className: 'volunteer-icon', iconSize: iconSize });
const hostIcon = L.divIcon({ html: '🏠', className: 'host-icon', iconSize: iconSize });
const pickerIcon = L.divIcon({ html: '🚚', className: 'picker-icon', iconSize: iconSize });
const institutionIcon = L.divIcon({ html: '🏛', className: 'institution-icon', iconSize: iconSize });

// Sample names for each type
const donorNames = ['Community Kitchen', 'Anand Hotel', 'Rajus Dhabha', 'Punjabi Rasoi', 'Gupta Bhojanalay'];
const deliveryNames = ['Vasna Slum', 'Gota Shelter', 'Prerna Orphanage', 'Jeevan Jyoti Old Age Home', 'Nava Vadaj Colony'];
const ngoNames = ['Seva Food Bank', 'Anna Dan NGO', 'Khushiyon Ka Langar', 'Annapurna Trust'];
const volunteerNames = ['Vivek Sharma', 'Priya Patel', 'Amit Joshi', 'Rohit Verma', 'Neha Nair'];
const hostNames = ['Sarvodaya Community Center', 'Amul School Host', 'Sankalp Bhavan'];
const pickerNames = ['Deepak Singh', 'Mohammed Rafi', 'Sanjay Kumar', 'Ramesh Solanki', 'Arjun Yadav'];

// Function to add markers of different types
function addMarkers(type, names, icon) {
    for (let i = 0; i < names.length; i++) {
        const coord = getRandomCoord(ahmedabadCoords, 5);
        const marker = L.marker(coord, { icon: icon }).addTo(map);
        
        let popupContent = `<b>${type}:</b> ${names[i]}<br>`;
        const id = generateUniqueId();
        markers[id] = { type: type, name: names[i], marker: marker, coord: coord };

        if (type === 'Food Donor') {
            const foodId = generateUniqueId();
            popupContent += `Food ID: ${foodId}<br>`;
            markers[id].foodId = foodId;  // Assign foodId to donor
        }

        marker.bindPopup(`<div class="popup-content">${popupContent}</div>`);

        marker.on('mouseover', function () {
            this.openPopup();
        });
        marker.on('mouseout', function () {
            this.closePopup();
        });
    }
}

// Add markers to the map
addMarkers('Food Donor', donorNames, donorIcon);
addMarkers('Delivery Location', deliveryNames, hostIcon);
addMarkers('NGO', ngoNames, ngoIcon);
addMarkers('Volunteer', volunteerNames, volunteerIcon);
addMarkers('Host', hostNames, hostIcon);
addMarkers('Picker', pickerNames, pickerIcon);

function simulateFoodJourney() {
    const donors = Object.values(markers).filter(m => m.type === 'Food Donor');
    const deliveryLocations = Object.values(markers).filter(m => m.type === 'Delivery Location' || m.type === 'Institution');
    const pickers = Object.values(markers).filter(m => m.type === 'Picker');
    
    if (donors.length === 0 || deliveryLocations.length === 0 || pickers.length === 0) {
        alert('Not enough entities to simulate a food journey');
        return;
    }

    const donor = donors[Math.floor(Math.random() * donors.length)];
    const deliveryLocation = deliveryLocations[Math.floor(Math.random() * deliveryLocations.length)];
    const picker = pickers[Math.floor(Math.random() * pickers.length)];

    const journey = {
        id: generateUniqueId(),
        foodId: donor.foodId,
        donor: donor,
        picker: picker,
        deliveryLocation: deliveryLocation,
        status: 'In Progress'
    };

    foodJourneys.push(journey);

    const journeyLine = L.polyline([donor.coord, picker.coord, deliveryLocation.coord], { color: 'red' }).addTo(map);

    setTimeout(() => {
        journeyLine.setStyle({ color: 'green' });
        journey.status = 'Completed';
        updateJourneyInfo();
    }, 5000);

    updateJourneyInfo();
}

function scheduleEvent() {
    const eventType = prompt('Enter event type (e.g., Surplus Sunday, Chef Session):');
    const eventDate = prompt('Enter event date (YYYY-MM-DD):');
    const eventLocation = prompt('Enter event location:');
    if (eventType && eventDate && eventLocation) {
        alert(`Event scheduled:\nType: ${eventType}\nDate: ${eventDate}\nLocation: ${eventLocation}`);
    } else {
        alert('Event scheduling cancelled');
    }
}

function createCommunityPage() {
    const communityName = prompt('Enter community name:');
    if (communityName) {
        alert(`Community page created for ${communityName}`);
    }
}

function getRandomCoord(center, offsetKm) {
    const earthRadius = 6371; // Earth's radius in km
    const lat = center[0] + (Math.random() - 0.5) * 2 * offsetKm / earthRadius * (180 / Math.PI);
    const lon = center[1] + (Math.random() - 0.5) * 2 * offsetKm / earthRadius * (180 / Math.PI) / Math.cos(center[0] * Math.PI / 180);
    return [lat, lon];
}

function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function updateJourneyInfo() {
    console.log('Journey info updated:', foodJourneys);
    // Implement this function to update the UI with journey information
}

// Initialize the map with markers
updateJourneyInfo();

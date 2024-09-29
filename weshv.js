// Initializing the map with Gujarat coordinates
const gujaratCoords = [22.2587, 71.1924];
const map = L.map('map').setView(gujaratCoords, 7);
const markers = {};
const foodJourneys = [];

// Adding OpenStreetMap tile layer to the map
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Initialize Leaflet Routing Machine control
const routingControl = L.Routing.control({
    show: false,
    addWaypoints: false,
    draggableWaypoints: false,
    fitSelectedRoutes: true,
    showAlternatives: false
}).addTo(map);

const iconSize = [50, 50];

// Define all icons
const donorIcon = L.divIcon({ html: '🍲', className: 'donor-icon', iconSize: iconSize });
const ngoIcon = L.divIcon({ html: '🏢', className: 'ngo-icon', iconSize: iconSize });
const volunteerIcon = L.divIcon({ html: '🙋', className: 'volunteer-icon', iconSize: iconSize });
const hostIcon = L.divIcon({ html: '🏠', className: 'host-icon', iconSize: iconSize });
const pickerIcon = L.divIcon({ html: '🚚', className: 'picker-icon', iconSize: iconSize });
const institutionIcon = L.divIcon({ html: '🏛', className: 'institution-icon', iconSize: iconSize });

// Sample names for each type (expanded to cover more of Gujarat)
const donorNames = ['Community Kitchen Ahmedabad', 'Anand Hotel Vadodara', 'Rajus Dhabha Surat', 'Punjabi Rasoi Rajkot', 'Gupta Bhojanalay Gandhinagar', 'Jamnagar Food Court', 'Bhavnagar Caterers', 'Junagadh Tiffin Services'];
const deliveryNames = ['Vasna Slum Ahmedabad', 'Gota Shelter Gandhinagar', 'Prerna Orphanage Vadodara', 'Jeevan Jyoti Old Age Home Surat', 'Nava Vadaj Colony Rajkot', 'Bhuj Relief Camp', 'Porbandar Fishermen Colony', 'Mehsana Rural School'];
const ngoNames = ['Seva Food Bank Ahmedabad', 'Anna Dan NGO Surat', 'Khushiyon Ka Langar Vadodara', 'Annapurna Trust Rajkot', 'Gujarat Food Relief', 'Saurashtra Seva Samiti', 'Kutch Mitra Mandal'];
const volunteerNames = ['Vivek Sharma', 'Priya Patel', 'Amit Joshi', 'Rohit Verma', 'Neha Nair', 'Raj Bhatt', 'Meera Desai', 'Karan Mehta'];
const hostNames = ['Sarvodaya Community Center Ahmedabad', 'Amul School Host Anand', 'Sankalp Bhavan Vadodara', 'Surat Municipal Corporation', 'Rajkot Civil Hospital', 'Bhavnagar University'];
const pickerNames = ['Deepak Singh', 'Mohammed Rafi', 'Sanjay Kumar', 'Ramesh Solanki', 'Arjun Yadav', 'Prakash Patel', 'Fatima Sheikh', 'Ravi Chauhan'];

// Function to add markers of different types
function addMarkers(type, names, icon) {
    for (let i = 0; i < names.length; i++) {
        const coord = getRandomCoord(gujaratCoords, 300);
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

    routingControl.setWaypoints([
        L.latLng(donor.coord[0], donor.coord[1]),
        L.latLng(picker.coord[0], picker.coord[1]),
        L.latLng(deliveryLocation.coord[0], deliveryLocation.coord[1])
    ]);

    setTimeout(() => {
        journey.status = 'Completed';
        updateJourneyInfo();
    }, 5000);

    updateJourneyInfo();
}

function scheduleEvent() {
    const eventType = prompt('Enter event type (e.g., Surplus Sunday, Chef Session):');
    const eventDate = prompt('Enter event date (YYYY-MM-DD):');
    const eventLocation = prompt('Enter event location (e.g., Ahmedabad, Surat):');
    if (eventType && eventDate && eventLocation) {
        // Find the nearest marker to the event location
        const nearestMarker = findNearestMarker(eventLocation);
        if (nearestMarker) {
            // Calculate route from current location to event location
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const start = L.latLng(position.coords.latitude, position.coords.longitude);
                    const end = L.latLng(nearestMarker.coord[0], nearestMarker.coord[1]);
                    
                    routingControl.setWaypoints([start, end]);
                    
                    alert(`Event scheduled:\nType: ${eventType}\nDate: ${eventDate}\nLocation: ${eventLocation}\n\nRoute calculated to the nearest point: ${nearestMarker.name}`);
                },
                () => {
                    alert('Unable to get your current location. Please allow location access.');
                }
            );
        } else {
            alert(`Event scheduled, but couldn't find a nearby location on the map:\nType: ${eventType}\nDate: ${eventDate}\nLocation: ${eventLocation}`);
        }
    } else {
        alert('Event scheduling cancelled');
    }
}

function findNearestMarker(locationName) {
    const locationNameLower = locationName.toLowerCase();
    let nearestMarker = null;
    let shortestDistance = Infinity;

    Object.values(markers).forEach(marker => {
        if (marker.name.toLowerCase().includes(locationNameLower)) {
            nearestMarker = marker;
            return;
        }
        
        const distance = L.latLng(marker.coord).distanceTo(gujaratCoords);
        if (distance < shortestDistance) {
            shortestDistance = distance;
            nearestMarker = marker;
        }
    });

    return nearestMarker;
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
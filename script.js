// DOM Elements
const permissionScreen = document.getElementById('permissionScreen');
const allowCameraBtn = document.getElementById('allowCameraBtn');
const scannerView = document.getElementById('scannerView');
const cameraView = document.getElementById('cameraView');
const scanBtn = document.getElementById('scanBtn');
const switchCamBtn = document.getElementById('switchCamBtn');
const galleryBtn = document.getElementById('galleryBtn');
const resultsView = document.getElementById('resultsView');
const audioPlayer = document.getElementById('audioPlayer');
const newScanBtn = document.getElementById('newScanBtn');
const toast = document.getElementById('toast');
const helpBtn = document.getElementById('helpBtn');
const scanLine = document.querySelector('.scan-line');
const scanFrame = document.querySelector('.scan-frame');

// App State
let stream = null;
let facingMode = 'environment';
let isScanning = false;

// Initialize App
function initApp() {
    // Check for camera permission
    if (!permissionScreen.classList.contains('hidden')) {
        return; // Already showing permission screen
    }
    
    // Try to get camera access
    initCamera();
}

// Initialize Camera
async function initCamera() {
    try {
        // Stop any existing stream
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        
        // Get camera access
        stream = await navigator.mediaDevices.getUserMedia({
            video: { 
                facingMode: facingMode,
                width: { ideal: 1280 },
                height: { ideal: 720 }
            },
            audio: false
        });
        
        // Show camera view
        cameraView.srcObject = stream;
        permissionScreen.classList.add('hidden');
        scannerView.classList.remove('hidden');
        controls.classList.remove('hidden');
        showToast('Camera ready', 'success');
        
    } catch (err) {
        console.error("Camera Error:", err);
        showToast('Camera access denied', 'error');
        permissionScreen.classList.remove('hidden');
        scannerView.classList.add('hidden');
        controls.classList.add('hidden');
    }
}

// Switch Camera
async function switchCamera() {
    facingMode = facingMode === 'user' ? 'environment' : 'user';
    await initCamera();
}

// Scan Image
async function scanImage() {
    if (isScanning) return;
    isScanning = true;
    
    // Start scanning animation
    scannerView.classList.add('scanning');
    scanBtn.innerHTML = '<div class="spinner"></div>';
    
    try {
        // Create canvas to capture image
        const canvas = document.createElement('canvas');
        canvas.width = cameraView.videoWidth;
        canvas.height = cameraView.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(cameraView, 0, 0, canvas.width, canvas.height);
        
        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Extract hidden audio (simulated - replace with actual extraction)
        const audioFound = Math.random() > 0.3; // 70% chance of "finding" audio
        
        if (audioFound) {
            // In a real app, you would extract actual audio data
            // For demo, we'll use a placeholder
            const audioBlob = await getDemoAudio();
            const audioUrl = URL.createObjectURL(audioBlob);
            
            // Show results
            audioPlayer.src = audioUrl;
            showResults();
            showToast('Audio extracted successfully!', 'success');
        } else {
            throw new Error('No audio found');
        }
        
    } catch (error) {
        console.error("Scan Error:", error);
        showToast('No hidden audio found', 'error');
        scanBtn.classList.add('error');
        setTimeout(() => scanBtn.classList.remove('error'), 500);
    } finally {
        // Reset scanning state
        scannerView.classList.remove('scanning');
        scanBtn.innerHTML = '<span class="icon">🔍</span><span class="text">Scan</span>';
        isScanning = false;
    }
}

// Show Results
function showResults() {
    resultsView.classList.add('visible');
    scannerView.classList.add('hidden');
    controls.classList.add('hidden');
    
    // Start playing audio
    setTimeout(() => {
        audioPlayer.play().catch(e => console.log("Autoplay prevented:", e));
    }, 500);
}

// Reset Scanner
function resetScanner() {
    resultsView.classList.remove('visible');
    scannerView.classList.remove('hidden');
    controls.classList.remove('hidden');
    audioPlayer.pause();
    audioPlayer.currentTime = 0;
}

// Demo function - replace with actual audio extraction
async function getDemoAudio() {
    // In a real app, you would extract audio from the image
    // For demo purposes, we'll return a sample audio
    const response = await fetch('https://assets.mixkit.co/sfx/preview/mixkit-positive-interface-beep-221.mp3');
    return await response.blob();
}

// Show Toast Notification
function showToast(message, type = '') {
    toast.textContent = message;
    toast.className = 'toast';
    if (type) toast.classList.add(type);
    toast.classList.add('visible');
    
    setTimeout(() => {
        toast.classList.remove('visible');
    }, 3000);
}

// Event Listeners
allowCameraBtn.addEventListener('click', initCamera);
scanBtn.addEventListener('click', scanImage);
switchCamBtn.addEventListener('click', switchCamera);
newScanBtn.addEventListener('click', resetScanner);

helpBtn.addEventListener('click', () => {
    showToast('Point camera at an image with hidden audio', 'success');
});

galleryBtn.addEventListener('click', () => {
    showToast('Gallery feature coming soon', 'success');
});

// Handle orientation changes
window.addEventListener('orientationchange', () => {
    setTimeout(initCamera, 500);
});

// Initialize app when DOM loads
document.addEventListener('DOMContentLoaded', () => {
    // Check if we're on a mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (!isMobile) {
        showToast('For best experience, use on mobile device', 'error');
    }
    
    initApp();
});

// Register service worker for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(err => {
            console.log('ServiceWorker registration failed: ', err);
        });
    });
}
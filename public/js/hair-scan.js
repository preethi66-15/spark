// ── Spark Hair Care & Growth Analysis (hair-scan.js) ──

// ── Hair Products Database ──
const hairProducts = {
  'Hair Fall': [
    { name: 'Indulekha Bringha Hair Oil', type: 'Hair Oil', price: '₹300-500', rating: 4.3, budget: true },
    { name: 'Dove Hair Fall Rescue Shampoo', type: 'Shampoo', price: '₹150-300', rating: 4.1, budget: true },
    { name: 'Biotique Bio Kelp Shampoo', type: 'Shampoo', price: '₹180-280', rating: 4.0, budget: true },
    { name: 'Mamaearth Onion Hair Oil', type: 'Hair Oil', price: '₹350-500', rating: 4.4, budget: true }
  ],
  'Dandruff': [
    { name: 'Head & Shoulders Anti-Dandruff', type: 'Shampoo', price: '₹200-350', rating: 4.2, budget: true },
    { name: 'Nizoral Anti-Dandruff Shampoo', type: 'Shampoo', price: '₹350-550', rating: 4.5, budget: true },
    { name: 'Selsun Suspension Anti-Dandruff', type: 'Shampoo', price: '₹150-250', rating: 4.1, budget: true },
    { name: 'Kesh King Anti-Dandruff Shampoo', type: 'Shampoo', price: '₹180-300', rating: 4.0, budget: true }
  ],
  'Dry Hair': [
    { name: "L'Oreal Paris Extraordinary Oil", type: 'Hair Serum', price: '₹400-600', rating: 4.4, budget: true },
    { name: 'Dove Intense Repair Conditioner', type: 'Conditioner', price: '₹150-250', rating: 4.2, budget: true },
    { name: 'Moroccan Argan Oil', type: 'Hair Oil', price: '₹500-800', rating: 4.6, budget: false },
    { name: 'Parachute Advansed Aloe Vera Hair Oil', type: 'Hair Oil', price: '₹100-180', rating: 4.0, budget: true }
  ],
  'Oily Scalp': [
    { name: 'The Body Shop Tea Tree Shampoo', type: 'Shampoo', price: '₹500-750', rating: 4.3, budget: false },
    { name: 'WOW Apple Cider Vinegar Shampoo', type: 'Shampoo', price: '₹350-500', rating: 4.2, budget: true },
    { name: 'Khadi Natural Amla Shampoo', type: 'Shampoo', price: '₹200-350', rating: 4.1, budget: true }
  ],
  'Thinning': [
    { name: 'Mamaearth Onion Shampoo', type: 'Shampoo', price: '₹300-450', rating: 4.3, budget: true },
    { name: 'Biotique Bio Bhringraj Hair Oil', type: 'Hair Oil', price: '₹200-350', rating: 4.2, budget: true },
    { name: 'Kesh King Ayurvedic Hair Oil', type: 'Hair Oil', price: '₹250-400', rating: 4.1, budget: true },
    { name: 'Minimalist Hair Growth Serum', type: 'Serum', price: '₹500-700', rating: 4.5, budget: true }
  ],
  'Split Ends': [
    { name: 'Streax Hair Serum', type: 'Hair Serum', price: '₹150-250', rating: 4.0, budget: true },
    { name: 'Matrix Biolage Smoothing Serum', type: 'Hair Serum', price: '₹400-600', rating: 4.4, budget: true },
    { name: 'Dove Intense Repair Shampoo', type: 'Shampoo', price: '₹150-250', rating: 4.1, budget: true }
  ]
};

// ── Hair Growth Nutrition Database ──
const hairDiet = [
  { food: 'Eggs', benefit: 'Biotin & protein for hair growth', emoji: '🥚', meal: 'Breakfast' },
  { food: 'Spinach', benefit: 'Iron & folate prevent hair loss', emoji: '🥬', meal: 'Lunch/Dinner' },
  { food: 'Sweet Potatoes', benefit: 'Beta-carotene promotes hair growth', emoji: '🍠', meal: 'Lunch/Dinner' },
  { food: 'Nuts (Almonds, Walnuts)', benefit: 'Omega-3 & zinc strengthen hair', emoji: '🥜', meal: 'Snack' },
  { food: 'Lentils & Beans', benefit: 'Protein & iron for follicle health', emoji: '🫘', meal: 'Lunch/Dinner' },
  { food: 'Greek Yogurt', benefit: 'Protein & vitamin B5 for thickness', emoji: '🥛', meal: 'Breakfast/Snack' },
  { food: 'Salmon', benefit: 'Omega-3 fatty acids for shiny hair', emoji: '🐟', meal: 'Lunch/Dinner' },
  { food: 'Seeds (Flax, Pumpkin)', benefit: 'Zinc & selenium for scalp health', emoji: '🌱', meal: 'Snack' },
  { food: 'Bell Peppers', benefit: 'Vitamin C boosts collagen for hair', emoji: '🌶️', meal: 'Any meal' },
  { food: 'Amla (Indian Gooseberry)', benefit: 'Vitamin C & antioxidants for growth', emoji: '🟢', meal: 'Morning (juice)' }
];

// ── Hair Sleep Schedule ──
const sleepSchedule = {
  title: 'Optimal Sleep Schedule for Hair Growth',
  recommendations: [
    { time: '10:00 PM', activity: 'Start winding down — no screens', icon: '📵' },
    { time: '10:15 PM', activity: 'Apply hair oil (if applicable)', icon: '💆' },
    { time: '10:30 PM', activity: 'Light stretching or meditation', icon: '🧘' },
    { time: '11:00 PM', activity: 'Sleep time — aim for 7-8 hours', icon: '😴' },
    { time: '06:30 AM', activity: 'Wake up — drink warm water with lemon', icon: '🌅' },
    { time: '07:00 AM', activity: 'Morning hair care routine', icon: '💇' },
    { time: '07:30 AM', activity: 'Healthy breakfast for hair nutrients', icon: '🍳' }
  ],
  tips: [
    'Use a silk or satin pillowcase to reduce hair friction',
    'Never sleep with wet hair — it causes breakage',
    'Tie hair loosely with a soft scrunchie',
    'Keep bedroom temperature between 18-22°C',
    'Get 7-8 hours of sleep for optimal hair growth hormone release'
  ]
};

// ── DOM References ──
const webcamVideo      = document.getElementById('webcam');
const overlayCanvas    = document.getElementById('overlay');
const startScanBtn     = document.getElementById('start-scan');
const captureBtn       = document.getElementById('capture-btn');
const scanStatus       = document.getElementById('scan-status');
const analyzeBtn       = document.getElementById('analyze-btn');
const resultsSection   = document.getElementById('results-section');
const hairTypeResult   = document.getElementById('result-hair-type');
const concernsResult   = document.getElementById('result-hair-concerns');
const productsGrid     = document.getElementById('products-grid');
const dietGrid         = document.getElementById('diet-grid');
const sleepGrid        = document.getElementById('sleep-grid');
const sleepTips        = document.getElementById('sleep-tips');
const loadingOverlay   = document.getElementById('loading-overlay');
const loadingText      = document.getElementById('loading-text');
const webcamPlaceholder = document.getElementById('webcam-placeholder');
const webcamContainer   = document.getElementById('webcam-container');

let modelsLoaded = false;
let videoStream  = null;
let detectionInterval = null;
let scanLineEl = null;
let captured = false;
let selectedHairType = '';
let selectedConcerns = [];

// ── State Handlers ──
function setStatus(text, type) {
  scanStatus.textContent = text;
  scanStatus.className = type || '';
}

function showLoading(msg) {
  loadingText.textContent = msg || 'Loading…';
  loadingOverlay.classList.remove('hidden');
}

function hideLoading() {
  loadingOverlay.classList.add('hidden');
}

function updateAnalyzeButtonState() {
  // Analyze requires capture to be completed, a hair type checked, and at least one concern
  const hasType = !!selectedHairType;
  const hasConcern = selectedConcerns.length > 0;
  
  analyzeBtn.disabled = !(captured && hasType && hasConcern);
}

// ── Selectors styling helpers ──
function initSelectorStyles() {
  const radioLabels = document.querySelectorAll('#hair-type-select .selector-label');
  radioLabels.forEach(label => {
    const radioInput = label.querySelector('input');
    radioInput.addEventListener('change', () => {
      // Remove selected class from others
      radioLabels.forEach(l => l.classList.remove('selected'));
      if (radioInput.checked) {
        label.classList.add('selected');
        selectedHairType = radioInput.value;
        updateAnalyzeButtonState();
      }
    });
  });

  const checkLabels = document.querySelectorAll('#hair-concerns .selector-label');
  checkLabels.forEach(label => {
    const checkInput = label.querySelector('input');
    checkInput.addEventListener('change', () => {
      label.classList.toggle('selected', checkInput.checked);
      selectedConcerns = Array.from(document.querySelectorAll('#hair-concerns input:checked')).map(el => el.value);
      updateAnalyzeButtonState();
    });
  });
}

// ── Load Face-API ──
async function loadModels() {
  const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.12/model/';
  showLoading('Loading AI verification models…');
  try {
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL)
    ]);
    modelsLoaded = true;
    hideLoading();
    setStatus('Models ready — Start camera to capture', 'active');
  } catch (err) {
    console.error('Model load error:', err);
    hideLoading();
    setStatus('Failed to load AI models. Please refresh.', 'error');
    if (typeof showToast === 'function') showToast('Could not load face verification models.', 'error');
  }
}

// ── Webcam controls ──
async function startWebcam() {
  if (!modelsLoaded) return;
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
    });
    videoStream = stream;
    webcamVideo.srcObject = stream;
    webcamPlaceholder.style.display = 'none';

    webcamVideo.addEventListener('loadedmetadata', () => {
      overlayCanvas.width  = webcamVideo.videoWidth;
      overlayCanvas.height = webcamVideo.videoHeight;
    });

    // Add scan line indicator
    if (!scanLineEl) {
      scanLineEl = document.createElement('div');
      scanLineEl.classList.add('scan-line');
      webcamContainer.appendChild(scanLineEl);
    }
    scanLineEl.style.display = 'block';

    startScanBtn.textContent = '⏹ Stop Camera';
    startScanBtn.className = 'btn btn-secondary';
    setStatus('Look directly into the camera', 'active');

    beginRealtimeVerification();
  } catch (err) {
    console.error('Camera error:', err);
    setStatus('Camera permission denied', 'error');
    if (typeof showToast === 'function') showToast('Camera access is required.', 'error');
  }
}

function stopWebcam() {
  if (detectionInterval) {
    clearInterval(detectionInterval);
    detectionInterval = null;
  }
  if (videoStream) {
    videoStream.getTracks().forEach(t => t.stop());
    videoStream = null;
  }
  webcamVideo.srcObject = null;
  const ctx = overlayCanvas.getContext('2d');
  ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
  if (scanLineEl) scanLineEl.style.display = 'none';
  webcamPlaceholder.style.display = '';
  captureBtn.style.display = 'none';
  startScanBtn.textContent = '🎥 Start Camera';
  startScanBtn.className = 'btn btn-primary';
  setStatus('', '');
}

function beginRealtimeVerification() {
  const ctx = overlayCanvas.getContext('2d');
  let faceFound = false;

  detectionInterval = setInterval(async () => {
    if (!webcamVideo.videoWidth || captured) return;

    try {
      const detections = await faceapi
        .detectAllFaces(webcamVideo, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks();

      ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

      if (detections.length > 0) {
        const resized = faceapi.resizeResults(detections, {
          width: overlayCanvas.width,
          height: overlayCanvas.height
        });

        // Render outlines
        resized.forEach(det => {
          ctx.strokeStyle = '#7c3aed';
          ctx.lineWidth = 2;
          const box = det.detection.box;
          ctx.strokeRect(box.x, box.y, box.width, box.height);
        });

        if (!faceFound) {
          faceFound = true;
          captureBtn.style.display = 'inline-flex';
          setStatus('Ready to capture!', 'active');
        }
      } else {
        if (faceFound) {
          faceFound = false;
          captureBtn.style.display = 'none';
          setStatus('No face detected', '');
        }
      }
    } catch (e) {
      // skip errors
    }
  }, 250);
}

// ── Capture frame ──
function captureFrame() {
  if (!videoStream || captured) return;

  captured = true;
  if (detectionInterval) {
    clearInterval(detectionInterval);
    detectionInterval = null;
  }

  // Freeze video
  webcamVideo.pause();
  if (scanLineEl) scanLineEl.style.display = 'none';
  captureBtn.disabled = true;
  captureBtn.textContent = '✅ Captured';
  
  setStatus('Face capture verified! Provide parameters & request diagnostics.', 'active');
  updateAnalyzeButtonState();
}

// ── Generate recommendations ──
async function generateDiagnostics() {
  if (!captured || !selectedHairType || selectedConcerns.length === 0) return;

  showLoading('Generating custom growth plan…');

  try {
    // 1. Set values in Diagnostics Report card
    hairTypeResult.textContent = selectedHairType;
    concernsResult.textContent = selectedConcerns.join(', ');

    // 2. Render Products
    productsGrid.innerHTML = '';
    let flatProducts = [];
    selectedConcerns.forEach(concern => {
      const items = hairProducts[concern] || [];
      items.forEach(it => {
        // Prevent duplicate products
        if (!flatProducts.some(p => p.name === it.name)) {
          flatProducts.push(it);
        }
      });
    });

    flatProducts.forEach((p, idx) => {
      const card = document.createElement('div');
      card.className = 'glass-card glass-card-hover product-card';
      card.style.animation = `slideUp 0.5s ease both`;
      card.style.animationDelay = `${idx * 0.08}s`;

      let starsHtml = '';
      const fullStars = Math.floor(p.rating);
      for (let i = 0; i < fullStars; i++) starsHtml += '★';
      for (let i = 0; i < 5 - fullStars; i++) starsHtml += '☆';

      card.innerHTML = `
        <div class="product-type" style="font-size:0.75rem; text-transform:uppercase; color:var(--cyan); font-weight:600;">${escapeHtml(p.type)}</div>
        <h4 style="margin: 0.25rem 0 0.5rem 0;">${escapeHtml(p.name)}</h4>
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="color:var(--gold); font-weight:700;">${escapeHtml(p.price)}</span>
          <span style="color:var(--gold); font-size:0.85rem;">${starsHtml} (${p.rating})</span>
        </div>
        ${p.budget ? '<span class="badge badge-green" style="margin-top:0.75rem; font-size:0.65rem;">💰 Budget Friendly</span>' : ''}
      `;
      productsGrid.appendChild(card);
    });

    // 3. Render Diet Cards
    dietGrid.innerHTML = '';
    hairDiet.forEach((d, idx) => {
      const card = document.createElement('div');
      card.className = 'glass-card';
      card.style.padding = '1rem';
      card.style.display = 'flex';
      card.style.gap = '0.75rem';
      card.style.alignItems = 'center';
      card.style.animation = `slideUp 0.5s ease both`;
      card.style.animationDelay = `${idx * 0.06}s`;

      card.innerHTML = `
        <span style="font-size:1.8rem;">${d.emoji}</span>
        <div>
          <h4 style="font-size:0.95rem; margin:0;">${escapeHtml(d.food)}</h4>
          <p style="font-size:0.75rem; margin:0; color:var(--text-secondary);">${escapeHtml(d.benefit)}</p>
          <span class="badge badge-cyan" style="font-size:0.6rem; padding: 0.15rem 0.4rem; margin-top:0.25rem;">🕐 ${escapeHtml(d.meal)}</span>
        </div>
      `;
      dietGrid.appendChild(card);
    });

    // 4. Render Sleep Schedule
    sleepGrid.innerHTML = '';
    sleepSchedule.recommendations.forEach((item, idx) => {
      const row = document.createElement('div');
      row.className = 'schedule-item';
      row.innerHTML = `
        <span style="font-size:1.4rem;">${item.icon}</span>
        <span class="schedule-time">${item.time}</span>
        <span class="schedule-activity">${escapeHtml(item.activity)}</span>
      `;
      sleepGrid.appendChild(row);
    });

    // Render Sleep Tips
    sleepTips.innerHTML = '';
    sleepSchedule.tips.forEach(tip => {
      const li = document.createElement('li');
      li.textContent = tip;
      sleepTips.appendChild(li);
    });

    // 5. Send results to backend API
    const token = getToken();
    if (token) {
      await fetch('/api/user/analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: 'hair',
          results: {
            hairType: selectedHairType,
            concerns: selectedConcerns
          },
          recommendations: {
            products: flatProducts.map(p => p.name),
            diet: hairDiet.map(d => d.food),
            sleepTips: sleepSchedule.tips
          }
        })
      });
      
      // Update local profile representation
      await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          hair_type: selectedHairType
        })
      });
    }

    // Reveal Results Panel
    resultsSection.classList.remove('hidden');
    resultsSection.scrollIntoView({ behavior: 'smooth' });
    
    stopWebcam();
    hideLoading();
    showToast('Plan generated and saved successfully! ✨', 'success');

  } catch (err) {
    console.error('Generate plan error:', err);
    hideLoading();
    showToast('Plan generation failed. Try again.', 'error');
  }
}

// ── HTML Escape Helper ──
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ── Event Bindings ──
startScanBtn.addEventListener('click', () => {
  if (videoStream) {
    stopWebcam();
  } else {
    captured = false;
    webcamVideo.play();
    captureBtn.disabled = false;
    captureBtn.textContent = '📸 Capture';
    startWebcam();
  }
});

captureBtn.addEventListener('click', captureFrame);
analyzeBtn.addEventListener('click', generateDiagnostics);

// ── Initialization ──
document.addEventListener('DOMContentLoaded', () => {
  requireAuth();
  renderSidebar('hair-scan');
  initSelectorStyles();
  loadModels();
});

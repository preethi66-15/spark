// ───────────────────────────────────────────────────────────────
// Spark — Face Scan & Skin Analysis  (face-scan.js)
// ───────────────────────────────────────────────────────────────

// ── Product Database ──

const skinProducts = {
  'Young/Combination': [
    { name: 'Himalaya Neem Face Wash', type: 'Cleanser', price: '₹120-180', rating: 4.3, budget: true },
    { name: 'Neutrogena Oil-Free Moisturizer', type: 'Moisturizer', price: '₹250-400', rating: 4.5, budget: true },
    { name: 'Lakme Sun Expert SPF 50', type: 'Sunscreen', price: '₹200-350', rating: 4.2, budget: true },
    { name: 'The Ordinary Niacinamide 10%', type: 'Serum', price: '₹550-700', rating: 4.6, budget: false },
    { name: 'Mamaearth Vitamin C Face Wash', type: 'Cleanser', price: '₹200-350', rating: 4.1, budget: true },
    { name: 'Plum Green Tea Toner', type: 'Toner', price: '₹350-450', rating: 4.4, budget: true }
  ],
  'Normal to Combination': [
    { name: 'Cetaphil Gentle Skin Cleanser', type: 'Cleanser', price: '₹300-450', rating: 4.5, budget: true },
    { name: 'Minimalist Hyaluronic Acid Serum', type: 'Serum', price: '₹350-500', rating: 4.6, budget: true },
    { name: 'Olay Regenerist Moisturizer', type: 'Moisturizer', price: '₹800-1200', rating: 4.4, budget: false },
    { name: 'La Shield Sunscreen SPF 40', type: 'Sunscreen', price: '₹250-400', rating: 4.3, budget: true },
    { name: 'Dot & Key Vitamin C Serum', type: 'Serum', price: '₹500-700', rating: 4.5, budget: true },
    { name: 'Biotique Bio Neem Purifying Face Wash', type: 'Cleanser', price: '₹150-250', rating: 4.2, budget: true }
  ],
  'Combination to Dry': [
    { name: 'CeraVe Hydrating Cleanser', type: 'Cleanser', price: '₹400-600', rating: 4.7, budget: true },
    { name: 'Minimalist Retinol 0.3% Serum', type: 'Serum', price: '₹400-600', rating: 4.5, budget: true },
    { name: 'Neutrogena Hydro Boost Gel Cream', type: 'Moisturizer', price: '₹700-1000', rating: 4.6, budget: false },
    { name: 'Bioderma Sunscreen SPF 50+', type: 'Sunscreen', price: '₹500-800', rating: 4.5, budget: false },
    { name: "Pond's Super Light Gel Moisturizer", type: 'Moisturizer', price: '₹200-350', rating: 4.3, budget: true },
    { name: 'Kama Ayurveda Rose Water Toner', type: 'Toner', price: '₹400-600', rating: 4.4, budget: true }
  ],
  'Mature/Dry': [
    { name: 'Forest Essentials Facial Cleanser', type: 'Cleanser', price: '₹800-1200', rating: 4.5, budget: false },
    { name: 'Olay Collagen Peptide 24 Serum', type: 'Serum', price: '₹900-1400', rating: 4.6, budget: false },
    { name: "L'Oreal Paris Revitalift Night Cream", type: 'Night Cream', price: '₹500-800', rating: 4.4, budget: true },
    { name: 'Lotus Herbals Sunscreen SPF 70', type: 'Sunscreen', price: '₹300-500', rating: 4.3, budget: true },
    { name: 'Minimalist Vitamin C 10% Serum', type: 'Serum', price: '₹350-550', rating: 4.5, budget: true },
    { name: 'Nivea Soft Moisturizing Cream', type: 'Moisturizer', price: '₹150-300', rating: 4.2, budget: true }
  ]
};

const skinDiet = [
  { food: 'Carrots & Sweet Potatoes', benefit: 'Rich in beta-carotene for skin repair', emoji: '🥕', meal: 'Lunch/Dinner' },
  { food: 'Berries (Blueberries, Strawberries)', benefit: 'Antioxidants fight skin aging', emoji: '🫐', meal: 'Breakfast/Snack' },
  { food: 'Spinach & Leafy Greens', benefit: 'Vitamin A & iron for skin glow', emoji: '🥬', meal: 'Lunch/Dinner' },
  { food: 'Salmon & Fatty Fish', benefit: 'Omega-3 for skin hydration', emoji: '🐟', meal: 'Lunch/Dinner' },
  { food: 'Nuts & Seeds (Almonds, Walnuts)', benefit: 'Vitamin E protects skin', emoji: '🥜', meal: 'Snack' },
  { food: 'Avocado', benefit: 'Healthy fats for skin elasticity', emoji: '🥑', meal: 'Breakfast/Snack' },
  { food: 'Tomatoes', benefit: 'Lycopene protects from sun damage', emoji: '🍅', meal: 'Any meal' },
  { food: 'Green Tea', benefit: 'Catechins reduce skin redness', emoji: '🍵', meal: 'Morning/Evening' },
  { food: 'Citrus Fruits (Orange, Lemon)', benefit: 'Vitamin C boosts collagen', emoji: '🍊', meal: 'Breakfast/Snack' },
  { food: 'Yogurt/Curd', benefit: 'Probiotics for clear skin', emoji: '🥛', meal: 'Breakfast/Snack' }
];

// ── DOM References ──

const webcamVideo      = document.getElementById('webcam');
const overlayCanvas    = document.getElementById('overlay');
const startScanBtn     = document.getElementById('start-scan');
const captureBtn       = document.getElementById('capture-btn');
const scanStatus       = document.getElementById('scan-status');
const resultsPanel     = document.getElementById('results-panel');
const skinTypeResult   = document.getElementById('skin-type-result');
const ageResult        = document.getElementById('age-result');
const genderResult     = document.getElementById('gender-result');
const productSection   = document.getElementById('product-recommendations');
const productGrid      = document.getElementById('product-grid');
const waterSection     = document.getElementById('water-section');
const waterAmount      = document.getElementById('water-amount');
const waterGlasses     = document.getElementById('water-glasses');
const dietSection      = document.getElementById('diet-section');
const dietGrid         = document.getElementById('diet-grid');
const loadingOverlay   = document.getElementById('loading-overlay');
const loadingText      = document.getElementById('loading-text');
const webcamPlaceholder = document.getElementById('webcam-placeholder');
const webcamContainer   = document.getElementById('webcam-container');

let modelsLoaded = false;
let videoStream  = null;
let detectionInterval = null;
let scanLineEl = null;

// ── Helpers ──

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

function renderStars(rating) {
  const full  = Math.floor(rating);
  const half  = rating % 1 >= 0.3 ? 1 : 0;
  const empty = 5 - full - half;
  let html = '';
  for (let i = 0; i < full; i++)  html += '<span class="star">★</span>';
  for (let i = 0; i < half; i++)  html += '<span class="star">★</span>';   // treat half as full for simplicity
  for (let i = 0; i < empty; i++) html += '<span class="star empty">★</span>';
  return html;
}

// ── Load Face-API Models ──

async function loadModels() {
  const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.12/model/';
  showLoading('Loading AI face-detection models…');
  try {
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
      faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL)
    ]);
    modelsLoaded = true;
    hideLoading();
    setStatus('Models loaded — click Start Scan', 'active');
  } catch (err) {
    console.error('Model load error:', err);
    hideLoading();
    setStatus('Failed to load AI models. Please refresh.', 'error');
    if (typeof showToast === 'function') showToast('Could not load face-detection models.', 'error');
  }
}

// ── Start Webcam ──

async function startWebcam() {
  if (!modelsLoaded) {
    setStatus('Models are still loading, please wait…', 'error');
    return;
  }
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

    // Add scan line
    if (!scanLineEl) {
      scanLineEl = document.createElement('div');
      scanLineEl.classList.add('scan-line');
      webcamContainer.appendChild(scanLineEl);
    }
    scanLineEl.style.display = 'block';

    startScanBtn.textContent = '⏹ Stop Scan';
    setStatus('Detecting face…', 'active');

    beginRealtimeDetection();
  } catch (err) {
    console.error('Webcam error:', err);
    setStatus('Camera access denied. Please allow camera.', 'error');
    if (typeof showToast === 'function') showToast('Camera permission is required for face scan.', 'error');
  }
}

// ── Stop Webcam ──

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
  startScanBtn.textContent = '🎥 Start Scan';
  setStatus('', '');
}

// ── Real-time Face Detection ──

function beginRealtimeDetection() {
  const ctx = overlayCanvas.getContext('2d');
  let faceFound = false;

  detectionInterval = setInterval(async () => {
    if (!webcamVideo.videoWidth) return;

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

        // Draw landmarks
        resized.forEach(det => {
          const landmarks = det.landmarks;
          const points = landmarks.positions;

          ctx.fillStyle = 'rgba(124,58,237,0.55)';
          points.forEach(pt => {
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, 2, 0, Math.PI * 2);
            ctx.fill();
          });

          // Draw bounding box
          const box = det.detection.box;
          ctx.strokeStyle = '#7c3aed';
          ctx.lineWidth = 2;
          ctx.strokeRect(box.x, box.y, box.width, box.height);
        });

        if (!faceFound) {
          faceFound = true;
          captureBtn.style.display = 'inline-flex';
          setStatus('Face detected! Click Capture & Analyze.', 'active');
        }
      } else {
        if (faceFound) {
          faceFound = false;
          captureBtn.style.display = 'none';
          setStatus('No face detected — look at the camera.', '');
        }
      }
    } catch (e) {
      // silently skip frame errors
    }
  }, 200);
}

// ── Capture & Analyze ──

async function captureAndAnalyze() {
  if (!modelsLoaded || !videoStream) return;

  captureBtn.disabled = true;
  showLoading('Analyzing your skin…');

  try {
    const detection = await faceapi
      .detectSingleFace(webcamVideo, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions()
      .withAgeAndGender();

    if (!detection) {
      hideLoading();
      captureBtn.disabled = false;
      setStatus('Could not detect face. Try again.', 'error');
      if (typeof showToast === 'function') showToast('No face detected. Please try again.', 'error');
      return;
    }

    const age    = Math.round(detection.age);
    const gender = detection.gender;
    const genderProb = (detection.genderProbability * 100).toFixed(0);

    // Determine skin type
    let skinType;
    if (age < 20)      skinType = 'Young/Combination';
    else if (age <= 30) skinType = 'Normal to Combination';
    else if (age <= 40) skinType = 'Combination to Dry';
    else                skinType = 'Mature/Dry';

    // Water intake
    let waterLitres;
    if (age < 20)       waterLitres = 2.5;
    else if (age <= 30) waterLitres = 3;
    else if (age <= 40) waterLitres = 2.8;
    else                waterLitres = 2.5;

    // Populate results panel
    skinTypeResult.textContent = skinType;
    ageResult.textContent      = `${age} years`;
    genderResult.textContent   = `${capitalize(gender)} (${genderProb}%)`;
    resultsPanel.classList.remove('hidden');

    // Product recommendations
    renderProducts(skinType);

    // Water section
    renderWater(waterLitres);

    // Diet section
    renderDiet();

    // Stop real-time detection (keep camera)
    if (detectionInterval) {
      clearInterval(detectionInterval);
      detectionInterval = null;
    }
    if (scanLineEl) scanLineEl.style.display = 'none';

    setStatus('Analysis complete ✨', 'active');
    hideLoading();

    // Save analysis to backend
    saveAnalysis(age, gender, skinType, waterLitres);

  } catch (err) {
    console.error('Analysis error:', err);
    hideLoading();
    captureBtn.disabled = false;
    setStatus('Analysis failed. Please try again.', 'error');
    if (typeof showToast === 'function') showToast('Something went wrong during analysis.', 'error');
  }
}

// ── Render Product Cards ──

function renderProducts(skinType) {
  const products = skinProducts[skinType] || [];
  productGrid.innerHTML = '';

  products.forEach((p, i) => {
    const card = document.createElement('div');
    card.classList.add('product-card');
    card.style.animationDelay = `${i * 0.08}s`;
    card.id = `product-card-${i}`;

    card.innerHTML = `
      <div class="product-type">${escapeHtml(p.type)}</div>
      <div class="product-name">${escapeHtml(p.name)}</div>
      <div class="product-price">${escapeHtml(p.price)}</div>
      <div class="product-rating">
        ${renderStars(p.rating)}
        <span class="rating-num">${p.rating.toFixed(1)}</span>
      </div>
      ${p.budget ? '<span class="budget-badge">💰 Budget Friendly</span>' : ''}
    `;
    productGrid.appendChild(card);
  });

  productSection.classList.remove('hidden');
}

// ── Render Water Glasses ──

function renderWater(litres) {
  waterAmount.textContent = `${litres}L`;
  const totalMl  = litres * 1000;
  const glasses  = Math.ceil(totalMl / 250);

  waterGlasses.innerHTML = '';
  for (let i = 0; i < glasses; i++) {
    const g = document.createElement('div');
    g.classList.add('water-glass', 'filled');
    g.style.animationDelay = `${i * 0.07}s`;
    g.title = `Glass ${i + 1}`;
    waterGlasses.appendChild(g);
  }

  waterSection.classList.remove('hidden');
}

// ── Render Diet Cards ──

function renderDiet() {
  dietGrid.innerHTML = '';

  skinDiet.forEach((d, i) => {
    const card = document.createElement('div');
    card.classList.add('diet-card');
    card.style.animationDelay = `${i * 0.06}s`;
    card.id = `diet-card-${i}`;

    card.innerHTML = `
      <span class="diet-emoji">${d.emoji}</span>
      <div class="diet-info">
        <div class="diet-food">${escapeHtml(d.food)}</div>
        <div class="diet-benefit">${escapeHtml(d.benefit)}</div>
        <div class="diet-meal">🕐 ${escapeHtml(d.meal)}</div>
      </div>
    `;
    dietGrid.appendChild(card);
  });

  dietSection.classList.remove('hidden');
}

// ── Save Analysis to Backend ──

async function saveAnalysis(age, gender, skinType, waterLitres) {
  try {
    const token = localStorage.getItem('spark_token');
    if (!token) return;

    const products = (skinProducts[skinType] || []).map(p => p.name);

    await fetch('/api/user/analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        type: 'skin',
        results: {
          estimatedAge: age,
          gender: gender,
          skinType: skinType
        },
        recommendations: {
          products: products,
          waterIntake: `${waterLitres}L/day`,
          diet: skinDiet.map(d => d.food)
        }
      })
    });
  } catch (err) {
    console.warn('Could not save analysis:', err);
  }
}

// ── Utility ──

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ── Event Listeners ──

startScanBtn.addEventListener('click', () => {
  if (videoStream) {
    stopWebcam();
  } else {
    startWebcam();
  }
});

captureBtn.addEventListener('click', captureAndAnalyze);

// ── Init ──

document.addEventListener('DOMContentLoaded', () => {
  // Auth gate & sidebar
  if (typeof requireAuth === 'function') requireAuth();
  if (typeof renderSidebar === 'function') renderSidebar('face-scan');

  // Load models
  loadModels();
});

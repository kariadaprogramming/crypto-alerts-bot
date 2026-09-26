// Penyimpanan kecil di state.json supaya cooldown & level milestone
// tidak hilang saat bot di-restart.
const fs = require('fs');
const config = require('../config');

let data = { lastSent: {}, zones: {}, summarySlot: '' };

try {
    if (fs.existsSync(config.stateFile)) {
        data = { ...data, ...JSON.parse(fs.readFileSync(config.stateFile, 'utf8')) };
    }
} catch (e) {
    console.error('⚠️  state.json rusak, mulai dari awal:', e.message);
}

function save() {
    try {
        fs.writeFileSync(config.stateFile, JSON.stringify(data, null, 2));
    } catch (e) {
        console.error('⚠️  Gagal simpan state:', e.message);
    }
}

function canSend(key, cooldownMs) {
    if (!cooldownMs || cooldownMs <= 0) return true;
    const last = data.lastSent[key];
    return !(last && Date.now() - last < cooldownMs);
}

function markSent(key) {
    data.lastSent[key] = Date.now();
    save();
}

function getSeenListing(id) { return data.seenNewListings[id]; }
function markSeenListing(id) { data.seenNewListings[id] = Date.now(); save(); }

function getZone(id) { return data.zones[id]; }
function setZone(id, zone) { data.zones[id] = zone; save(); }
function getSummarySlot() { return data.summarySlot; }
function setSummarySlot(slot) { data.summarySlot = slot; save(); }

module.exports = { canSend, markSent, getZone, setZone, getSummarySlot, setSummarySlot };

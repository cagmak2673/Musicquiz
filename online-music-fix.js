// ===== v26 ONLINE MÜZIK ÇALMA FIX =====
// Çok oyunculu oyunda müzik çalmama sorununu düzeltir

// Global ses kontrolü için gerekli değişkenler
let onlineAudioElement = null;
let currentSongUrl = null;
let isPlayingOnline = false;

// Sayfa yüklendikten sonra çalıştırıldığından emin ol
function initializeOnlineAudio() {
  if (!onlineAudioElement) {
    onlineAudioElement = document.createElement('audio');
    onlineAudioElement.id = 'onlineGameAudio';
    onlineAudioElement.crossOrigin = 'anonymous';
    onlineAudioElement.volume = 0.7;
    document.body.appendChild(onlineAudioElement);
    
    // Event listener'ları ekle
    onlineAudioElement.addEventListener('ended', onSongEnded);
    onlineAudioElement.addEventListener('error', onAudioError);
  }
  return onlineAudioElement;
}

// Çok oyunculu oyunda müzik çalmayı başlat
async function playOnlineGameSong(songUrl) {
  try {
    const audio = initializeOnlineAudio();
    
    if (!songUrl) {
      console.error('Şarkı URL\'si geçersiz:', songUrl);
      return false;
    }
    
    // Eğer aynı şarkı çalıyorsa tekrar başlama
    if (currentSongUrl === songUrl && isPlayingOnline) {
      console.log('Şarkı zaten çalıyor');
      return true;
    }
    
    // Önceki şarkıyı durdur
    audio.pause();
    audio.currentTime = 0;
    
    // Yeni şarkıyı ayarla
    currentSongUrl = songUrl;
    audio.src = songUrl;
    audio.load();
    
    // Ses seviyesini ayarla
    audio.volume = 0.7;
    
    // Vinyl disk animasyonunu başlat (varsa)
    const disc = document.querySelector('.disc');
    if (disc) disc.classList.add('playing');
    
    // Müzik çalmaya başla
    const playPromise = audio.play();
    
    if (playPromise !== undefined) {
      await playPromise;
      isPlayingOnline = true;
      console.log('🎵 Müzik çalıyor:', songUrl);
      return true;
    }
    
  } catch (error) {
    console.error('Müzik çalma hatası:', error);
    return false;
  }
}

// Müzik bittikten sonra
function onSongEnded() {
  isPlayingOnline = false;
  const disc = document.querySelector('.disc');
  if (disc) disc.classList.remove('playing');
  console.log('🎵 Müzik bitti');
  
  // Otomatik olarak sonraki soruya geç (gerekirse)
  // nextQuestion() gibi bir fonksiyon varsa çağır
}

// Ses çalma hatası
function onAudioError(error) {
  console.error('🔊 Ses oynatma hatası:', error);
  // Kullanıcıya hata mesajı göster
  showToast('⚠️ Müzik çalınamadı. Lütfen tekrar deneyin.');
}

// Müzik çalmayı durdur
function stopOnlineGameSong() {
  if (onlineAudioElement) {
    onlineAudioElement.pause();
    onlineAudioElement.currentTime = 0;
    isPlayingOnline = false;
    
    const disc = document.querySelector('.disc');
    if (disc) disc.classList.remove('playing');
  }
}

// Müzik ses seviyesini ayarla (0-1 arası)
function setOnlineAudioVolume(volume) {
  const audio = initializeOnlineAudio();
  audio.volume = Math.max(0, Math.min(1, volume));
}

// Sayfa yüklendiğinde otomatik başlat
document.addEventListener('DOMContentLoaded', initializeOnlineAudio);

// Window unload'da sesi temizle
window.addEventListener('beforeunload', () => {
  if (onlineAudioElement) {
    onlineAudioElement.pause();
    onlineAudioElement.src = '';
  }
});

console.log('✅ v26 Online Müzik Çalma Fix yüklendi');

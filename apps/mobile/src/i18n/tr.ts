import type { Copy } from './en';

/**
 * Turkish copy.
 *
 * The consent strings are legally operative under KVKK m.6 and must stay
 * semantically identical to the English. Translate meaning, not words — but do
 * not add, soften or remove an obligation.
 */
export const tr: Copy = {
  common: {
    continue: 'Devam et',
    back: 'Geri dön',
    cancel: 'Vazgeç',
    notNow: 'Şimdi değil',
    done: 'Tamam',
    close: 'Kapat',
    placeholder: 'YER TUTUCU',
    optional: 'İSTEĞE BAĞLI',
  },

  welcome: {
    title: 'Ayna',
    tagline: 'Bakım ve cilt rutinindeki ilerlemeyi tahminle değil, ölçümle takip et.',
    body: 'Ayna çektiğin fotoğraftan yüz oranlarını ölçer, bunu bir başlangıç referansına dönüştürür ve gerçekten değiştirebileceğin şeyler üzerine bir rutin kurar.',
    cta: 'Başla',
  },

  ageGate: {
    question: '18 yaşından büyük müsün?',
    why: 'Yüz ölçümleri biyometrik veridir. Ayna yalnızca yetişkinlere açıktır.',
    yes: 'Evet, 18 yaşından büyüğüm',
    no: 'Hayır',
    blockedTitle: 'Ayna 18+',
    blockedBody:
      'Ayna biyometrik veri sayılan yüz ölçümlerini analiz eder. Bunu yalnızca yetişkinlere sunuyoruz. Dürüstlüğün için teşekkürler.',
  },

  capture: {
    frontTitle: 'Önden',
    frontHint: 'Doğrudan lense bak. Nötr ifade, ağzın kapalı.',
    sideTitle: 'Yandan',
    sideHint: 'Tam 90 derece dön. Çenen düz, omuzların karşıya baksın.',
    sideOptional:
      'İsteğe bağlı, ama çene açını tahmin etmek yerine doğrudan ölçmemizi sağlıyor.',
    ready: 'Sabit dur',
    shutter: 'Çek',
    skipSide: 'Yan fotoğrafı atla',
    analysing: 'Ölçülüyor',
    permissionTitle: 'Kamera izni',
    permissionBody:
      'Ayna yüzünü ölçmek için kameraya ihtiyaç duyuyor. Fotoğraf bu cihazda işlenir ve hiçbir yere yüklenmez.',
    permissionGrant: 'Kameraya izin ver',
    permissionBlockedBody:
      'Kamera erişimi kapalı. Tarama yapabilmek için Ayarlar\'dan açman gerekiyor.',
    unavailable: 'Bu cihazda kullanılabilir kamera yok.',
    hints: {
      noFace: 'Yüzünü ovalin içine al',
      multipleFaces: 'Karede yalnızca sen ol',
      faceTooSmall: 'Biraz yaklaş',
      faceTooClose: 'Biraz uzaklaş',
      offCentre: 'Yüzünü ovalin ortasına al',
      headTurned: 'Doğrudan kameraya bak',
      headTilted: 'Başını düz tut',
      eyesClosed: 'Gözlerini aç',
      tooDark: 'Daha aydınlık ve dengeli bir ışık bul',
      tooBright: 'Parlama fazla — doğrudan ışıktan uzaklaş',
      blurry: 'Sabit dur',
    },
  },

  consent: {
    title: 'Fotoğrafın, verin',
    whatWeDoLabel: 'Ne yapıyoruz',
    whatWeDoBody:
      'Bir ilerleme referansı ve rutin oluşturmak için fotoğrafından geometrik mesafeleri ve açıları ölçüyoruz.',
    whatWeKeepLabel: 'Ne saklıyoruz',
    whatWeKeepBody:
      'Ölçümleri saklıyoruz. Fotoğrafın kendisi, sen ilerleme geçmişine açıkça kaydetmediğin sürece analiz biter bitmez sunucularımızdan silinir.',
    yourControlLabel: 'Kontrol sende',
    yourControlBody:
      'Bu açık rızanı istediğin zaman Profil ekranından geri çekebilir ve tüm taramalarını silebilirsin. Rızanın geri çekilmesi ölçümleri de siler.',
    checkbox:
      'Fotoğrafımdan elde edilen yüz ölçümlerinin yukarıda açıklandığı şekilde Ayna tarafından işlenmesine açık rıza veriyorum.',
  },
} as const;

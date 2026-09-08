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

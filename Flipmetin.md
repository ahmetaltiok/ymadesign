# Türkçe Sol Metin + MagicUI Text 3D Flip Planı

## Summary
İkinci sayfanın sol tarafındaki metinler Türkçeleştirilecek ve MagicUI Text 3D Flip efektine göre harf harf 3D flip animasyonu alacak. Mevcut proje React/Tailwind değil, bu yüzden MagicUI’nin resmi Text 3D Flip davranışı plain HTML/CSS/JS olarak uyarlanacak. Referans: https://magicui.design/docs/components/text-3d-flip

## Key Changes
- Sol metinler şu Türkçe içerikle değiştirilecek:
  - Eyebrow: `MDesign Mimarlık`
  - Başlık: `Sakin mekânlar, güçlü bir bakış açısı.`
  - Açıklama: `Işık, malzeme dürüstlüğü ve dikkatli dolaşım etrafında şekillenen konut, kültür ve iç mekân çalışmaları.`
  - CTA: `Projeleri incele` aynı kalacak.
- Eyebrow, başlık ve açıklama metinlerine Text 3D Flip uygulanacak; CTA butonu okunabilirlik için statik kalacak.
- `script.js` içine küçük bir text-split helper eklenecek:
  - `.text-3d-flip` elemanlarının metnini okuyacak.
  - Her karakteri ön/arka yüzlü span yapısına çevirecek.
  - `aria-label` ile orijinal metni erişilebilir tutacak.
- `styles.css` içinde MagicUI benzeri efekt tanımlanacak:
  - `perspective`, `transform-style: preserve-3d`, `rotateX` yönlü flip.
  - Harf başına stagger gecikmesi.
  - Hover ve keyboard focus durumunda animasyon.
  - `prefers-reduced-motion` için animasyon kapatma.
- Mevcut sağ taraftaki Instagram/Behance marquee kartları ve 3D logo davranışı korunacak.

## Test Plan
- `node local-server.js` ile `http://localhost:5500` açılacak.
- İkinci sayfada sol metinlerin Türkçe göründüğü doğrulanacak.
- Sol metin alanı hover/focus olunca harflerin stagger’lı 3D flip yaptığı kontrol edilecek.
- Sağdaki kart animasyonu, Instagram/Behance linkleri ve logo sayfası etkilenmemeli.
- Mobil genişlikte Türkçe metinlerin taşmadığı ve flip efektinin okunabilir kaldığı kontrol edilecek.
- `script.js` syntax check çalıştırılacak.

## Assumptions
- “Tüm sol yazı” kapsamı eyebrow, başlık ve açıklama metnidir; CTA butonu statik kalır.
- Gerçek `shadcn add @magicui/text-3d-flip` kurulumu yapılmayacak, çünkü mevcut proje React/Tailwind altyapısında değil.
- MagicUI’nin görsel/animasyon davranışı native HTML/CSS/JS ile eşleştirilecek.

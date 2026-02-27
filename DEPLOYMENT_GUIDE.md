# دليل النشر على GitHub Pages / GitHub Pages Deployment Guide

## الخطوات العربية (Arabic Steps)

### الخطوة 1: إنشاء مستودع GitHub
1. اذهب إلى [github.com](https://github.com)
2. انقر على "New Repository"
3. اسم المستودع: `tarek-sy.github.io` (استبدل `tarek-sy` باسم المستخدم الخاص بك)
4. اختر "Public"
5. انقر "Create repository"

### الخطوة 2: رفع الملفات
1. استنسخ المستودع:
```bash
git clone https://github.com/tarek-sy/tarek-sy.github.io.git
cd tarek-sy.github.io
```

2. انسخ جميع الملفات من هذا المجلد إلى المستودع المستنسخ

3. أضف الملفات:
```bash
git add .
git commit -m "Initial portfolio commit"
git push origin main
```

### الخطوة 3: تفعيل GitHub Pages
1. اذهب إلى إعدادات المستودع (Settings)
2. اختر "Pages" من القائمة الجانبية
3. تأكد من أن "Source" مضبوط على "Deploy from a branch"
4. اختر "main" كـ branch
5. انقر "Save"

### الخطوة 4: الوصول إلى الموقع
بعد دقائق قليلة، سيكون موقعك متاحاً على:
`https://tarek-sy.github.io`

---

## English Steps

### Step 1: Create GitHub Repository
1. Go to [github.com](https://github.com)
2. Click "New Repository"
3. Repository name: `tarek-sy.github.io` (replace `tarek-sy` with your username)
4. Select "Public"
5. Click "Create repository"

### Step 2: Upload Files
1. Clone the repository:
```bash
git clone https://github.com/tarek-sy/tarek-sy.github.io.git
cd tarek-sy.github.io
```

2. Copy all files from this folder to the cloned repository

3. Add files:
```bash
git add .
git commit -m "Initial portfolio commit"
git push origin main
```

### Step 3: Enable GitHub Pages
1. Go to repository Settings
2. Select "Pages" from the left sidebar
3. Ensure "Source" is set to "Deploy from a branch"
4. Select "main" as the branch
5. Click "Save"

### Step 4: Access Your Website
After a few minutes, your website will be available at:
`https://tarek-sy.github.io`

---

## Custom Domain Setup (Optional)

### إضافة نطاق مخصص (اختياري)

1. **تحديث ملف CNAME:**
   - عدّل ملف `CNAME` وأضف نطاقك:
   ```
   tarek-portfolio.com
   ```

2. **تكوين DNS:**
   - اذهب إلى مزود النطاق الخاص بك
   - أضف سجل CNAME يشير إلى `tarek-sy.github.io`

3. **تفعيل HTTPS:**
   - في إعدادات GitHub Pages
   - فعّل "Enforce HTTPS"

---

## Troubleshooting

### الموقع لا يظهر
- تأكد من أن اسم المستودع صحيح: `username.github.io`
- انتظر 5-10 دقائق بعد الرفع الأول
- تحقق من أن الملفات موجودة في المستودع

### مشاكل مع الأنماط (CSS)
- تأكد من أن جميع ملفات `assets` موجودة
- تحقق من أن المسارات نسبية وليست مطلقة

### مشاكل مع الصور
- جميع الصور مخزنة على CDN
- إذا لم تظهر، تحقق من اتصال الإنترنت

---

## الدعم / Support

للمزيد من المساعدة:
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [GitHub Pages Troubleshooting](https://docs.github.com/en/pages/getting-started-with-github-pages/about-github-pages)

---

**تم الإنشاء بواسطة / Created by**: Manus AI
**التاريخ / Date**: 2026-02-27

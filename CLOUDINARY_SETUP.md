# Cloudinary Setup Guide

## 📸 Setting Up Cloudinary for Image Uploads

### Step 1: Create Cloudinary Account
1. Go to [cloudinary.com](https://cloudinary.com)
2. Sign up for a free account
3. Verify your email

### Step 2: Get Your Credentials
1. Log into your Cloudinary dashboard
2. Go to "Settings" → "Access Keys"
3. Copy your:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

### Step 3: Update the Upload Function
Replace the placeholder upload function in `src/js/admin.js` with real Cloudinary upload:

```javascript
async function uploadImage(file) {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'YOUR_UPLOAD_PRESET'); // Create this in Cloudinary
    
    const response = await fetch('https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload', {
      method: 'POST',
      body: formData
    });
    
    const data = await response.json();
    return data.secure_url; // This is your image URL
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}
```

### Step 4: Create Upload Preset
1. In Cloudinary dashboard, go to "Settings" → "Upload"
2. Scroll to "Upload presets"
3. Click "Add upload preset"
4. Set signing mode to "Unsigned"
5. Save the preset name

### Step 5: Replace Placeholders
In the upload function above, replace:
- `YOUR_CLOUD_NAME` with your actual cloud name
- `YOUR_UPLOAD_PRESET` with your upload preset name

## 🎯 Features Implemented

### ✅ Admin Panel
- **Image upload field** in recipe form
- **Image preview** before upload
- **Image storage** in Firebase with recipe data
- **Image display** in admin recipe cards

### ✅ Recipe Pages
- **Custom images** display on recipe cards
- **Fallback to category images** if no custom image
- **Responsive image display**

### ✅ Benefits
- **Free 25GB storage** with Cloudinary
- **Auto-optimization** for fast loading
- **CDN delivery** worldwide
- **Responsive images** for all devices

## 🚀 Next Steps

1. **Sign up for Cloudinary** (free)
2. **Get your credentials** from dashboard
3. **Update the upload function** with real Cloudinary API
4. **Test image uploads** in admin panel
5. **Enjoy custom recipe images!** 📸

## 💡 Tips

- **Image formats**: JPG, PNG, WebP supported
- **File size**: Keep under 10MB for best performance
- **Aspect ratio**: 16:9 or 4:3 works best for recipe cards
- **Optimization**: Cloudinary automatically optimizes images 
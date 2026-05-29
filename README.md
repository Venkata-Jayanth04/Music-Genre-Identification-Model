# 🎵 Music Genre Classification Web App

A full-stack AI-powered application that predicts the **genre of music** from either:

- 🎧 **Audio files** (WAV / MP3)  
- 🖼️ **Spectrogram images** (PNG / JPG)

This project uses **Deep Learning**, **FastAPI**, and **Next.js** to deliver fast, accurate predictions with a modern UI.

---

## 🚀 Features

### 🔊 Audio Classification
Upload a `.wav` or `.mp3` file to get the predicted music genre.

### 🖼️ Spectrogram Image Classification
Upload spectrogram images and get precise genre predictions.

### 🎯 Top-3 Predictions
- Shows the **top predicted genre**
- Expandable details reveal the **top 3 predictions** with confidence scores

### 🌐 Full Web Interface
Built using **Next.js** with:
- Drag-and-drop upload
- Smooth animations
- Modern hero section design
- Fully responsive UI

### ⚡ High-Speed Backend
Powered by **FastAPI + ONNX Runtime** for optimized inference.

---

## 🧠 AI Models

This project uses the **GTZAN Music Genre Dataset** with 10 genres:

blues, classical, country, disco, hiphop,
jazz, metal, pop, reggae, rock

Two separate deep learning models were trained:

- **Audio Model** (mel-spectrogram-based)
- **Image Model** (trained on spectrogram images using ResNet18)

Both models are converted to **ONNX** format for production inference.

---

## 🔧 Technologies Used

### Frontend
- Next.js 13
- React
- Tailwind CSS
- Axios

### Backend
- FastAPI
- ONNX Runtime
- Librosa
- Pillow
- Python 3.10+

---
🔗 **Live Demo:** [music-genre-classification-demo]((https://music-genre-identification-model.vercel.app/))

## 💻 How to Run Locally

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/<your-username>/music-genre-classifier.git
cd music-genre-classifier

2️⃣ Setup the Backend
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app:app --reload --port 8000


Backend will start at:

http://localhost:8000

3️⃣ Setup the Frontend
cd frontend
npm install
npm run dev

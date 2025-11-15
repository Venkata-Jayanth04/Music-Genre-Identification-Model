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

## 🏗️ Project Structure

music-genre-classifier/
├── frontend/ → Next.js UI application
├── backend/ → FastAPI inference server
│ ├── model/ → ONNX model files
│ ├── app.py → Backend API
│ ├── Dockerfile → For Render deployment
│ └── requirements.txt
└── README.md


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


Frontend will start at:

http://localhost:3000

🌍 Deployment Guide
▶️ Frontend Deployment (Vercel)

Connect GitHub repo to Vercel

Set Root Directory to frontend/

Add environment variable:

NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com/predict

▶️ Backend Deployment (Render)

Create a Web Service

Choose root directory: backend/

Use Docker deploy (recommended)

Render builds and deploys automatically

📊 Supported Music Genres

Blues

Classical

Country

Disco

Hip Hop

Jazz

Metal

Pop

Reggae

Rock

🎨 Hero Image

A custom AI-generated illustration is used as the homepage hero image:

frontend/public/hero.png

📚 Future Enhancements

Real-time microphone audio input

Waveform visualization

Larger dataset integration

More detailed prediction analytics

Improved mobile UI

🤝 Contributing

Contributions, issues, and feature requests are welcome.
Feel free to open a pull request or start a discussion.

❤️ Acknowledgments

Dataset: GTZAN Music Genre Dataset

Tools: FastAPI, Next.js, ONNX Runtime, Librosa

📜 License

This project is licensed under the MIT License.


---

If you want, I can also generate:

✅ A shorter version  
✅ A more graphical/readable version  
✅ A README with badges and icons  
✅ A README with a demo GIF  

Just tell me!

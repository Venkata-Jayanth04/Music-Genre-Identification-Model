# Music-Genre-Identification-Model
🎵 Music Genre Classification Web App

A full-stack AI-powered application that predicts the genre of music from either:

🎧 Audio files (WAV / MP3)

🖼️ Spectrogram images (PNG / JPG)

This project uses Deep Learning, FastAPI, and Next.js to deliver fast, accurate predictions with a modern UI.

🚀 Features
🔊 Audio Classification

Upload a .wav or .mp3 file to get the predicted music genre.

🖼️ Spectrogram Image Classification

Upload spectrogram images and get precise genre predictions.

🎯 Top-3 Predictions

Shows the top genre

Expandable section reveals the top 3 predictions with confidence scores

🌐 Full Web Interface

Built using Next.js with:

Drag-and-drop upload

Smooth animations

Modern hero section design

Fully responsive UI

⚡ High-Speed Backend

Powered by FastAPI + ONNX Runtime for optimized inference.

🧠 AI Models

This project uses the GTZAN Music Genre Dataset with 10 genres:

blues, classical, country, disco, hiphop,
jazz, metal, pop, reggae, rock


Two models were trained:

🎧 Audio Model → Mel-spectrogram based

🖼️ Image Model → Spectrogram image classification (ResNet)

Both exported to ONNX format for deployment.

🏗️ Project Structure
music-genre-classifier/
 ├── frontend/              → Next.js UI
 ├── backend/               → FastAPI server + ONNX inference
 │    ├── model/            → genre_model.onnx
 │    ├── app.py
 │    ├── requirements.txt
 │    └── Dockerfile
 └── README.md

🔧 Tech Stack
Frontend

Next.js 13

React

Tailwind CSS

Axios

Backend

FastAPI

ONNX Runtime

Librosa

Pillow

💻 Running Locally
1️⃣ Clone the project
git clone https://github.com/<your-username>/music-genre-classifier.git
cd music-genre-classifier

2️⃣ Backend Setup
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app:app --reload --port 8000


Backend runs at:
👉 http://localhost:8000

3️⃣ Frontend Setup
cd frontend
npm install
npm run dev


Frontend runs at:
👉 http://localhost:3000

🌍 Deployment
Frontend → Vercel

Import GitHub repo

Set root directory to frontend/

Add environment variable:

NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com/predict

Backend → Render

Create a new Web Service

Set root directory to backend/

Choose Docker environment

Render auto-builds using the Dockerfile

📊 Supported Genres

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

Custom AI-generated illustration placed at:

frontend/public/hero.png


Displayed on the landing section of the site.

📚 Future Improvements

Microphone recording classification

Waveform visualization

Dataset expansion

Mobile drag-drop optimizations

Top-10 predictions

🤝 Contributing

Pull requests are welcome!
You can also open issues for UI enhancements, bugs, or new features.

❤️ Acknowledgments

Dataset: GTZAN Music Genre Classification Dataset
Tools: FastAPI, Next.js, PyTorch, ONNX Runtime

📜 License

MIT License

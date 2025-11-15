# backend/app.py
import os
import io
import logging
import tempfile
from typing import Optional

from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

import numpy as np
from PIL import Image
import librosa
import onnxruntime as ort

# logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("genre-api")

# -------------------------
# Model loading (robust)
# -------------------------
MODEL_PATH_ENV = os.environ.get("MODEL_PATH", None)

fallback_paths = [
    MODEL_PATH_ENV,
    "/app/model/genre_model.onnx",  # deploy/dockerd default
    os.path.join(os.path.dirname(__file__), "model", "genre_model.onnx"),  # backend/model/...
    os.path.join(os.getcwd(), "backend", "model", "genre_model.onnx"),
    os.path.join(os.getcwd(), "model", "genre_model.onnx"),
]
# remove None and duplicates while preserving order
seen = set()
fallback_paths = [p for p in fallback_paths if p and (p not in seen and not seen.add(p))]

sess = None
for p in fallback_paths:
    if p and os.path.exists(p):
        logger.info(f"Loading ONNX model from: {p}")
        sess = ort.InferenceSession(p, providers=["CPUExecutionProvider"])
        break

if sess is None:
    logger.error("ONNX model not found. Looked in:\n" + "\n".join([str(p) for p in fallback_paths]))
    raise FileNotFoundError(
        "ONNX model not found. Place model at backend/model/genre_model.onnx or set MODEL_PATH env var."
    )

# -------------------------
# Constants & helpers
# -------------------------
CLASS_NAMES = ["blues", "classical", "country", "disco", "hiphop", "jazz", "metal", "pop", "reggae", "rock"]
IMG_SIZE = 224
SR = 22050  # librosa sample rate
DURATION = 30.0  # seconds, GTZAN tracks are 30s

def make_mel_spectrogram(y: np.ndarray, sr: int, n_mels=128, n_fft=2048, hop_length=512):
    S = librosa.feature.melspectrogram(y=y, sr=sr, n_mels=n_mels, n_fft=n_fft, hop_length=hop_length)
    S_db = librosa.power_to_db(S, ref=np.max)
    return S_db

def preprocess_pil(img_pil: Image.Image, img_size: int = IMG_SIZE) -> np.ndarray:
    """
    Convert PIL image to normalized CHW float32 numpy array suitable for ONNX input.
    """
    img = img_pil.convert("RGB").resize((img_size, img_size))
    arr = np.asarray(img).astype(np.float32) / 255.0
    # normalize with ImageNet mean/std
    mean = np.array([0.485, 0.456, 0.406], dtype=np.float32)
    std  = np.array([0.229, 0.224, 0.225], dtype=np.float32)
    arr = (arr - mean) / std
    arr = np.transpose(arr, (2, 0, 1))  # HWC -> CHW
    arr = np.expand_dims(arr, 0).astype(np.float32)  # add batch dim
    return arr

def run_inference(input_tensor: np.ndarray):
    """
    Run ONNX inference; returns probabilities (1D numpy array).
    """
    outputs = sess.run(None, {"input": input_tensor})
    probs = np.asarray(outputs[0]).flatten()
    # sometimes ONNX outputs logits; apply softmax for probabilities
    # To be safe, compute numerically stable softmax:
    e = np.exp(probs - np.max(probs))
    probs = e / e.sum()
    return probs

# -------------------------
# FastAPI app
# -------------------------
app = FastAPI(title="Music Genre Inference API")

# allow all origins during dev; restrict in production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"status": "ok", "model_loaded": True, "classes": CLASS_NAMES}

@app.post("/predict")
async def predict(file: UploadFile = File(...), mode: str = Form(...)):
    """
    Expects multipart/form-data:
      - file: uploaded audio (wav/mp3) or image (png/jpg)
      - mode: 'audio' or 'image'

    Returns JSON: {pred_idx, pred_class, probs}
    """
    try:
        if mode not in ("audio", "image"):
            return JSONResponse({"error": "mode must be 'audio' or 'image'."}, status_code=400)

        contents = await file.read()
        if mode == "audio":
            # write to a temp file because librosa.load works with file paths
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
                tmp.write(contents)
                tmp.flush()
                tmp_path = tmp.name
            try:
                # load audio segment (full duration or clipped)
                y, sr = librosa.load(tmp_path, sr=SR, mono=True, duration=DURATION)
            finally:
                try:
                    os.remove(tmp_path)
                except OSError:
                    pass
            if y is None or y.size == 0:
                return JSONResponse({"error": "Could not load audio or audio empty."}, status_code=400)

            S_db = make_mel_spectrogram(y, sr, n_mels=128)
            arr = (S_db - S_db.min()) / (S_db.max() - S_db.min() + 1e-9)
            arr = (arr * 255).astype(np.uint8)
            img = Image.fromarray(arr).convert("RGB")

        else:  # mode == "image"
            try:
                img = Image.open(io.BytesIO(contents)).convert("RGB")
            except Exception as e:
                return JSONResponse({"error": f"Invalid image file: {e}"}, status_code=400)

        # preprocess and run model
        x = preprocess_pil(img, IMG_SIZE)
        probs = run_inference(x)
        top_idx = int(np.argmax(probs))
        return JSONResponse({"pred_idx": top_idx, "pred_class": CLASS_NAMES[top_idx], "probs": probs.tolist()})

    except Exception as ex:
        logger.exception("Error during /predict")
        return JSONResponse({"error": str(ex)}, status_code=500)

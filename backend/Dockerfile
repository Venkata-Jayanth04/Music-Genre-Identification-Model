# backend/Dockerfile
FROM python:3.10-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . /app
# By default we expect the ONNX model at /app/model/genre_model.onnx in the container
ENV MODEL_PATH=/app/model/genre_model.onnx

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]

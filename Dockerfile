FROM node:24-alpine AS frontend
WORKDIR /frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM python:3.12-slim
WORKDIR /app
ENV FRONTEND_DIR=/app/ui
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt \
    && useradd --uid 10001 --create-home memory \
    && mkdir -p /app/state && chown memory:memory /app/state
COPY app/ ./
COPY --from=frontend /frontend/dist/ ./ui/
COPY frontend/licenses/ ./ui/licenses/
USER memory
EXPOSE 8080
CMD ["uvicorn", "gateway:app", "--host", "0.0.0.0", "--port", "8080", "--no-access-log"]

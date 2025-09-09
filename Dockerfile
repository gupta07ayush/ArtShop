# --- Stage 1: Build frontend ---
FROM node:20-slim AS frontend

WORKDIR /app/frontend

# Copy package files and install dependencies
COPY frontend/package*.json ./

# Skip Rollup native module to avoid Linux Docker bug
ENV ROLLUP_SKIP_NATIVE=1

RUN npm install --force

# Copy frontend source code
COPY frontend/ .

# Build React app
RUN npm run build

# --- Stage 2: Backend + final image ---
FROM python:3.11-slim

WORKDIR /app

# Install Python dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source code
COPY backend/ .

# Copy React build from frontend stage
COPY --from=frontend /app/frontend/dist /app/frontend/dist

# Collect static files
RUN python manage.py collectstatic --noinput

# Expose Django port
EXPOSE 8000

# Run Django server
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]

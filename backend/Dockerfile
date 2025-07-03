# Multi-stage build for production optimization
FROM python:3.12-slim as base



# Set work directory
WORKDIR /app

# Copy and install Python dependencies
COPY . .
RUN pip install --no-cache-dir -r requirements.txt




CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]


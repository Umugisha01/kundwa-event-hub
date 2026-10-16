#!/usr/bin/env bash
# Exit immediately if a command exits with a non-zero status
set -o errexit

echo "==> Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

echo "==> Running database migrations..."
python manage.py migrate --no-input

echo "==> Collecting static assets via WhiteNoise..."
python manage.py collectstatic --no-input

echo "==> Seeding initial database records (idempotent)..."
python manage.py seed_db

echo "==> Loading production data export..."
if [ -f "local_data_export.json" ]; then
    python manage.py loaddata local_data_export.json || true
fi

echo "==> Build finished successfully!"

#!/bin/bash
set -e

# Prevent PEP 668 error (externally-managed-environment) in modern Vercel / uv build environments
export PIP_BREAK_SYSTEM_PACKAGES=1

echo "===> Python version:"
python3 --version || python --version

echo "===> Installing dependencies..."
if command -v uv &> /dev/null; then
    echo "Found uv. Installing dependencies with uv pip install..."
    uv pip install --system -r requirements.txt || python3 -m pip install --break-system-packages -r requirements.txt
else
    echo "Installing dependencies with pip..."
    python3 -m pip install --break-system-packages -r requirements.txt || python3 -m pip install -r requirements.txt
fi

echo "===> Collecting static files..."
python3 manage.py collectstatic --noinput --clear

echo "===> Build completed successfully!"

#!/bin/sh
set -e

CERT_DIR=/etc/nginx/certs
CERT_FILE="$CERT_DIR/server-cert.pem"
KEY_FILE="$CERT_DIR/server-key.pem"

mkdir -p "$CERT_DIR"

if [ -z "$SERVER_IP" ]; then
  echo "WARNUNG: SERVER_IP nicht gesetzt, Zertifikat mit CN=localhost wird erstellt"
  CN_VAL="localhost"
  SAN_OPT=""
else
  echo "Erstelle Zertifikat für IP: $SERVER_IP"
  CN_VAL="$SERVER_IP"
  SAN_OPT="-addext subjectAltName=IP:$SERVER_IP"
fi

if [ ! -f "$CERT_FILE" ] || [ ! -f "$KEY_FILE" ]; then
  openssl req -x509 -nodes -newkey rsa:2048 \
    -keyout "$KEY_FILE" \
    -out "$CERT_FILE" \
    -days 365 \
    -subj "/CN=$CN_VAL" \
    $SAN_OPT
else
  echo "Zertifikat existiert bereits, verwende vorhandene Dateien."
fi

nginx -g "daemon off;"
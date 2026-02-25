# Firmware-Monitoring für Cisco Netzwerkgeräte

Dieses Repository enthält die prototypische Umsetzung einer Plattform zur zentralen Erfassung und Überwachung von Firmware-Versionen in Cisco-basierten Netzwerkumgebungen sowie den Abgleich mit bekannten Sicherheitsinformationen. Ziel ist es, Firmware-Stände automatisiert zu erfassen, strukturiert abzulegen und daraus einen nachvollziehbaren Überblick über potenzielle Risiken und erforderliche Updates zu ermöglichen.

## Starten (Docker Compose)
```bash
git clone https://github.com/rafael-1503/firmware-monitoring-tool
cd firmware-monitoring-tool
nano .env
docker compose up -d

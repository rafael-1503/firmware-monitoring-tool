# Erste Stage
FROM python:3.12-slim AS builder

RUN apt-get update && apt-get install -y --no-install-recommends build-essential python3-dev gcc && rm -rf /var/lib/apt/lists/*

WORKDIR /app

#pip install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install pyinstaller

#Skripte kopieren
COPY jobs .
COPY utils ./utils
COPY app.py .

#Binary erzeugen
RUN pyinstaller --onefile checkFirmware.py
RUN pyinstaller --onefile scanNetwork.py
RUN pyinstaller --onefile checkCiscoVulnerabilities.py
RUN pyinstaller --onefile app.py


# Zweite runtime Stage
FROM python:3.12-slim

WORKDIR /app

#Binaries kopieren
COPY --from=builder /app/dist/checkFirmware /app/jobs/checkFirmware
COPY --from=builder /app/dist/scanNetwork /app/jobs/scanNetwork
COPY --from=builder /app/dist/checkCiscoVulnerabilities /app/jobs/checkCiscoVulnerabilities
COPY --from=builder /app/dist/app /app/app

#Ping, Cron & PS installieren
RUN apt-get update && apt-get install -y iputils-ping cron procps && rm -rf /var/lib/apt/lists/*

#cronjob
COPY crontab.txt /etc/cron.d/scripts-cron

RUN apt-get update && apt-get install -y dos2unix && dos2unix /etc/cron.d/scripts-cron

RUN chmod 0644 /etc/cron.d/scripts-cron

RUN touch /var/log/cron.log

EXPOSE 5000

CMD ["sh", "-c", "cron && /app/app"]
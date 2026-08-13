# Logistics & Automotive Dispatcher Control Center Guide & CJM Scenario

This document defines the dispatcher workflow, carrier safety verification, and Customer Journey Map (CJM) for **Hermes Connect: Logistics & Car Hauler Edition**.

---

## 1. Dispatcher Workflow & Core Problem Statement

Freight brokers and car hauler dispatchers face high friction:
- Manually checking FMCSA SAFER databases for carrier safety ratings and active insurance limits ($1M BIPD, $250k Cargo).
- Slow rate negotiations and manual Rate Confirmation PDF generation.
- Lack of real-time GPS tracking and driver HOS (Hours of Service) ELD compliance.

**Hermes Connect** solves this with an **Autonomous AI Dispatcher Console**.

```
[ Step 1: Load Ingestion ] ➔ [ Step 2: SAFER Compliance Audit ] ➔ [ Step 3: RPM Rate Match ] ➔ [ Step 4: Instant RateCon & GPS Track ]
```

---

## 2. Dispatcher CJM Scenario

### Step 1: Automated Load Ingestion (DAT / Truckstop / Load Board Sync)
- **Action**: Ingest load parameters (Origin: Chicago IL, Destination: Dallas TX, Equipment: 9-Car Auto Transport, Weight: 42,000 lbs).
- **Hermes Action**: Calculates market rate per mile ($3.85/mi vs national average $3.37/mi).

### Step 2: SAFER & Insurance Audit
- **Action**: Input Carrier MC / DOT Number.
- **Hermes Action**: Live query against FMCSA SAFER. Validates SATISFACTORY safety rating and $1,000,000 active BIPD insurance.

### Step 3: Instant Rate Confirmation & E-Signature
- **Action**: Click "Issue RateCon".
- **Hermes Action**: Generates legally binding PDF Rate Confirmation with unique load reference ID and sends via SMS/Email to driver.

### Step 4: Real-time GPS Geofence & ELD HOS Monitoring
- **Action**: Monitor live driver status.
- **Hermes Action**: Connects Samsara / Motive ELD feed. Alerts dispatcher when driver enters pickup/delivery geofence or approaches HOS limit.

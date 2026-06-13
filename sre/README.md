# SRE Incidents, Alerts & Runbooks

Welcome to the SRE Incident Management dashboard and workspace. This module provides configurations, dashboards, alerting structures, and simulation scripts designed to replicate real-world cloud infrastructure outages.

## 1. Runbooks
The repository contains the following step-by-step incident response manuals:
- **[Booking Service Latency Runbook](runbooks/booking-latency.md)**: Handling response times exceeding thresholds (P2 incident).
- **[Payment Service OOMKilled Runbook](runbooks/payment-oom.md)**: Troubleshooting memory leaks and pod crashes (P1 incident).

---

## 2. Setting Up the Simulation (Local Development)

To run the simulation locally on your machine:

### Step A: Start the Target Service
Start any of the microservices, e.g., the Booking Service:
```bash
cd src/booking-service
npm install
npm run start
```
*The service will start on port `3000`.*

### Step B: Trigger Incidents using the Simulator Script
Make the incident trigger script executable:
```bash
chmod +x sre/scripts/trigger-incident.sh
```

#### Incident Scenario 1: Latency Spike in Bookings
Trigger a slow database query simulation:
```bash
./sre/scripts/trigger-incident.sh -s http://localhost:3000 -t latency -d 4000
```
This forces the request to take 4 seconds. In Prometheus, this triggers the `MicroserviceHighLatencyP95` alert.

#### Incident Scenario 2: Payment Service Outage (Error Spike)
Toggle the internal error simulation flag:
```bash
./sre/scripts/trigger-incident.sh -s http://localhost:3000 -t error -e true
```
All subsequent business routes (e.g., `GET /bookings`) will now return an HTTP 500 error. This triggers the `MicroserviceHigh5xxRate` alert.

To disable the error state and restore service:
```bash
./sre/scripts/trigger-incident.sh -s http://localhost:3000 -t error -e false
```

#### Incident Scenario 3: Memory Exhaustion (OOMKilled)
Trigger successive memory allocations to simulate a memory leak:
```bash
# Allocate 80MB of memory
./sre/scripts/trigger-incident.sh -s http://localhost:3000 -t leak -m 80
```
Run it multiple times. In a containerized environment (AKS), the pod memory consumption will eventually hit its limit and trigger the `ContainerMemoryLeakWarning` alert before Kubernetes OOM-kills the pod (Exit Code 137).

To clear the leak buffer:
```bash
./sre/scripts/trigger-incident.sh -s http://localhost:3000 -t reset-leak
```

---

## 3. Metrics and Alerts Visualizations
- Prometheus scrapers will fetch metrics from `/metrics`.
- The alerts are managed using the rules defined in [prometheus-rules.yaml](../monitoring/prometheus-rules.yaml).
- The metrics can be monitored visually using the custom Grafana JSON Dashboard defined in [microservices-dashboard.json](../monitoring/grafana-dashboards/microservices-dashboard.json).

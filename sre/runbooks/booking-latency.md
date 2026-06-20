# SRE Runbook: Booking Service Latency Outage

- **Incident Severity**: High / P2
- **Related Service**: `booking-service`
- **Triggering Alert**: `MicroserviceHighLatencyP95` (P95 Latency > 2.0s for > 2m)

---

## 1. Symptoms & Impact
- Consumers experience slow booking creations and checkouts.
- Increased queue rates and timeout exceptions in upstream API gateways.
- Downstream business metrics (revenue, active rides) show a drop.

---

## 2. Immediate Triage Steps

### Step A: Verify the Alert
Verify the metric in Grafana under the **95th Percentile Latency (p95)** panel, or run this Prometheus query:
```promql
histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le, app))
```

### Step B: Identify Affected Service & Pods
Identify if the latency is service-wide or isolated to specific pods:
```bash
kubectl get pods -n prod -l app=booking-service
```
Check the endpoints list to make sure all endpoints are ready:
```bash
kubectl get endpoints -n prod booking-service
```

### Step C: Analyze Container Logs
Retrieve logs from the booking service to check for slow queries, timeouts, or errors:
```bash
kubectl logs -n prod -l app=booking-service --tail=200 --timestamps
```
Check if there are lines indicating connection timeouts to databases or payment dependencies:
`e.g., "ECONNRESET", "ETIMEDOUT", "ESOCKETTIMEDOUT"`

---

## 3. Mitigation Procedures

### Option A: Force Scale-Up (If HPA is slow or maxed)
If traffic is high and the service is resource-constrained, manually increase the replica size to absorb the load:
```bash
kubectl scale deployment -n prod booking-service --replicas=6
```

### Option B: Check for Resource Limits / Throttling
Check if CPU throttling is occurring on the pods:
```bash
kubectl top pods -n prod -l app=booking-service
```
If pods are running near their CPU limit (500m), they may be throttled. Increase resource limits in `helm/environments/prod-values.yaml`:
```yaml
resources:
  limits:
    cpu: 1000m
    memory: 512Mi
```
And trigger an Argo CD sync.

### Option C: Restart Deployment (Circuit Breaker / Leak Clear)
If a process lock or downstream connection pool is stuck, trigger a rolling restart:
```bash
kubectl rollout restart deployment -n prod booking-service
```

---

## 4. Troubleshooting Simulations
If this latency is triggered via the simulated endpoint (`/simulate/latency`), you can reset the state by stopping the load simulation runner or killing the load test script.

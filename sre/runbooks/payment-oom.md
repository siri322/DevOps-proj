# SRE Runbook: Payment Pod Memory Leak / OOMKilled Crash

- **Incident Severity**: Critical / P1
- **Related Service**: `payment-service`
- **Triggering Alert**: `ContainerMemoryLeakWarning` (Memory utilization > 90% for > 3m) or OOM crash events.

---

## 1. Symptoms & Impact
- Core payments begin failing, causing users to be unable to complete transactions.
- Pods are entering `CrashLoopBackOff` state.
- Inspection of pods shows exit status `137` (indicates Out of Memory - OOMKilled).

---

## 2. Immediate Triage Steps

### Step A: Check Pod Status & Restarts
Identify which pods are crashing and inspect their restart counts:
```bash
kubectl get pods -n prod -l app=payment-service
```

### Step B: Identify Exit Code
Verify if the pod was killed due to Out of Memory (Exit Code 137):
```bash
kubectl describe pod -n prod -l app=payment-service | grep -A 10 "Last State"
```
Look for:
```text
Reason:          OOMKilled
Exit Code:       137
```

### Step C: Analyze Memory Metrics
Review the **Pod Memory Working Set** panel in the Grafana Dashboard, or query Prometheus:
```promql
sum(container_memory_working_set_bytes{container="payment-service"}) by (pod)
```
Check if the memory curve has a steady linear increase (classic sign of a memory leak).

---

## 3. Mitigation Procedures

### Option A: Rolling Restart (Temporary Relief)
A rolling restart will replace the leaking pods with fresh ones, resetting the memory footprint and restoring service immediately:
```bash
kubectl rollout restart deployment -n prod payment-service
```

### Option B: Increase Memory Limits (Vertical Scaling)
If the application needs more memory to process high throughput, increase the memory limit in `helm/environments/prod-values.yaml`:
```yaml
resources:
  limits:
    cpu: 500m
    memory: 1024Mi # Doubled memory limit from 512Mi
```
Sync the changes via GitOps (Argo CD).

### Option C: Simulated Incident Recovery
If this incident is a simulation triggered via the `/simulate/leak` endpoint, you can trigger garbage collection and clear the buffer array by calling the reset endpoint:
```bash
curl -X POST http://<payment-service-url>/simulate/reset-leak
```
This forces the service to clear its mock memory cache.

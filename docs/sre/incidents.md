# Incident Scenarios And Runbooks

## Incident 1: Payment Authorization Failures

Severity: SEV2

Symptoms:

- `payment` 5xx rate exceeds 5%.
- Payment authorization throughput drops.
- Consumer booking completion is delayed.

Triage:

1. Check Grafana `Mobility Platform SRE Overview`.
2. Check Prometheus alert labels for service and namespace.
3. Inspect pods: `kubectl get pods -n mobility-prod -l app.kubernetes.io/name=payment`.
4. Review recent deployment: `argocd app history mobility-platform-prod`.
5. Check logs: `kubectl logs -n mobility-prod deploy/payment --tail=200`.

Mitigation:

- Roll back to the last healthy image through Argo CD if the issue started after deployment.
- Scale payment replicas if saturation is visible.
- Disable traffic to affected ingress path only if errors are causing broader platform instability.

Post-incident actions:

- Add regression tests for the failed path.
- Confirm Trivy/SAST/DAST coverage did not miss a preventable defect.
- Update the dashboard if detection lag was too high.

## Incident 2: Booking Service Latency Or Errors

Severity: SEV2

Symptoms:

- Booking requests fail or remain in `REQUESTED`.
- Error-rate alert fires for `booking-service`.
- Consumer app remains healthy but business flow is degraded.

Triage:

1. Compare `consumer_ride_requests_total` and `bookings_created_total`.
2. Check pod restarts and CPU/memory throttling.
3. Review Argo CD diff for recent Helm value changes.
4. Run a synthetic booking request against the environment ingress.

Mitigation:

- Roll back the booking image.
- Increase replicas if load-related.
- Patch resource limits if pods are being OOMKilled.

## Incident 3: AKS Node Pressure

Severity: SEV1 if multiple services are unavailable, otherwise SEV2

Symptoms:

- Multiple pods pending or evicted.
- Grafana shows restart spikes.
- AKS node CPU/memory pressure events appear.

Triage:

1. Run `kubectl get nodes`.
2. Run `kubectl describe node <node-name>`.
3. Check cluster autoscaler events.
4. Confirm whether a noisy deployment caused sudden resource demand.

Mitigation:

- Scale node pool or adjust HPA/resource requests.
- Roll back the workload causing pressure.
- Move non-critical workloads out of the affected namespace.

## Incident 4: ACR Pull Failures

Severity: SEV2

Symptoms:

- Pods show `ImagePullBackOff`.
- New deployment cannot start.
- Existing pods remain healthy until rescheduled.

Triage:

1. Verify image tag exists in ACR.
2. Check AKS kubelet identity has `AcrPull`.
3. Confirm GitHub Actions pushed all four service images.
4. Inspect pod events with `kubectl describe pod`.

Mitigation:

- Re-run image publish stage for missing tags.
- Restore `AcrPull` role assignment from Terraform.
- Pin Helm values to the previous known-good image tag.

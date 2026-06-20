# SRE Use Cases

## 1. Golden Path Deployment

As the SRE owner, promote a tested image from Dev to UAT and then Prod using the reusable GitHub Actions workflow. Validate that Argo CD syncs the target environment and that Grafana shows healthy scrape targets.

Success criteria:

- Pipeline passes lint, unit tests, app tests, SAST, DAST, Terraform checks, and Trivy.
- Images are pushed to ACR.
- Argo CD application is synced and healthy.
- `/healthz`, `/readyz`, and `/metrics` respond for all services.

## 2. Image Vulnerability Gate

Introduce or detect a vulnerable container package. The Trivy stage should fail on high or critical vulnerabilities before the image is pushed or promoted.

Success criteria:

- Trivy produces SARIF output.
- GitHub code scanning receives the result.
- Deployment is blocked until the vulnerability is fixed or explicitly risk-accepted.

## 3. Booking Degradation

Simulate elevated 5xx responses from `booking-service`. Prometheus should trigger `MobilityHighHttpErrorRate`, and the SRE should inspect logs, pod health, recent deployments, and Argo CD history.

Success criteria:

- Alert fires after 10 minutes of sustained error rate.
- Rollback or forward fix restores SLO.
- Incident notes capture customer impact and follow-up actions.

## 4. Pod CrashLoop

Deploy a bad image tag or invalid runtime configuration. Kubernetes restarts the affected pods and Prometheus fires `MobilityPodCrashLooping`.

Success criteria:

- Alert identifies namespace and pod.
- SRE confirms the failing deployment revision.
- Rollback through Argo CD restores healthy pods.

## 5. Environment Drift

Manually modify a Kubernetes object outside GitOps. Argo CD should show drift and self-heal for Dev/UAT. Prod has pruning disabled by default and should require a controlled review.

Success criteria:

- Drift is visible in Argo CD.
- Desired state comes from Git.
- Manual change is either reverted or committed properly.

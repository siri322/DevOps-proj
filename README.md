# Mobility Platform DevOps/SRE Project

This repository is an end-to-end starter platform for four microservices:

- `payment`
- `consumer-app`
- `driver-app`
- `booking-service`

It includes service code, unit/application tests, Docker images, reusable GitHub Actions CI/CD, ACR image publishing, Trivy image scanning, AKS deployment with Helm and Argo CD, Terraform infrastructure, Checkov/Snyk security checks, and Prometheus/Grafana observability.

## Local Development

```bash
npm install
npm run lint
npm test
npm run test:app
docker compose up --build
```

Service endpoints:

- Payment: `http://localhost:3001/healthz`
- Consumer: `http://localhost:3002/healthz`
- Driver: `http://localhost:3003/healthz`
- Booking: `http://localhost:3004/healthz`
- Prometheus: `http://localhost:9090`

## CI/CD

Reusable workflow:

- `.github/workflows/reusable-ci-cd.yml`

Environment wrappers:

- `.github/workflows/dev.yml`
- `.github/workflows/uat.yml`
- `.github/workflows/prod.yml`

Pipeline stages:

- Lint
- Unit tests
- Application tests
- CodeQL SAST
- Snyk dependency scan
- Terraform security checks with Checkov and Snyk IaC
- Docker image build
- Trivy image scan
- Push to Azure Container Registry
- OWASP ZAP DAST baseline
- Argo CD sync

Required GitHub environment secrets:

- `AZURE_CLIENT_ID`
- `AZURE_TENANT_ID`
- `AZURE_SUBSCRIPTION_ID`
- `ACR_NAME`
- `ACR_LOGIN_SERVER`
- `ARGOCD_SERVER`
- `ARGOCD_AUTH_TOKEN`

Optional secret:

- `SNYK_TOKEN`

## Infrastructure

Terraform environments live under:

- `terraform/environments/dev`
- `terraform/environments/uat`
- `terraform/environments/prod`

Each environment creates:

- Azure resource group
- Azure Container Registry
- AKS cluster
- Log Analytics workspace
- AKS-to-ACR pull permissions

Example:

```bash
cd terraform/environments/dev
terraform init
terraform plan -var="acr_name=<globally-unique-acr-name>"
terraform apply -var="acr_name=<globally-unique-acr-name>"
```

## Kubernetes And GitOps

Helm chart:

- `helm/mobility-platform`

Argo CD applications:

- `argocd/environments/dev/application.yaml`
- `argocd/environments/uat/application.yaml`
- `argocd/environments/prod/application.yaml`

Before first use, update the Argo CD `repoURL` placeholders to your GitHub repository.

## Observability

Prometheus and Grafana setup is in `observability/`.

Install the stack:

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm upgrade --install kube-prometheus-stack prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --create-namespace \
  --values observability/kube-prometheus-stack-values.yaml
kubectl apply -f observability/mobility-alert-rules.yaml
```

Import the dashboard from `observability/grafana-dashboard-mobility.json`.

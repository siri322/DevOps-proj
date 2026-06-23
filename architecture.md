# Mobility Platform: End-to-End Architecture & Setup

This document outlines the current state of the Mobility Platform's architecture, local development environment, and CI/CD pipelines.

## 1. Microservices Architecture

The platform is designed as a suite of four backend microservices. These are built using Node.js and Express.js, providing RESTful APIs. 

*   **Payment Service** (`services/payment`): Handles payment authorizations.
*   **Consumer App** (`services/consumer-app`): Customer-facing backend handling ride requests.
*   **Driver App** (`services/driver-app`): Driver-facing backend handling driver availability and status.
*   **Booking Service** (`services/booking-service`): Orchestrates ride matching and booking creation.

### API Standards
All services adhere to the following endpoint standards for observability and orchestration:
*   `GET /healthz`: Health check endpoint to verify the service is running.
*   `GET /readyz`: Readiness probe to signal when the service can accept traffic.
*   `GET /metrics`: Prometheus metrics endpoint tracking request counts and latencies.

## 2. Local Development Environment

Currently, the primary way the application is run and tested is locally on your machine.

*   **Docker Compose**: The `docker-compose.yml` file at the root handles spinning up all 4 microservices simultaneously.
*   **Port Mapping**: When running via Compose, the services are mapped to your local machine as follows:
    *   Payment: `http://localhost:3001`
    *   Consumer: `http://localhost:3002`
    *   Driver: `http://localhost:3003`
    *   Booking: `http://localhost:3004`
*   **Observability**: A local **Prometheus** container is included in the Compose stack, mapped to `http://localhost:9090`, configured to scrape the `/metrics` endpoints of all services.
*   **Kubernetes (Local)**: A `minikube` (or `kind`) cluster is currently running on the local machine to allow testing Kubernetes deployments (Helm charts, Argo CD) before moving to the cloud.

## 3. CI/CD Pipeline (GitHub Actions)

We have a robust, fully-functioning CI/CD pipeline built with GitHub Actions. 

### The Reusable Pipeline (`.github/workflows/reusable-ci-cd.yml`)
The core pipeline is written as a reusable workflow to ensure consistency across environments. It runs the following jobs:
1.  **Validate**: Runs `npm ci`, code linting, unit tests, application tests, and SAST scanning via CodeQL (v4).
2.  **Terraform Security**: Runs `terraform fmt` and `checkov` to scan Infrastructure as Code for misconfigurations (currently set to `soft_fail` so it doesn't block the build).
3.  **Build, Scan, Push**: Builds Docker images for all 4 microservices in parallel (matrix build), scans them for vulnerabilities using Trivy (set to report-only `exit-code: 0` for dev), and optionally pushes them to a container registry.
4.  **Argo CD Deploy**: Handles GitOps deployment by syncing the target Argo CD application (currently disabled by default).
5.  **DAST**: Dynamic Application Security Testing via ZAP (runs post-deployment).

### Environment Workflows
The reusable pipeline is triggered by environment-specific wrapper workflows:
*   **`dev.yml`**: Triggers on pushes to the `main` branch. 
*   **`uat.yml`**: Triggered manually or via tags.
*   **`prod.yml`**: Triggered manually.

All of these can be triggered **manually** via the GitHub Actions UI ("Run workflow" button) thanks to the `workflow_dispatch` trigger, allowing you to pass custom image tags and toggle the deployment step.

## 4. Future Cloud Infrastructure (Azure)

While the project is currently running locally, the groundwork for a cloud deployment is already laid out.

*   **Terraform**: The `terraform/` directory contains definitions for provisioning Azure resources (AKS for Kubernetes, ACR for the container registry).
*   **Pipeline Hooks**: The GitHub Actions pipeline contains conditional steps designed to log into Azure (`azure/login`), authenticate with ACR, push Docker images, and trigger Argo CD syncs. These steps activate dynamically only when the required Repository Secrets (e.g., `AZURE_CLIENT_ID`, `ACR_NAME`, `ARGOCD_SERVER`) are provided.

Until Azure is provisioned, the pipeline smartly bypasses these cloud-specific steps while still running all local validation, security scans, and local image builds.

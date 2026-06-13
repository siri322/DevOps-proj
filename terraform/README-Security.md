# IaC Security Scanning: Terraform

For ensuring security compliance of our infrastructure code (AKS, ACR, VNet), we use two tools: **Checkov** and **Snyk**.

## 1. Checkov (Static Analysis)
Checkov scans cloud infrastructure configurations for security and compliance misconfigurations.

### Run Checkov Locally
Ensure you have checkov installed (`pip install checkov` or `brew install checkov`).

Run the following command from the root of the project:
```bash
checkov -d terraform/ --config-file terraform/.checkov.yaml
```

---

## 2. Snyk (IaC Scan)
Snyk inspects Terraform files for configuration issues and security vulnerabilities.

### Run Snyk Locally
Ensure you have the Snyk CLI installed (`npm install -g snyk` or `brew tap snyk/store && brew install snyk-cli`) and authenticated (`snyk auth`).

Run the scan:
```bash
snyk iac test terraform/
```

To output results in JSON or HTML formats for audits:
```bash
snyk iac test terraform/ --json > snyk-report.json
```

---

## CI/CD Pipeline Integration
Both tools are run automatically within the GitHub Actions runner environment:
- **Checkov Action**: Runs on every pull request targeting `dev`, `uat`, and `prod`.
- **Snyk IAC Action**: Scans the configurations and alerts on critical risk profiles before changes are pushed to deployment states.

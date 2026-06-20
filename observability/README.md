# Observability

Install the Prometheus and Grafana stack into AKS:

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
helm upgrade --install kube-prometheus-stack prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --create-namespace \
  --values observability/kube-prometheus-stack-values.yaml
kubectl apply -f observability/mobility-alert-rules.yaml
```

Import `observability/grafana-dashboard-mobility.json` or package it as a Grafana sidecar ConfigMap.

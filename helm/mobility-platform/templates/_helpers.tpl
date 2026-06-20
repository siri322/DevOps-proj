{{- define "mobility-platform.name" -}}
{{- .Chart.Name | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "mobility-platform.labels" -}}
app.kubernetes.io/part-of: {{ include "mobility-platform.name" . }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
helm.sh/chart: {{ .Chart.Name }}-{{ .Chart.Version | replace "+" "_" }}
environment: {{ .Values.global.environment }}
{{- end -}}

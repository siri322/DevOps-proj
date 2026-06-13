variable "project_name" {
  type        = string
  description = "The prefix name for all resources in this deployment."
  default     = "devops-microservices"
}

variable "environment" {
  type        = string
  description = "Environment name (e.g., dev, uat, prod)"
  default     = "dev"
}

variable "location" {
  type        = string
  description = "Azure region where resources will be created."
  default     = "East US"
}

variable "kubernetes_version" {
  type        = string
  description = "The Kubernetes version for the AKS cluster."
  default     = "1.28.3"
}

variable "node_count" {
  type        = number
  description = "Number of worker nodes in the default node pool."
  default     = 2
}

variable "vm_size" {
  type        = string
  description = "VM size for worker nodes."
  default     = "Standard_DS2_v2"
}

variable "acr_sku" {
  type        = string
  description = "SKU of the Azure Container Registry."
  default     = "Standard"
}

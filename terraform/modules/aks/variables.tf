variable "environment" {
  type        = string
  description = "Environment name."
}

variable "location" {
  type        = string
  description = "Azure region."
}

variable "resource_group_name" {
  type        = string
  description = "Resource group name."
}

variable "cluster_name" {
  type        = string
  description = "AKS cluster name."
}

variable "acr_name" {
  type        = string
  description = "Globally unique Azure Container Registry name."
}

variable "kubernetes_version" {
  type        = string
  description = "AKS Kubernetes version."
  default     = null
}

variable "node_count" {
  type        = number
  description = "Default node pool node count."
  default     = 2
}

variable "node_vm_size" {
  type        = string
  description = "Default node pool VM size."
  default     = "Standard_D2s_v5"
}

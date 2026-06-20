variable "location" {
  type        = string
  description = "Azure region."
  default     = "eastus"
}

variable "acr_name" {
  type        = string
  description = "Globally unique ACR name for prod."
}

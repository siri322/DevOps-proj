output "acr_login_server" {
  description = "ACR login server."
  value       = azurerm_container_registry.this.login_server
}

output "aks_cluster_name" {
  description = "AKS cluster name."
  value       = azurerm_kubernetes_cluster.this.name
}

output "resource_group_name" {
  description = "Resource group name."
  value       = azurerm_resource_group.this.name
}

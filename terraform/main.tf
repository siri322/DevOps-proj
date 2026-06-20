resource "random_id" "dns_prefix" {
  byte_length = 4
}

# Resource Group
resource "azurerm_resource_group" "rg" {
  name     = "rg-${var.project_name}-${var.environment}"
  location = var.location

  tags = {
    Environment = var.environment
    Project     = var.project_name
    ManagedBy   = "Terraform"
  }
}

# Azure Container Registry
resource "azurerm_container_registry" "acr" {
  name                = "acr${replace(var.project_name, "-", "")}${var.environment}"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  sku                 = var.acr_sku
  admin_enabled       = true # Required for simple demo authentications, can be overridden by managed identity

  tags = {
    Environment = var.environment
    Project     = var.project_name
  }
}

# Virtual Network
resource "azurerm_virtual_network" "vnet" {
  name                = "vnet-${var.project_name}-${var.environment}"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  address_space       = ["10.240.0.0/16"]

  tags = {
    Environment = var.environment
    Project     = var.project_name
  }
}

# Subnet for AKS Node Pool
resource "azurerm_subnet" "aks_subnet" {
  name                 = "snet-aks-${var.environment}"
  resource_group_name  = azurerm_resource_group.rg.name
  virtual_network_name = azurerm_virtual_network.vnet.name
  address_prefixes     = ["10.240.0.0/22"]
}

# AKS Cluster
resource "azurerm_kubernetes_cluster" "aks" {
  name                = "aks-${var.project_name}-${var.environment}"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  dns_prefix          = "${var.project_name}-${var.environment}-${random_id.dns_prefix.hex}"
  kubernetes_version  = var.kubernetes_version

  default_node_pool {
    name            = "default"
    node_count      = var.node_count
    vm_size         = var.vm_size
    vnet_subnet_id  = azurerm_subnet.aks_subnet.id
    os_disk_size_gb = 30

    # Enable Auto-scaling option (standard in UAT/Prod)
    enable_auto_scaling = var.environment == "dev" ? false : true
    min_count           = var.environment == "dev" ? null : 2
    max_count           = var.environment == "dev" ? null : 5

    tags = {
      Environment = var.environment
      Project     = var.project_name
    }
  }

  identity {
    type = "SystemAssigned"
  }

  network_profile {
    network_plugin    = "azure"
    load_balancer_sku = "standard"
    network_policy    = "calico"
  }

  # Enable Azure Active Directory Integration (RBAC)
  role_based_access_control_enabled = true

  tags = {
    Environment = var.environment
    Project     = var.project_name
  }
}

# Role Assignment: AKS pulls images from ACR
resource "azurerm_role_assignment" "aks_acr_pull" {
  principal_id                     = azurerm_kubernetes_cluster.aks.kubelet_identity[0].object_id
  role_definition_name             = "AcrPull"
  scope                            = azurerm_container_registry.acr.id
  skip_service_principal_aad_check = true
}

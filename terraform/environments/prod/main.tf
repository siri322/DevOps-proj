module "aks" {
  source = "../../modules/aks"

  environment         = "prod"
  location            = var.location
  resource_group_name = "rg-mobility-prod"
  cluster_name        = "aks-mobility-prod"
  acr_name            = var.acr_name
  node_count          = 3
  node_vm_size        = "Standard_D4s_v5"
}

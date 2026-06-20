module "aks" {
  source = "../../modules/aks"

  environment         = "dev"
  location            = var.location
  resource_group_name = "rg-mobility-dev"
  cluster_name        = "aks-mobility-dev"
  acr_name            = var.acr_name
  node_count          = 1
  node_vm_size        = "Standard_D2s_v5"
}

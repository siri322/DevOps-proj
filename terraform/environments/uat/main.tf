module "aks" {
  source = "../../modules/aks"

  environment         = "uat"
  location            = var.location
  resource_group_name = "rg-mobility-uat"
  cluster_name        = "aks-mobility-uat"
  acr_name            = var.acr_name
  node_count          = 2
  node_vm_size        = "Standard_D2s_v5"
}

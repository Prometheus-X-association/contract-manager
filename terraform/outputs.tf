output "contract_manager_service_ip" {
  value = kubernetes_service.contract_manager.status[0].load_balancer[0].ingress[0].ip
}

output "contract_manager_namespace" {
  value = kubernetes_namespace.contract_manager.metadata[0].name
}

provider "kubernetes" {
  config_path = "~/.kube/config"
}

resource "kubernetes_namespace" "contract_manager" {
  metadata {
    name = "contract-manager"
  }
}

resource "kubernetes_secret" "env_vars" {
  metadata {
    name      = "env-vars"
    namespace = kubernetes_namespace.contract_manager.metadata[0].name
  }

  data = {
    MONGO_URL             = base64encode("your_mongo_url")
    MONGO_TEST_URL        = base64encode("your_mongo_test_url")
    MONGO_USERNAME        = base64encode("your_mongo_username")
    MONGO_PASSWORD        = base64encode("your_mongo_password")
    SERVER_PORT           = base64encode("your_server_port")
    SECRET_AUTH_KEY       = base64encode("your_secret_auth_key")
    SECRET_SESSION_KEY    = base64encode("your_secret_session_key")
    CATALOG_REGISTRY_URL  = base64encode("your_catalog_registry_url")
    SERVER_BASE_URL       = base64encode("your_server_base_url")
  }
}

resource "kubernetes_deployment" "contract_manager" {
  metadata {
    name      = "contract-manager"
    namespace = kubernetes_namespace.contract_manager.metadata[0].name
  }

  spec {
    replicas = 1

    selector {
      match_labels = {
        app = "contract-manager"
      }
    }

    template {
      metadata {
        labels = {
          app = "contract-manager"
        }
      }

      spec {
        container {
          image = "contract-manager:latest"
          name  = "contract-manager"

          port {
            container_port = var.server_port
          }

          env_from {
            secret_ref {
              name = kubernetes_secret.env_vars.metadata[0].name
            }
          }

          volume_mount {
            mount_path = "/data/db"
            name       = "contract-data"
          }
        }

        container {
          image = "mongo:latest"
          name  = "mongodb"

          volume_mount {
            mount_path = "/data/db"
            name       = "contract-data"
          }
        }

        volume {
          name = "contract-data"

          persistent_volume_claim {
            claim_name = kubernetes_persistent_volume_claim.mongo_data.metadata[0].name
          }
        }
      }
    }
  }
}

resource "kubernetes_service" "contract_manager" {
  metadata {
    name      = "contract-manager"
    namespace = kubernetes_namespace.contract_manager.metadata[0].name
  }

  spec {
    selector = {
      app = "contract-manager"
    }

    port {
      port        = var.server_port
      target_port = var.server_port
    }

    type = "LoadBalancer"
  }
}

resource "kubernetes_persistent_volume" "mongo_data" {
  metadata {
    name = "mongo-data"
  }

  spec {
    capacity = {
      storage = "5Gi"
    }

    access_modes = ["ReadWriteOnce"]

    persistent_volume_reclaim_policy = "Retain"

    host_path {
      path = "/mnt/data"
    }
  }
}

resource "kubernetes_persistent_volume_claim" "mongo_data" {
  metadata {
    name      = "mongo-data"
    namespace = kubernetes_namespace.contract_manager.metadata[0].name
  }

  spec {
    access_modes = ["ReadWriteOnce"]

    resources {
      requests = {
        storage = "5Gi"
      }
    }
  }
}

param(
  [string]$Tag = "latest",
  [string]$Namespace = "url-shortener",
  [string]$ImageName = "fiwsza007/url-shortener"
)

Write-Host "Applying K8s manifests..."
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml

Write-Host "Updating image to $ImageName:$Tag ..."
kubectl set image deployment/url-shortener-depl app=$ImageName`:$Tag -n $Namespace

Write-Host "Waiting for rollout..."
kubectl rollout status deployment/url-shortener-depl -n $Namespace

Write-Host "Done. Access at http://localhost:30080"
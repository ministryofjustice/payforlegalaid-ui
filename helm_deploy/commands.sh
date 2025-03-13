helm uninstall payforlegalaid-ui --namespace laa-get-payments-finance-data-dev

helm install payforlegalaid-ui ./payforlegalaid-ui --namespace laa-get-payments-finance-data-dev --set image.tag="v1.2.3"


helm upgrade --install payforlegalaid-ui ./payforlegalaid-ui --namespace laa-get-payments-finance-data-dev

# Get Payments and Finance Data UI

[![repo standards badge](https://img.shields.io/endpoint?labelColor=231f20&color=005ea5&style=for-the-badge&label=MoJ%20Compliant&url=https%3A%2F%2Foperations-engineering-reports.cloud-platform.service.justice.gov.uk%2Fapi%2Fv1%2Fcompliant_public_repositories%2Fendpoint%2Fpayforlegalaid-ui&logo=data:image/png;base64,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)](https://operations-engineering-reports.cloud-platform.service.justice.gov.uk/public-report/payforlegalaid-ui)

(Formerly known as 'Pay For Legal Aid')

## About this repository

This is the User Interface (UI) for the [Get Payments and Finance Data API](https://github.com/ministryofjustice/payforlegalaid).
This UI allows users with access to view a list of the reports that are currently in the Get Payments and Finance Data (GPFD) report list. Each one will have a download link, which will enable the user to download a CSV or XLS file (report-dependant) with the data from the pre-existing MOJFIN database.

The UI will authenticate against the Ministry of Justice Microsoft Entra instance. In future, Role-Based Access (RBAC) will be applied to the API and subsequentally the UI.

## Styling

This service follows the [GOV.UK Design System](https://design-system.service.gov.uk/) and the [Ministry of Justice (MoJ) Design System](https://design-patterns.service.justice.gov.uk/).
To achieve this it makes use of the [GOV.UK Frontend](https://github.com/alphagov/govuk-frontend/tree/main) and [MoJ Design System](https://github.com/ministryofjustice/moj-frontend) libraries.

This service has made use of the [GOV.UK Frontend Express](https://github.com/ministryofjustice/govuk-frontend-express/tree/main) skeleton.

## Environments

TODO

## Running the UI locally

### Set local environment variables

To run the UI locally, you need to setup the .env file. The template example contains the simple values but will not contain any secrets.
`cp .env.example .env`
and then set the secret values.

### Align to the Node Version

If using Node Version Manager (nvm), use the following command to switch to the correct version:

```
nvm use
nvm install
```

### Install dependencies and run application in development

```
npm install
npm run build
npm run dev
```

Then, load http://localhost:3000/ in your browser to access the app.

### Monitoring with Prometheus

Our application exposes Prometheus metrics at the /metrics endpoint, allowing you to monitor performance data (such as memory usage, CPU, HTTP request counts, and custom metrics). This setup is useful for troubleshooting, performance tuning, and ensuring the health of the UI.

Metrics Collection:
We use the prom-client library to collect default Node.js metrics (e.g., CPU usage, memory usage, event loop lag) as well as custom metrics (such as the number of report page requests).

Exposing Metrics:
The /metrics endpoint in our Express app returns these metrics in a format that Prometheus can scrape.

If you want to view the metrics locally:

#### 1. Ensure Docker is Running:

Make sure Docker Desktop is running on your machine.

#### 2. Use a Custom Prometheus Configuration:

Our repository includes a prometheus.yml file in the root. A sample configuration looks like this:

```
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'payforlegalaid-ui'
    static_configs:
      - targets: ['host.docker.internal:3000']
```

This configuration tells Prometheus (running inside Docker) to scrape metrics from our app running on port 3000 via host.docker.internal, which resolves to your host machine’s IP.

#### 3. Run Prometheus via Docker:

From the root of the repository, run:

```
docker run -p 9090:9090 -v "$(pwd)/prometheus.yml":/etc/prometheus/prometheus.yml prom/prometheus
```

This exposes Prometheus on port 9090 and mounts our local prometheus.yml into the container.

#### 4. Access the Prometheus UI:

Open your browser and navigate to http://localhost:9090.

Use the Targets page (under Status → Targets) to confirm that the payforlegalaid-ui target is being scraped successfully.

You can also use the Graph tab to query metrics and view performance data.

#### 5. Prometheus Metrics Endpoint:

When you navigate to http://localhost:3000/metrics, you’ll see output in plain text following the Prometheus exposition format. This output includes both default metrics (collected via the prom-client library) and any custom metrics we’ve defined.

## Tests

Unit tests are using Jest.
They can be run with the command
```
npm test
```
### End‑to‑end tests (Playwright)

1. **Start the UI locally**

   ```bash
   npm run dev
   ```

2. **Run the browser tests in another terminal**

   ```bash
   npx playwright test
   ```

   > **First run only:**  
   > Download the Playwright browser binaries with
   > ```bash
   > npx playwright install --with-deps
   > ```

Playwright specs live in **`tests/`** (e.g. `tests/homepage.spec.js`) and are configured via `playwright.config.js`.

## Technology stack

- Javascript
  - NodeJS
    - ExpressJS
    - Nunjucks
  - Jest
- Node Package Manager (npm)
- Docker
- Kubernetes
- Github Actions
- Microsoft Entra (formerly known as Azure Active Directory)

## Future Phases

The future phases are likely to include features such as report searching.
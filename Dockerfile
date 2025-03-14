FROM node:22.10-bookworm-slim AS base

ARG BUILD_NUMBER
ARG APP_VERSION
ARG GIT_REF

RUN test -n "$BUILD_NUMBER" || (echo "BUILD_NUMBER not set" && exit 1)
RUN test -n "$APP_VERSION" || (echo "APP_VERSION not set" && exit 1)
RUN test -n "$GIT_REF" || (echo "GIT_REF not set" && exit 1)

LABEL org.opencontainers.image.vendor="Ministry of Justice" \
      org.opencontainers.image.authors="GPFD team (laa-payments-finance@digital.justice.gov.uk)" \
      org.opencontainers.image.title="Get Payments & Finance Data" \
      org.opencontainers.image.description="UI service for Get Payments and Finance Data" \
      org.opencontainers.image.url="https://github.com/ministryofjustice/payforlegalaid-ui" \
      org.opencontainers.image.documentation="https://github.com/ministryofjustice/payforlegalaid-ui/readme.md" \
      org.opencontainers.image.source="https://github.com/ministryofjustice/payforlegalaid-ui" \
      org.opencontainers.image.version="${BUILD_NUMBER}" \
      org.opencontainers.image.revision="${GIT_REF}" \
      org.opencontainers.image.licenses="MIT" \
      org.opencontainers.image.base.name="node:22.10-bookworm-slim"

ENV TZ=Europe/London
RUN ln -snf "/usr/share/zoneinfo/$TZ" /etc/localtime && echo "$TZ" > /etc/timezone

RUN addgroup --gid 2000 --system appgroup && \
    adduser --uid 2000 --system appuser --gid 2000

WORKDIR /app

ENV BUILD_NUMBER=${BUILD_NUMBER} \
    GIT_REF=${GIT_REF} \
    GIT_BRANCH=${GIT_BRANCH}

RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get autoremove -y && \
    rm -rf /usr/games /var/lib/apt/lists/*

FROM base as build

ARG BUILD_NUMBER
ARG GIT_REF

ENV BUILD_NUMBER ${BUILD_NUMBER:-0_0_1}
ENV GIT_REF ${GIT_REF:-not_set}

WORKDIR /app

COPY . .
RUN npm install
RUN npm run build

FROM base

WORKDIR /app

COPY --from=build --chown=appuser:appgroup /app/package*.json ./
COPY --from=build --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --from=build --chown=appuser:appgroup /app/src/views ./src/views
COPY --from=build --chown=appuser:appgroup /app/public ./public
COPY --from=build --chown=appuser:appgroup /app/dist ./dist
COPY --from=build --chown=appuser:appgroup /app/.env ./

EXPOSE 3000
USER 2000

CMD ["npm", "start"]

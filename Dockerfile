# syntax=docker/dockerfile:1

# One image, two build chains: the Vite bundle for both surfaces, and the Rust
# binary that serves it alongside the API. The runtime carries neither toolchain.

# ---- frontend --------------------------------------------------------------
FROM node:24-slim AS web
WORKDIR /web

COPY frontend/package.json frontend/package-lock.json ./
# `npm ci` needs devDependencies here — vite and tsc are the build.
# Playwright's browser download is skipped: nothing runs a browser in the image.
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
RUN npm ci

COPY frontend/ ./
RUN npm run build

# ---- backend ---------------------------------------------------------------
# Pinned rather than `rust:1`: sqlx 0.9 requires 1.94, so a floating tag that
# drifts backwards would fail confusingly.
FROM rust:1.95-slim-bookworm AS server
WORKDIR /src

RUN apt-get update \
 && apt-get install -y --no-install-recommends pkg-config \
 && rm -rf /var/lib/apt/lists/*

# Dependencies first, against a stub main, so editing our own source does not
# rebuild the whole tree on every image build.
COPY backend/Cargo.toml backend/Cargo.lock ./
RUN mkdir src && echo 'fn main() {}' > src/main.rs \
 && cargo build --release \
 && rm -rf src

COPY backend/src ./src
COPY backend/migrations ./migrations
# Cargo skips a rebuild when only mtimes look stale; touching main.rs makes the
# real source unambiguously newer than the stub's artifacts.
RUN touch src/main.rs && cargo build --release

# ---- runtime ---------------------------------------------------------------
FROM debian:bookworm-slim AS runtime
WORKDIR /app

# ca-certificates is load-bearing, not boilerplate: rustls verifies the chain
# for recipe sites, ICS feeds and the Anthropic API against this store, and
# every outbound request fails without it. tzdata so container-local times in
# logs are readable.
RUN apt-get update \
 && apt-get install -y --no-install-recommends ca-certificates tzdata \
 && rm -rf /var/lib/apt/lists/*

COPY --from=server /src/target/release/family-hub-server /usr/local/bin/family-hub-server
COPY --from=web /web/dist ./static

ENV STATIC_DIR=/app/static \
    BIND_HOST=0.0.0.0 \
    PORT=3000 \
    RUST_LOG=family_hub_server=info

# The hub talks to Postgres over the compose network and writes nothing to
# disk, so it needs no root capabilities.
RUN useradd --system --uid 1001 --user-group hub && chown -R hub:hub /app
USER hub

EXPOSE 3000

# /api/health touches the database — a hub that cannot reach Postgres is not
# healthy, however well it serves HTML.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD ["/usr/local/bin/family-hub-server", "--healthcheck"]

CMD ["family-hub-server"]

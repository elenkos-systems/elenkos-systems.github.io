#!/usr/bin/env bash
set -euo pipefail

: "${ZED_VERSION:?ZED_VERSION is required}"
: "${ZED_SHA256:?ZED_SHA256 is required}"

archive="${RUNNER_TEMP:?RUNNER_TEMP is required}/zed.tar.gz"
bin_dir="${RUNNER_TEMP}/zed-bin"
url="https://github.com/zed-pkg/zed-cli/releases/download/v${ZED_VERSION}/zed-x86_64-unknown-linux-musl.tar.gz"

curl --fail --silent --show-error --location \
  --proto '=https' --tlsv1.2 \
  --retry 3 --retry-all-errors \
  --connect-timeout 15 --max-time 120 \
  "$url" --output "$archive"
printf '%s  %s\n' "$ZED_SHA256" "$archive" | sha256sum --check --strict
mkdir -p "$bin_dir"
tar --extract --gzip --file "$archive" --directory "$bin_dir"
test -x "$bin_dir/zed"
printf '%s\n' "$bin_dir" >> "${GITHUB_PATH:?GITHUB_PATH is required}"

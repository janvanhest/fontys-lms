#!/bin/sh
set -eu

MODEL_NAME=${MODEL_NAME:-nomic-embed-text}
MAX_WAIT=${MAX_WAIT_SECONDS:-120}
SLEEP=${SLEEP_SECONDS:-2}

ollama serve &
OLLAMA_PID=$!

elapsed=0
until ollama list >/dev/null 2>&1; do
  if ! kill -0 "$OLLAMA_PID" 2>/dev/null; then
    echo "ollama serve exited unexpectedly" >&2
    exit 1
  fi
  if [ "$elapsed" -ge "$MAX_WAIT" ]; then
    echo "Timed out after ${MAX_WAIT}s waiting for ollama" >&2
    exit 1
  fi
  sleep "$SLEEP"
  elapsed=$((elapsed + SLEEP))
done

if ! ollama show "$MODEL_NAME" >/dev/null 2>&1; then
  echo "Pulling model $MODEL_NAME..."
  ollama pull "$MODEL_NAME" || exit 1
fi

wait "$OLLAMA_PID"

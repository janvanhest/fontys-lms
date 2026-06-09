#!/bin/bash

ENDPOINT="${CHAT_STREAM_ENDPOINT:-http://localhost:3000/chat/stream}"
DEFAULT_MESSAGE="${CHAT_BENCH_MESSAGE:-Wat zijn de HBO-i beroepstaken voor software realiseren niveau 2?}"
BODY="${CHAT_BENCH_BODY:-$(printf '{"message":"%s"}' "$DEFAULT_MESSAGE")}"
CONCURRENT=${1:-5}
ROUNDS=${2:-5}
SLEEP=${3:-15}

results=()

countdown() {
  local secs=$1
  while [ "$secs" -gt 0 ]; do
    printf "\r  Volgende ronde over %2ds..." "$secs"
    sleep 1
    secs=$((secs - 1))
  done
  printf "\r                              \r"
}

echo "========================================"
echo " bench-chat-ttfb.sh — tijd tot eerste byte"
echo " Concurrent: $CONCURRENT  Rondes: $ROUNDS  Sleep: ${SLEEP}s"
echo " Totaal requests: $((CONCURRENT * ROUNDS))"
echo "========================================"
echo ""

for round in $(seq 1 $ROUNDS); do
  echo "▶ Ronde $round/$ROUNDS — $CONCURRENT requests tegelijk starten..."
  pids=()
  times=()
  start=$(date +%s%N)

  for i in $(seq 1 $CONCURRENT); do
    time_file=$(mktemp)
    curl -s -X POST "$ENDPOINT" \
      -H "Content-Type: application/json" \
      -d "$BODY" \
      -o /dev/null \
      -w "%{time_starttransfer}" > "$time_file" &
    pids+=($!)
    times+=("$time_file")
  done

  echo "  Wachten op $CONCURRENT responses..."
  for pid in "${pids[@]}"; do
    wait "$pid"
  done

  end=$(date +%s%N)
  wall=$(echo "scale=2; ($end - $start) / 1000000000" | bc)

  round_total=0
  round_min=${results[0]-9999}
  round_max=0
  for f in "${times[@]}"; do
    t=$(cat "$f")
    results+=("$t")
    round_total=$(echo "$round_total + $t" | bc)
    if (( $(echo "$t < $round_min" | bc -l) )); then round_min=$t; fi
    if (( $(echo "$t > $round_max" | bc -l) )); then round_max=$t; fi
    rm "$f"
  done

  round_avg=$(echo "scale=3; $round_total / $CONCURRENT" | bc)
  echo "  ✓ Klaar — wall time: ${wall}s"
  printf "    min: %ss  avg: %ss  max: %ss\n" "$round_min" "$round_avg" "$round_max"

  if [ "$round" -lt "$ROUNDS" ]; then
    echo "  Pauze van ${SLEEP}s (telt niet mee in gemiddelden)..."
    countdown "$SLEEP"
  fi
  echo ""
done

echo "========================================"
echo " Eindresultaat TTFB (${#results[@]} requests, sleep uitgesloten)"
echo "========================================"
total=0
min=${results[0]}
max=0
for t in "${results[@]}"; do
  total=$(echo "$total + $t" | bc)
  if (( $(echo "$t < $min" | bc -l) )); then min=$t; fi
  if (( $(echo "$t > $max" | bc -l) )); then max=$t; fi
done

avg=$(echo "scale=3; $total / ${#results[@]}" | bc)
printf "  min: %ss\n  avg: %ss\n  max: %ss\n" "$min" "$avg" "$max"
echo "========================================"

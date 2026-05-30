#!/bin/bash
# Validates SSE stream events from the chat endpoint.
# Checks which event types fired and which tool_calls were made.
#
# Usage:
#   ./validate-stream.sh [--verbose] [message] [expected_tool1,expected_tool2,...]
#
# Flags:
#   --verbose   Show all events including text_delta and stream_reset
#
# Examples:
#   ./validate-stream.sh
#   ./validate-stream.sh "Maak een semesterplan" "get_student_competences,search_activities"
#   ./validate-stream.sh --verbose "Maak een semesterplan"

ENDPOINT="http://localhost:3000/chat/stream"
VERBOSE=false

# Parse --verbose flag (anywhere in args)
ARGS=()
for arg in "$@"; do
  [[ "$arg" == "--verbose" ]] && VERBOSE=true || ARGS+=("$arg")
done

MESSAGE="${ARGS[0]:-Maak voor mij een persoonlijk semesterplan met mijn activiteiten en competenties.}"
EXPECTED_TOOLS_RAW="${ARGS[1]:-}"

# All known event types
ALL_EVENT_TYPES=(status text_delta tool_call tool_result ui_action stream_reset final error)

# Parse expected tools from comma-separated arg
EXPECTED_TOOLS=()
if [[ -n "$EXPECTED_TOOLS_RAW" ]]; then
  IFS=',' read -ra EXPECTED_TOOLS <<< "$EXPECTED_TOOLS_RAW"
fi

# ANSI colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
RESET='\033[0m'

echo ""
echo -e "${BOLD}========================================${RESET}"
echo -e "${BOLD} validate-stream.sh${RESET}"
echo -e " Endpoint : ${CYAN}${ENDPOINT}${RESET}"
echo -e " Bericht  : ${CYAN}${MESSAGE}${RESET}"
if [[ ${#EXPECTED_TOOLS[@]} -gt 0 ]]; then
  echo -e " Verwachte tools: ${CYAN}${EXPECTED_TOOLS[*]}${RESET}"
fi
echo -e "${BOLD}========================================${RESET}"
echo ""
echo -e "${BOLD}[Stream events]${RESET}"

TMPFILE=$(mktemp)

# Stream live to terminal AND capture to file
curl -s -N -X POST "$ENDPOINT" \
  -H "Content-Type: application/json" \
  -d "$(printf '{"message": %s}' "$(echo "$MESSAGE" | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read().strip()))')")" \
  --max-time 120 | tee "$TMPFILE" | while IFS= read -r line; do
    if [[ "$line" == event:* ]]; then
      ev="${line#event: }"
      ev="${ev#event:}"
      skip_event=false
      if ! $VERBOSE && [[ "$ev" == "text_delta" || "$ev" == "stream_reset" ]]; then
        skip_event=true
      fi
      case "$ev" in
        tool_call)   color="$CYAN" ;;
        tool_result) color="$YELLOW" ;;
        ui_action)   color="$YELLOW" ;;
        error)       color="$RED" ;;
        final)       color="$GREEN" ;;
        *)           color="$RESET" ;;
      esac
      $skip_event || printf "  ${color}event: %s${RESET}\n" "$ev"
    elif [[ "$line" == id:* ]]; then
      $skip_event || printf "  %s\n" "$line"
    elif [[ "$line" == data:* ]]; then
      if ! $skip_event; then
        data="${line#data: }"
        data="${data#data:}"
        if [[ ${#data} -gt 80 ]]; then
          data="${data:0:77}..."
        fi
        printf "  data: %s\n" "$data"
      fi
    fi
  done

echo ""
echo -e "${BOLD}========================================${RESET}"
echo -e "${BOLD} Analyse${RESET}"
echo -e "${BOLD}========================================${RESET}"
echo ""

# Parse events and tool calls from captured output
declare -A SEEN_EVENTS
SEEN_TOOLS=()
current_event=""

while IFS= read -r line; do
  if [[ "$line" == event:* ]]; then
    current_event="${line#event: }"
    current_event="${current_event#event:}"
    SEEN_EVENTS["$current_event"]=1
  elif [[ "$line" == data:* ]] && [[ "$current_event" == "tool_call" ]]; then
    data="${line#data: }"
    data="${data#data:}"
    name=$(echo "$data" | python3 -c 'import json,sys; d=json.load(sys.stdin); print(d.get("name",""))' 2>/dev/null)
    [[ -n "$name" ]] && SEEN_TOOLS+=("$name")
    current_event=""
  elif [[ -z "$line" ]]; then
    current_event=""
  fi
done < "$TMPFILE"

rm "$TMPFILE"

# Event type coverage
echo -e "${BOLD}Event types:${RESET}"
all_pass=true
for ev in "${ALL_EVENT_TYPES[@]}"; do
  if [[ "${SEEN_EVENTS[$ev]}" == "1" ]]; then
    echo -e "  ${GREEN}GEZIEN  ${RESET} $ev"
  else
    echo -e "  ${YELLOW}NIET GEZIEN${RESET} $ev"
  fi
done

echo ""

# Tool call validation
if [[ ${#SEEN_TOOLS[@]} -gt 0 ]]; then
  echo -e "${BOLD}Tool calls:${RESET}"
  for tool in "${SEEN_TOOLS[@]}"; do
    echo -e "  ${GREEN}✓${RESET} $tool"
  done
  echo ""
fi

# Expected tools check
if [[ ${#EXPECTED_TOOLS[@]} -gt 0 ]]; then
  echo -e "${BOLD}Verwachte tools validatie:${RESET}"
  fail=false
  for expected in "${EXPECTED_TOOLS[@]}"; do
    found=false
    for actual in "${SEEN_TOOLS[@]}"; do
      [[ "$actual" == "$expected" ]] && found=true && break
    done
    if $found; then
      echo -e "  ${GREEN}PASS${RESET}  $expected"
    else
      echo -e "  ${RED}FAIL${RESET}  $expected  (niet aangeroepen)"
      fail=true
      all_pass=false
    fi
  done
  echo ""
fi

echo -e "${BOLD}========================================${RESET}"
if $all_pass; then
  echo -e "${GREEN}${BOLD} Resultaat: GESLAAGD${RESET}"
else
  echo -e "${RED}${BOLD} Resultaat: GEFAALD${RESET}"
fi
echo -e "${BOLD}========================================${RESET}"
echo ""

$all_pass && exit 0 || exit 1

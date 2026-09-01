#!/bin/bash
INPUT=$(cat)
FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

[ -z "$FILE" ] && exit 0

# Only twoside-ui is writable
if [[ "$FILE" == *"twoside-ui/"* ]]; then
  exit 0
fi

# Hard deny everything else
echo "BLOCKED: Write access restricted to twoside-ui/ only" >&2
exit 2   
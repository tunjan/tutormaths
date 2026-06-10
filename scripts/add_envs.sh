#!/bin/bash
set -e

# Find the root .env.local
ENV_FILE=".env.local"
if [ ! -f "$ENV_FILE" ]; then
  ENV_FILE="../.env.local"
fi

if [ -f "$ENV_FILE" ]; then
  echo "Reading environment variables from $ENV_FILE..."
  while IFS= read -r line || [ -n "$line" ]; do
    # Strip carriage returns
    line=$(echo "$line" | tr -d '\r')
    # Skip comments and empty lines
    if [[ ! "$line" =~ ^# ]] && [[ ! -z "$line" ]]; then
      # Extract key (everything before the first '=')
      key=$(echo "$line" | cut -d'=' -f1 | tr -d '[:space:]')
      # Extract value (everything after the first '=')
      val=$(echo "$line" | cut -d'=' -f2-)
      # Strip surrounding quotes if any
      val="${val#\"}"
      val="${val%\"}"
      val="${val#\'}"
      val="${val%\'}"
      
      # We only want to add specific keys: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY, RESEND_FROM_EMAIL
      if [[ "$key" == "NEXT_PUBLIC_SUPABASE_URL" || "$key" == "NEXT_PUBLIC_SUPABASE_ANON_KEY" || "$key" == "SUPABASE_SERVICE_ROLE_KEY" || "$key" == "RESEND_API_KEY" || "$key" == "RESEND_FROM_EMAIL" ]]; then
        if [ -n "$val" ]; then
          echo "Adding $key to Vercel production..."
          npx vercel env add "$key" production --value "$val" --yes --force
        fi
      fi
    fi
  done < "$ENV_FILE"
  echo "All environment variables added!"
else
  echo "Error: .env.local file not found!"
  exit 1
fi

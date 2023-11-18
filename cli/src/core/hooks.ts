export const COMMIT_MSG_HOOK = `
#!/bin/bash

# Read the config file
configPath="$HOME/.degit/config.json"

# Load the config into environment variables
while IFS="=" read -r key value; do
  key=$(echo $key | sed -r 's/([a-z0-9])([A-Z])/\\1_\\2/g' | tr '[:lower:]' '[:upper:]')
  export $key=$value
done < <(jq -r "to_entries|map(\"\(.key)=\(.value|tostring)\")|.[]" $configPath)

# Execute the command
lilypad run cowsay:v0.0.1 -i Message="<hello lilypad>"
`;

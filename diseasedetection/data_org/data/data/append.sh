#!/bin/bash

# Check if the correct number of arguments is provided
if [ "$#" -ne 2 ]; then
  echo "Usage: $0 <directory> <string_to_append>"
  exit 1
fi

# Store the arguments in variables
target_dir="$1"
append_str="$2"

# Function to recursively append the string to file names
append_to_filenames() {
  local dir="$1"
  for file in "$dir"/*; do
    if [ -d "$file" ]; then
      # If it's a directory, recurse into it
      append_to_filenames "$file"
    elif [ -f "$file" ]; then
      # If it's a file, process the name and extension
      filename=$(basename -- "$file")
      extension="${filename##*.}"
      name="${filename%.*}"
      
      # Rename the file, preserving the extension
      mv "$file" "${dir}/${name}${append_str}.${extension}"
    fi
  done
}

# Check if the provided directory exists
if [ ! -d "$target_dir" ]; then
  echo "Error: Directory '$target_dir' does not exist."
  exit 1
fi

# Start the process from the specified directory
append_to_filenames "$target_dir"

echo "Appended '$append_str' to all file names in '$target_dir', preserving extensions."

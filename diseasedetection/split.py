import os
import shutil
import fnmatch

def find_folders_by_pattern(root_dir, pattern):
    matching_folders = []
    for dirpath, dirnames, filenames in os.walk(root_dir):
        for dirname in dirnames:
            print(dirname)
            if fnmatch.fnmatch(dirname, pattern):
                full_path = os.path.join(dirpath, dirname)
                matching_folders.append(full_path)
    return matching_folders

def rename_and_move_images(source_dir, destination_dir, append_str):
    for filename in os.listdir(source_dir):
        if filename.lower().endswith(('png', 'jpg', 'jpeg', 'gif', 'bmp', 'tiff', 'webp')):
            name, ext = os.path.splitext(filename)
            new_filename = f"{name}_{append_str}{ext}"
            source_path = os.path.join(source_dir, filename)
            destination_path = os.path.join(destination_dir, new_filename)
            shutil.copy(source_path, destination_path)
            print(f"Copied: {filename} -> {new_filename}")


# Example usage
source_directory = "data/data/data/"
destination_directory = "plantkaggle/two_stage/train/"
append_string = "modified"
# rename_and_move_images(source_directory, destination_directory, append_string)

subfolders = [ f.name for f in os.scandir(destination_directory) if f.is_dir() ]
for i in subfolders:
    # print(i)
    folder = os.path.join(destination_directory, i)
    print(folder)
    for i in os.scandir(source_directory):
        if i.is_dir():
            print(i.name)
    matches = find_folders_by_pattern(source_directory, i)
    print(matches)

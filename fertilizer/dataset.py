import kagglehub

print("hi")

# Download latest version
path = kagglehub.dataset_download("sanchitagholap/crop-and-fertilizer-dataset-for-westernmaharashtra")

print("Path to dataset files:", path)

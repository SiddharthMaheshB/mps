import os
import time
import sys

# Include parent dir for model import
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from diseasedetection.main import results,load_models


model1,model2 = load_models("../diseasedetection/weights/stage_one.h5","../diseasedetection/weights/models.pkl")
print(results("./static/uploads/img_1743852434.png",model1,model2))
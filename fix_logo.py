import sys
from PIL import Image

def remove_background(img_path):
    img = Image.open(img_path).convert("RGBA")
    datas = img.getdata()

    new_data = []
    for item in datas:
        # Change all off-white colors to solid transparent
        if item[0] > 230 and item[1] > 230 and item[2] > 230:
            new_data.append((255, 255, 255, 0))
        else:
            new_data.append(item)

    img.putdata(new_data)
    img.save(img_path, "PNG")

print("Processing Logo.png to remove background artifacts...")
remove_background("c:/Users/Danie.Badenhorst/.antigravity/CattleApp/src/assets/Logo.png")
print("Done!")

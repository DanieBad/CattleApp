import sys
from PIL import Image

def clean_smudges(img_path):
    img = Image.open(img_path).convert("RGBA")
    datas = img.getdata()
    new_data = []

    for item in datas:
        r, g, b, a = item
        # If transparent, keep transparent
        if a == 0:
            new_data.append(item)
            continue
            
        # Determine if pixel is greyish noise
        # True grey has R~G~B. We use a threshold of 30 to catch compression artifacts.
        is_grey = abs(r - g) < 30 and abs(g - b) < 30 and abs(r - b) < 30
        
        # If it's grey and reasonably bright (light-grey noise), make transparent
        if is_grey and r > 120:
            new_data.append((255, 255, 255, 0))
        else:
            new_data.append(item)

    img.putdata(new_data)
    img.save(img_path, "PNG")

print("Cleaning smudges from Logo...")
clean_smudges("c:/Users/Danie.Badenhorst/.antigravity/CattleApp/src/assets/Logo.png")
print("Done!")

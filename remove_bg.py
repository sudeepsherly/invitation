import sys
from PIL import Image

def remove_white_bg(input_path, output_path, tolerance=240):
    img = Image.open(input_path)
    img = img.convert("RGBA")
    data = img.getdata()
    
    new_data = []
    for item in data:
        # If the pixel is close to white, make it transparent
        if item[0] >= tolerance and item[1] >= tolerance and item[2] >= tolerance:
            new_data.append((255, 255, 255, 0))
        else:
            new_data.append(item)
            
    img.putdata(new_data)
    img.save(output_path, "PNG")

if __name__ == "__main__":
    # We will use the pure white background image we generated
    input_file = "C:/Users/Lenovo/.gemini/antigravity/brain/34c18754-cbbe-420a-87d6-9fa5f3e2bf65/bells_white_bg_1786963490988.jpg"
    output_file = "C:/Users/Lenovo/workspace/personal/Frentzen/images/wedding_bells_new.png"
    remove_white_bg(input_file, output_file)
    print("Successfully created true transparent PNG!")

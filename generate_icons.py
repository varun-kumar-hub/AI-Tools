import os
from PIL import Image

# Configuration
SOURCE_LOGO = r"c:\Users\cvaru\OneDrive\Documents\AITools\frontend\src\assets\logo.png"
ANDROID_RES_DIR = r"c:\Users\cvaru\OneDrive\Documents\AITools\android\app\src\main\res"

ICON_SIZES = {
    "mipmap-mdpi": 48,
    "mipmap-hdpi": 72,
    "mipmap-xhdpi": 96,
    "mipmap-xxhdpi": 144,
    "mipmap-xxxhdpi": 192,
}

def generate_icons():
    if not os.path.exists(SOURCE_LOGO):
        print(f"Error: Source logo not found at {SOURCE_LOGO}")
        return

    try:
        img = Image.open(SOURCE_LOGO)
        print(f"Opened logo: {img.format}, {img.size}, {img.mode}")

        for folder, size in ICON_SIZES.items():
            target_dir = os.path.join(ANDROID_RES_DIR, folder)
            if not os.path.exists(target_dir):
                os.makedirs(target_dir)
                print(f"Created directory: {target_dir}")

            # Resize and save ic_launcher.png (square/legacy)
            icon = img.resize((size, size), Image.Resampling.LANCZOS)
            icon_path = os.path.join(target_dir, "ic_launcher.png")
            icon.save(icon_path, "PNG")
            
            # Resize and save ic_launcher_round.png (round)
            icon_round_path = os.path.join(target_dir, "ic_launcher_round.png")
            icon.save(icon_round_path, "PNG")

            # Resize and save ic_launcher_foreground.png (adaptive foreground)
            # using the same icon as foreground
            icon_fg_path = os.path.join(target_dir, "ic_launcher_foreground.png")
            icon.save(icon_fg_path, "PNG")
            
            print(f"Generated {size}x{size} icons in {folder} (standard, round, foreground)")

        print("Icon generation complete.")

    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    generate_icons()

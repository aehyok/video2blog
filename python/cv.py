import os
import cv2
import sys
import numpy as np

def get_image_hash(image_path):
    img = cv2.imread(image_path)
    img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    img = cv2.resize(img, (8, 8), interpolation=cv2.INTER_AREA)
    mean = np.mean(img)
    img = img > mean
    return img.flatten()

def hamming_distance(hash1, hash2):
    return sum(c1 != c2 for c1, c2 in zip(hash1, hash2))

def deleteSimilarImagesInSequence(folder_path):
  images = sorted(os.listdir(folder_path))

  for i in range(len(images)):
    # 如果i大于等于列表的长度，提前终止循环
    if i >= len(images):
        break
    select_image_path = os.path.join(folder_path, images[i])
    select_image_hash = get_image_hash(select_image_path)

    j = i + 1  # 设置j为i的下一位
    while j < len(images):  # 使用当前的images列表的长度
      current_image_path = os.path.join(folder_path, images[j])  # 获取当前列表中的图片路径
      current_image_hash = get_image_hash(current_image_path)

      if abs(hamming_distance(select_image_hash, current_image_hash)) < 30:
        os.remove(current_image_path)  # 删除图片
        images.remove(images[j])  # 从列表中移除已删除的图片
      else:
        j += 1  # 如果图片没有被删除，移动到下一个图片

if __name__ == "__main__":
  # sys.argv[0] 获取的是脚本的名称
  folder_path = sys.argv[1]
  # folder_path = "h:\\github\\electron-vite-tools\\command\\2024-04-17-15-17-44\\000246533"
  deleteSimilarImagesInSequence(folder_path)
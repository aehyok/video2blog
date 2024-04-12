import os
import cv2
from PIL import Image
import imagehash
import shutil

# 将图片读取并转换为RGB格式，然后计算其哈希值
def get_image_hash(image_path):
    img = cv2.imread(image_path)
    img = Image.fromarray(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))
    return imagehash.phash(img)

# 初始化new文件夹路径和temp文件夹路径
new_dir = "new"
temp_dir = "temp"
# 遍历temp文件夹中的所有图片
def deleteSimilarImagesInSequence(temp_dir):
  # 获取temp文件夹中的所有图片
  images = sorted(os.listdir(temp_dir))

  # 将排序后的第一张图片从temp文件夹移动到new文件夹
  shutil.copy(os.path.join(temp_dir, images[0]), new_dir)

  # 获取new文件夹中的最后一张图片的哈希值
  last_image_in_new = sorted(os.listdir(new_dir))[-1]
  last_hash = get_image_hash(os.path.join(new_dir, last_image_in_new))

  # 从第二张图片开始遍历temp文件夹中的所有图片
  for i in range(1, len(images)):
      image_path = os.path.join(temp_dir, images[i])
      # 计算当前图片的哈希值
      current_hash = get_image_hash(image_path)
      # 比较当前图片的哈希值与new文件夹中的最后一张图片的哈希值
      if current_hash - last_hash > 10:
          # 如果哈希值差异大于10，将当前图片复制到new文件夹中
          shutil.copy(image_path, new_dir)
          # 更新new文件夹中的最后一张图片的哈希值
          last_hash = current_hash

# 根据选择图片，来移除文件夹下所有的相似图片
def deleteSimilarImages(select_image_url, new_dir):
  select_image_hash = get_image_hash(os.path.join(new_dir, select_image_url))

  for image in sorted(os.listdir(new_dir)):
      image_path = os.path.join(new_dir, image)
      # 计算当前图片的哈希值
      current_hash = get_image_hash(image_path)
      # 比较当前图片的哈希值与编号为0001的图片的哈希值
      if abs(select_image_hash - current_hash) < 10:
          # 如果哈希值差异小于10，将当前图片从new文件夹移除
          os.remove(image_path)

def allImageHashValue():
  images = sorted(os.listdir(new_dir))
  # 遍历temp文件夹中的所有图片
  for i in range(1, len(images)):    
      image_path = os.path.join(temp_dir, image)
      # 计算并打印当前图片的哈希值
      print(f"The hash value of {image} is {get_image_hash(image_path)}")

if __name__ == "__main__":
  # deleteSimilarImagesInSequence(temp_dir)
  # url = 'output_images_0007.png'
  # deleteSimilarImages(url,new_dir)

  image_path1 = os.path.join(temp_dir, 'output_images_0295.png')
  image_path2 = os.path.join(temp_dir, 'output_images_0290.png')
  value = abs(get_image_hash(image_path1)-get_image_hash(image_path2))
  print(value)

  
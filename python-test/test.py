# This Python file uses the following encoding: utf-8

import time
import sys

# 循环输出hello world
for i in range(5):
  time.sleep(1)
  print("Hello, World!")
  
  # 清空标准输出的缓冲区
  sys.stdout.flush()

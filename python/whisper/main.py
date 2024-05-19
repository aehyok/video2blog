import whisper
from whisper.utils import get_writer
import os
import time
import torch

def whisper_test(videopath,filename, type):  

    ## window GPU  cuda
    ## window CPU  cpu
    ## mac CPU cpu
    ## mac GPU
    model = whisper.load_model("large-v2",device=type)
    os.path.join(videopath, filename)
    result = model.transcribe(audio=filename, fp16 =False)

    word_options = {
    "highlight_words": True,
    "max_line_count": 50,
    "max_line_width": 3
    }

    srt_writer = get_writer("srt", videopath)
    srt_writer(result, filename, word_options)

if __name__ == "__main__":
    # 获取参数
    videopath = sys.argv[1]
    filename = sys.argv[2]
    type = sys.argv[3]
    start_time = time.time()  # 开始时间
    print("start time:", start_time)
    whisper_test(videopath, filename, type)
    end_time = time.time()  # 结束时间
    print("Execution time: ", end_time - start_time, "seconds")
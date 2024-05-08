import whisper
from whisper.utils import get_writer
import os
import time
import torch
import os   #引用OS
from faster_whisper import WhisperModel
def fast(): 
    model_size = "large-v3"

    # Run on GPU with FP16
    # model = WhisperModel(model_size, device="cuda", compute_type="float16")

    # or run on GPU with INT8
    # model = WhisperModel(model_size, device="cuda", compute_type="int8_float16")
    # or run on CPU with INT8
    # https://github.com/openai/whisper/discussions/98

    # print(path)
    model = WhisperModel(model_size, device="cpu", compute_type="int8", cpu_threads=16)
    # model = WhisperModel(model_size, device="cuda", compute_type="float16")

    # transcribe 语音转文字
    # translate
    segments, info = model.transcribe("test.mp4", beam_size = 5)

    print("Detected language '%s' with probability %f" % (info.language, info.language_probability))

    for segment in segments:
        print("[%.2fs -> %.2fs] %s" % (segment.start, segment.end, segment.text))

def main():

    os.environ['KMP_DUPLICATE_LIB_OK'] = 'TRUE'

    filename = "test.mp4"   

    model = whisper.load_model("large-v3",device="cpu")
    result = model.transcribe(audio=filename, fp16 =False)
    output_directory = "."

    word_options = {
    "highlight_words": True,
    "max_line_count": 50,
    "max_line_width": 3
    }

    srt_writer = get_writer("srt", output_directory)
    srt_writer(result, filename, word_options)

if __name__ == "__main__":
    # print(torch.cuda.is_available())
    start_time = time.time()  # 开始时间
    print("start time:", start_time)
    # main()
    fast()
    end_time = time.time()  # 结束时间
    print("Execution time: ", end_time - start_time, "seconds")
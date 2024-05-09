import whisper
from whisper.utils import get_writer
import os
import time
import torch
import os   #引用OS
from faster_whisper import WhisperModel
import whisperx
import gc 

def whisperx_test():
    device = "cpu" 
    model_size = "large-v3"
    audio_file = "test.mp4"
    batch_size = 16
    compute_type = "int8" 

    # widnow CPU
    model = whisperx.load_model("large-v3", device, compute_type=compute_type)

    # window GPU
    # model = whisperx.load_model("large-v3", "cuda", compute_type="float16")

    audio = whisperx.load_audio(audio_file)
    result = model.transcribe(audio, batch_size=batch_size)

    print(result["segments"])

def faster_whisper_test(): 
    model_size = "large-v3"

    ## window cpu
    model = WhisperModel(model_size, device="cpu", compute_type="int8", cpu_threads=16)
    
    # window gpu
    # model = WhisperModel(model_size, device="cuda", compute_type="float16")
    segments, info = model.transcribe("test.mp4", beam_size = 5)

    print("Detected language '%s' with probability %f" % (info.language, info.language_probability))

    for segment in segments:
        print("[%.2fs -> %.2fs] %s" % (segment.start, segment.end, segment.text))

def whisper_test():

    os.environ['KMP_DUPLICATE_LIB_OK'] = 'TRUE'

    filename = "test.mp4"   

    ## window GPU  cuda
    ## window CPU  cpu
    ## mac CPU cpu
    ## mac GPU
    model = whisper.load_model("large-v3",device="cuda")
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
    # whisper_test()
    # faster_whisper_test()
    whisperx_test()
    end_time = time.time()  # 结束时间
    print("Execution time: ", end_time - start_time, "seconds")
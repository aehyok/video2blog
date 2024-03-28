import whisper
import os
from faster_whisper import WhisperModel

def fast(): 
    model_size = "large-v3"

    # Run on GPU with FP16
    # model = WhisperModel(model_size, device="cuda", compute_type="float16")

    # or run on GPU with INT8
    # model = WhisperModel(model_size, device="cuda", compute_type="int8_float16")
    # or run on CPU with INT8

    current_directory = os.getcwd()
    print(current_directory)
    path = os.path.join(current_directory, "command\model")

    print(path)
    model = WhisperModel(model_size_or_path = model_size, device="cpu", compute_type="int8", download_root = path, cpu_threads=16)

    # transcribe 语音转文字
    # translate
    segments, info = model.transcribe("output.aac", beam_size = 5)

    print("Detected language '%s' with probability %f" % (info.language, info.language_probability))

    for segment in segments:
        print("[%.2fs -> %.2fs] %s" % (segment.start, segment.end, segment.text))
def main():
    model = whisper.load_model("large-v3")
    result = model.transcribe("audio.m4a", fp16 =False)
    print(result["text"])

if __name__ == "__main__":
    fast()
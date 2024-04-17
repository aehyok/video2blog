import whisper
from whisper.utils import get_writer
import os
def fast(): 
    model_size = "large-v3"

    # Run on GPU with FP16
    # model = WhisperModel(model_size, device="cuda", compute_type="float16")

    # or run on GPU with INT8
    # model = WhisperModel(model_size, device="cuda", compute_type="int8_float16")
    # or run on CPU with INT8
    # https://github.com/openai/whisper/discussions/98

    current_directory = os.getcwd()
    print(current_directory)
    path = os.path.join(current_directory, "command\model")

    print(path)
    model = WhisperModel(model_size_or_path = model_size, device="cpu", compute_type="int8", download_root = path, cpu_threads=16)

    # transcribe 语音转文字
    # translate
    segments, info = model.transcribe("test.mp3", beam_size = 5)

    print("Detected language '%s' with probability %f" % (info.language, info.language_probability))

    for segment in segments:
        print("[%.2fs -> %.2fs] %s" % (segment.start, segment.end, segment.text))
def main():

    filename = "test.mp3"
    input_directory = "."
    input_file = "{input_directory}/{filename}"


    model = whisper.load_model("large-v3") # or whatever model you prefer
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
    main()
import whisper
from faster_whisper import WhisperModel


def fast_model_list():
    installed_models = whisper.List()
    for model in installed_models:
        print(model)

def fast(): 
    model_size = "large-v3"

    # Run on GPU with FP16
    # model = WhisperModel(model_size, device="cuda", compute_type="float16")

    # or run on GPU with INT8
    # model = WhisperModel(model_size, device="cuda", compute_type="int8_float16")
    # or run on CPU with INT8
    model = WhisperModel(model_size, device="cpu", compute_type="int8")

    segments, info = model.transcribe("audio.m4a", beam_size=5)

    print("Detected language '%s' with probability %f" % (info.language, info.language_probability))

    for segment in segments:
        print("[%.2fs -> %.2fs] %s" % (segment.start, segment.end, segment.text))
def main():
    model = whisper.load_model("large-v3")
    result = model.transcribe("audio.m4a", fp16 =False)
    print(result["text"])

if __name__ == "__main__":
    fast_model_list()
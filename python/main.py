import whisper
def main():
    model = whisper.load_model("base")
    result = model.transcribe("audio.m4a", fp16 =False)
    print(result["text"])

if __name__ == "__main__":
    main()
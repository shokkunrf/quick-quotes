import whisper


class Transcriber:
    _model: whisper.Whisper

    def __init__(self):
        self._model = whisper.load_model("base")

    def transcribe(self, file_path: str) -> str:
        result = self._model.transcribe(file_path)
        return result["text"]

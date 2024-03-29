import whisper


class Transcriber:
    _model: whisper.Whisper
    _language: str | None

    def __init__(self, model: str, language: str | None):
        self._model = whisper.load_model(model, download_root="/app/model")
        self._language = language

    def transcribe(self, file_path: str) -> str:
        result = self._model.transcribe(file_path, language=self._language)
        return result["text"]

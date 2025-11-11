import { NextResponse } from "next/server";
import {
  saveAudioToFile,
  recognizeFromBase64,
  recognizeFromFile,
  SpeechRecognitionResponse,
} from "../../lib/speechRecognizer";

// Speech recognition logic is encapsulated in app/lib/speechRecognizer.ts

export const POST = async (request: Request) => {
  try {
    const contentType = request.headers.get("content-type");

    // 处理语音识别请求
    if (contentType?.includes("application/json")) {
      const body = await request.json();

      // 语音识别请求
      const { audioData } = body as { audioData: string };

      if (!audioData) {
        return NextResponse.json({ error: "音频数据不能为空" }, { status: 400 });
      }

      // 调用封装的识别器（从 base64）
      const result = await recognizeFromBase64(audioData);
      return NextResponse.json<SpeechRecognitionResponse>(result);
    }

    // 处理FormData格式的请求（用于直接上传音频文件）
    else if (contentType?.includes("multipart/form-data")) {
      const formData = await request.formData();
      const audioFile = formData.get("audio");

      if (!audioFile || !(audioFile instanceof Blob)) {
        return NextResponse.json({ error: "请上传有效的音频文件" }, { status: 400 });
      }

      const result = await recognizeFromFile(audioFile);
      return NextResponse.json<SpeechRecognitionResponse>(result);
    }

    return NextResponse.json({ error: "不支持的Content-Type" }, { status: 415 });
  } catch (error) {
    console.error("语音识别时出错:", error);
    return NextResponse.json({ error: "语音识别失败，请稍后重试" }, { status: 500 });
  }
};

import clientFetch from './clientApi';

// 生成对话的API封装
export async function generateDialogue(scene: string) {
  return clientFetch('/api/generate-dialogue', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ scene }),
    name: 'generate-dialogue-client',
  });
}

// 语音识别的API封装
export async function recognizeSpeech(audioData: string) {
  return clientFetch('/api/speech-recognition', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ audioData }),
    name: 'speech-recognition-client',
  });
}
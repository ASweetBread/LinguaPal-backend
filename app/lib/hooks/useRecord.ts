import { useState, useRef, useEffect } from 'react';
import Recorder from 'js-audio-recorder';

// 音频设备接口
export interface AudioDevice {
  id: string;
  label: string;
}

export interface UseRecordOptions {
  onRecordingComplete?: (audioData: string) => void;
}

export interface UseRecordReturn {
  isRecording: boolean;
  audioUrl: string;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  mediaRecorder: MediaRecorder | null;
  currentAudioBlob: Blob | null;
  audioDevices: AudioDevice[];
  selectedDeviceId: string | null;
  setSelectedDeviceId: (deviceId: string | null) => void;
  loadAudioDevices: () => Promise<void>;
}

/**
 * 录音功能的自定义Hook - 使用js-audio-recorder库
 */
export function useRecord(options: UseRecordOptions = {}): UseRecordReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [currentAudioBlob, setCurrentAudioBlob] = useState<Blob | null>(null);
  const [audioDevices, setAudioDevices] = useState<AudioDevice[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  
  // 使用js-audio-recorder的recorder实例
  const recorderRef = useRef<Recorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    // 组件卸载时清理
    return () => {
      if (recorderRef.current) {
        recorderRef.current.stop();
        recorderRef.current.destroy();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  // 获取可用的音频输入设备
  const loadAudioDevices = async (): Promise<void> => {
    try {
      console.log('开始获取音频设备列表...');
      
      // 首先请求媒体权限（某些浏览器需要权限才能列出设备）
      const tempStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      tempStream.getTracks().forEach(track => track.stop());
      
      // 获取所有媒体设备
      const devices = await navigator.mediaDevices.enumerateDevices();
      
      // 过滤出音频输入设备
      const audioInputDevices = devices
        .filter(device => device.kind === 'audioinput')
        .map(device => ({
          id: device.deviceId,
          label: device.label || `麦克风 ${audioDevices.length + 1}` // 如果没有标签，使用默认标签
        }));
      
      console.log('获取到的音频设备数量:', audioInputDevices.length);
      audioInputDevices.forEach((device, index) => {
        console.log(`设备${index + 1}:`, device.label, 'ID:', device.id);
      });
      
      setAudioDevices(audioInputDevices);
      
      // 如果还没有选择设备且有可用设备，默认选择第一个
      if (!selectedDeviceId && audioInputDevices.length > 0) {
        setSelectedDeviceId(audioInputDevices[0].id);
        console.log('默认选择第一个设备:', audioInputDevices[0].label);
      }
    } catch (error) {
      console.error('获取音频设备列表失败:', error);
      throw new Error('无法获取音频设备列表，请确保已授予麦克风权限');
    }
  };

  // 将Blob转换为Base64
  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]); // 移除data:audio/wav;base64,前缀
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // 开始录音
  const startRecording = async (): Promise<void> => {
    try {
      // 清理之前可能存在的资源
      if (recorderRef.current) {
        recorderRef.current.stop();
        recorderRef.current.destroy();
      }
      
      console.log('开始初始化js-audio-recorder...');
      
      // 设置约束条件，包括设备选择和音频处理选项
      const constraints: MediaStreamConstraints = {
        audio: selectedDeviceId ? 
          { 
            deviceId: { exact: selectedDeviceId },
            echoCancellation: true,
            noiseSuppression: true 
          } : 
          { 
            echoCancellation: true,
            noiseSuppression: true 
          }
      };
      
      console.log('使用的设备ID:', selectedDeviceId || '默认设备');
      
      // 创建Recorder实例并配置
      const recorder = new Recorder({
        sampleBits: 16, // 采样位数
        sampleRate: 16000, // 采样率，适合语音识别
        numChannels: 1, 
      });
      
      recorderRef.current = recorder;
      
      // 开始录音
      await recorder.start().then(() => {
        console.log('js-audio-recorder录音开始成功');
        setIsRecording(true);
      }).catch((error) => {
        console.error('js-audio-recorder启动失败:', error);
        throw error;
      });
      
      // 重置音频相关状态
      setCurrentAudioBlob(null);
      
      console.log('录音初始化完成');
    } catch (error) {
      console.error('录音失败:', error);
      setIsRecording(false);
      throw new Error('无法访问麦克风，请确保已授予权限');
    }
  };
  
  // 停止录音
  const stopRecording = async () => {
    console.log('stopRecording被调用');
    
    if (recorderRef.current) {
      try {
        // 停止录音
        recorderRef.current.stop();
        console.log('录音已停止');
        
        // 获取WAV格式的Blob数据
        const audioBlob = recorderRef.current.getWAVBlob();
        console.log('创建的Blob大小:', audioBlob.size, '类型:', audioBlob.type);
        
        // 创建音频URL
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        setCurrentAudioBlob(audioBlob);
        
        // 转换为Base64并调用回调
        try {
          const base64Audio = await blobToBase64(audioBlob);
          console.log('转换为Base64成功，长度:', base64Audio.length);
          if (options.onRecordingComplete) {
            options.onRecordingComplete(base64Audio);
          }
        } catch (error) {
          console.error('转换音频失败:', error);
        }
        
      } catch (stopError) {
        console.error('停止录音失败:', stopError);
      }
      
      // 清理资源
      setTimeout(() => {
        if (recorderRef.current) {
          // 注意：不要在这里destroy，因为destroy会清除所有数据
          // 我们需要在组件卸载时才destroy
        }
      }, 500);
    } 
    
    setIsRecording(false); // 确保UI状态正确
  };

  return {
    isRecording,
    audioUrl,
    startRecording,
    stopRecording,
    mediaRecorder: null, // js-audio-recorder不直接暴露MediaRecorder实例
    currentAudioBlob,
    audioDevices,
    selectedDeviceId,
    setSelectedDeviceId,
    loadAudioDevices
  };
}

export default useRecord;
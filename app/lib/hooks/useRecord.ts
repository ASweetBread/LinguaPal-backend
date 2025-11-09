import { useState, useRef, useEffect } from 'react';

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
 * 录音功能的自定义Hook
 */
export function useRecord(options: UseRecordOptions = {}): UseRecordReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [currentAudioBlob, setCurrentAudioBlob] = useState<Blob | null>(null);
  const [audioDevices, setAudioDevices] = useState<AudioDevice[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const audioChunksRef = useRef<Blob[]>([]); // 使用ref避免状态更新延迟
  const recorderRef = useRef<MediaRecorder | null>(null); // 使用ref来持有recorder引用

  useEffect(() => {
    // 组件卸载时清理
    return () => {
      if (recorderRef.current && recorderRef.current.state !== 'inactive') {
        recorderRef.current.stop();
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioElementRef.current) {
        audioElementRef.current.srcObject = null;
        audioElementRef.current = null;
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
      if (!mediaStreamRef.current) {
        const tempStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        tempStream.getTracks().forEach(track => track.stop());
      }
      
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
        if (recorderRef.current.state !== 'inactive') {
          recorderRef.current.stop();
        }
        recorderRef.current = null;
      }
      
      console.log('开始获取媒体流...');
      
      // 根据是否选择了设备ID来构建约束条件
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
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('媒体流获取成功，流ID:', stream.id);
      mediaStreamRef.current = stream;
      
      // 检查流的音轨状态
      const audioTracks = stream.getAudioTracks();
      console.log('音轨数量:', audioTracks.length);
      audioTracks.forEach((track, index) => {
        console.log(`音轨${index}状态:`, track.enabled ? '启用' : '禁用', '就绪状态:', track.readyState);
        console.log(`音轨${index}标签:`, track.label);
        // 确保音轨是启用的
        if (!track.enabled) {
          track.enabled = true;
          console.log(`已启用音轨${index}`);
        }
      });
      
      // 创建音频元素并使用流，防止流被过早停止
      // audioElementRef.current = new Audio();
      // audioElementRef.current.srcObject = stream;
      // audioElementRef.current.muted = true; // 静音以避免反馈
      
      // 尝试播放音频元素，但处理可能的自动播放限制
      // try {
      //   // await audioElementRef.current.play();
      //   console.log('音频元素播放成功');
      // } catch (playError) {
      //   console.warn('音频元素自动播放失败（浏览器限制）:', playError);
      // }
      
      // 创建MediaRecorder，尝试使用合适的MIME类型
      // 获取所有支持的MIME类型并选择第一个
      const supportedTypes = ['audio/webm;codecs=opus', 'audio/webm', 'audio/wav', 'audio/ogg;codecs=opus'];
      let mimeType = supportedTypes.find(type => MediaRecorder.isTypeSupported(type)) || 'audio/webm';
      
      console.log('可用的MediaRecorder MIME类型检测:');
      supportedTypes.forEach(type => {
        console.log(`${type}: ${MediaRecorder.isTypeSupported(type) ? '支持' : '不支持'}`);
      });
      console.log('选择的MIME类型:', mimeType);
      
      // 创建MediaRecorder实例
      const recorder = new MediaRecorder(stream, { mimeType });
      recorderRef.current = recorder; // 保存到ref中
      audioChunksRef.current = []; // 重置音频块
      
      // 添加错误处理
      recorder.onerror = (event) => {
        console.error('MediaRecorder错误:', event.error?.name, event.error?.message, '状态:', recorder.state);
        // 提供更详细的错误信息
        if (event.error) {
          console.error('错误详情:', event.error);
        }
      };
      
      // 添加状态变化监听
      recorder.onstart = () => {
        console.log('录音开始，recorder状态:', recorder.state);
        // 只有当状态确实是'recording'时才设置isRecording为true
        if (recorder.state === 'recording') {
          setIsRecording(true);
        }
      };
      
      recorder.onpause = () => {
        console.log('录音暂停，recorder状态:', recorder.state);
      };
      
      recorder.onresume = () => {
        console.log('录音恢复，recorder状态:', recorder.state);
      };
      
      recorder.ondataavailable = (event) => {
        console.log('ondataavailable触发，数据大小:', event.data.size, '类型:', event.data.type);
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
          // 也更新状态，用于UI显示
          setAudioChunks(prev => [...prev, event.data]);
        } else {
          console.warn('收到空数据块');
        }
      };
      
      recorder.onstop = async () => {
        console.log('onstop触发，recorder状态:', recorder.state, '收集的音频块数量:', audioChunksRef.current.length);
        
        setIsRecording(false); // 确保UI状态正确
        
        // 使用ref中的数据而不是state，避免异步问题
        if (audioChunksRef.current.length > 0) {
          const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
          console.log('创建的Blob大小:', audioBlob.size, '类型:', audioBlob.type);
          
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
        } else {
          console.error('没有收集到音频数据');
          setCurrentAudioBlob(null);
        }
      };
      
      // 设置状态
      setMediaRecorder(recorder);
      setAudioChunks([]);
      setCurrentAudioBlob(null);
      
      // 开始录音，使用不同的timeslice值
      try {
        // 尝试不带timeslice参数，让MediaRecorder使用默认行为
        recorder.start(1000);
        console.log('recorder.start()调用完成');
        
        // 验证recorder状态
        setTimeout(() => {
          console.log('recorder启动后状态:', recorder.state);
          // 如果状态不是recording，可能是失败了
          if (recorder.state !== 'recording') {
            console.error('recorder未成功启动，当前状态:', recorder.state);
          }
        }, 100);
      } catch (startError) {
        console.error('调用recorder.start()失败:', startError);
        throw new Error('启动录音失败');
      }
      
      // 不在这里设置isRecording，而是在onstart回调中设置
      console.log('录音初始化完成');
    } catch (error) {
      console.error('录音失败:', error);
      // 清理资源
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
      }
      if (audioElementRef.current) {
        audioElementRef.current.srcObject = null;
        audioElementRef.current = null;
      }
      setIsRecording(false);
      throw new Error('无法访问麦克风，请确保已授予权限');
    }
  };
  
  // 停止录音
  const stopRecording = () => {
    console.log('stopRecording被调用，当前recorder状态:', recorderRef.current?.state);
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      try {
        recorderRef.current.stop();
        console.log('recorder.stop()已调用');
      } catch (stopError) {
        console.error('调用recorder.stop()失败:', stopError);
      }
      
      // 延迟清理资源，确保onstop事件完成
      setTimeout(() => {
        // 清空音频元素
        if (audioElementRef.current) {
          audioElementRef.current.srcObject = null;
          audioElementRef.current = null;
          console.log('音频元素已清理');
        }
        
        // 停止所有音轨
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach(track => {
            track.stop();
            console.log('音轨已停止');
          });
          mediaStreamRef.current = null;
          console.log('媒体流已清理');
        }
      }, 500);
    } else {
      console.log('recorder状态为inactive，无需停止');
      setIsRecording(false); // 确保UI状态正确
    }
  };

  return {
    isRecording,
    audioUrl,
    startRecording,
    stopRecording,
    mediaRecorder,
    currentAudioBlob,
    audioDevices,
    selectedDeviceId,
    setSelectedDeviceId,
    loadAudioDevices
  };
}

export default useRecord;
import React, { useRef, useState } from 'react';
import { Camera, Upload, Video, Image as ImageIcon } from 'lucide-react';
import { storage } from '../utils/storage';

export default function CameraComponent() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [mode, setMode] = useState<'photo' | 'video'>('photo');

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: mode === 'video'
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setMediaStream(stream);

      if (mode === 'video') {
        mediaRecorderRef.current = new MediaRecorder(stream);
        mediaRecorderRef.current.ondataavailable = (e) => {
          if (e.data.size > 0) {
            chunksRef.current.push(e.data);
          }
        };
        mediaRecorderRef.current.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: 'video/webm' });
          const url = URL.createObjectURL(blob);
          saveMedia(url, 'video');
          chunksRef.current = [];
        };
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
    }
  };

  const stopCamera = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      setMediaStream(null);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  };

  const toggleRecording = () => {
    if (!isRecording) {
      mediaRecorderRef.current?.start();
      setIsRecording(true);
    } else {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
      const photoUrl = canvas.toDataURL('image/jpeg');
      saveMedia(photoUrl, 'photo');
    }
  };

  const saveMedia = (url: string, type: 'photo' | 'video') => {
    const currentUser = storage.get('currentUser');
    const newMedia = {
      id: Date.now().toString(),
      type,
      url,
      timestamp: Date.now(),
      tags: [],
      creator: currentUser?.username || 'unknown'
    };
    storage.append('media', newMedia);
    setShowPreview(true);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const type = file.type.startsWith('image/') ? 'photo' : 'video';
      saveMedia(url, type);
    }
  };

  return (
    <div className="relative w-full max-w-lg mx-auto space-y-4">
      {/* Mode Selection */}
      <div className="flex justify-center gap-2">
        <button
          onClick={() => {
            setMode('photo');
            stopCamera();
          }}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
            mode === 'photo'
              ? 'bg-yellow-500 text-white'
              : 'bg-white/10 text-white/70'
          }`}
        >
          <ImageIcon className="w-5 h-5" />
          Photo
        </button>
        <button
          onClick={() => {
            setMode('video');
            stopCamera();
          }}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
            mode === 'video'
              ? 'bg-yellow-500 text-white'
              : 'bg-white/10 text-white/70'
          }`}
        >
          <Video className="w-5 h-5" />
          Video
        </button>
      </div>

      {/* Camera View */}
      <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
        
        {!mediaStream && (
          <button
            onClick={startCamera}
            className="absolute inset-0 flex items-center justify-center bg-gray-900/50"
          >
            <Camera className="w-16 h-16 text-white" />
          </button>
        )}
        
        {mediaStream && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4">
            {mode === 'photo' ? (
              <button
                onClick={capturePhoto}
                className="w-14 h-14 rounded-full bg-white shadow-lg flex items-center justify-center"
              >
                <div className="w-12 h-12 rounded-full border-2 border-gray-800" />
              </button>
            ) : (
              <button
                onClick={toggleRecording}
                className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center ${
                  isRecording ? 'bg-red-500' : 'bg-white'
                }`}
              >
                <div className={`w-12 h-12 rounded-full border-2 ${
                  isRecording ? 'border-white' : 'border-gray-800'
                }`} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* File Upload */}
      <div className="flex justify-center">
        <label className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg cursor-pointer flex items-center gap-2 text-white">
          <Upload className="w-5 h-5" />
          Upload Media
          <input
            type="file"
            accept="image/*,video/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </div>
    </div>
  );
}
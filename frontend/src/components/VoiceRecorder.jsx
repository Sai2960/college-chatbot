/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-empty */
/* eslint-disable no-unused-vars */
import React, { useState, useRef, useEffect } from 'react';
import { FaMicrophone, FaStop, FaTimes, FaPaperPlane, FaVolumeUp, FaEdit, FaCheckCircle } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const VoiceRecorder = ({ onSendVoice, onClose, currentChat }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [showEditMode, setShowEditMode] = useState(false);
  const [editedTranscript, setEditedTranscript] = useState('');
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const recognitionRef = useRef(null);
  const streamRef = useRef(null);
  const isActiveRef = useRef(false);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const volumeCheckRef = useRef(null);
  
  // CRITICAL: Store ALL speech as it comes
  const allSpokenTextRef = useRef('');
  const lastFinalIndexRef = useRef(0);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      // OPTIMAL SETTINGS
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-IN';
      recognitionRef.current.maxAlternatives = 5; // More alternatives!

      recognitionRef.current.onstart = () => {
        console.log('🎤 Started');
        allSpokenTextRef.current = '';
        lastFinalIndexRef.current = 0;
      };

      recognitionRef.current.onresult = (event) => {
        if (!isActiveRef.current) return;
        
        console.log('📊 Got', event.results.length, 'results');
        
        // Build complete transcript from ALL results
        let finalParts = [];
        let latestInterim = '';
        
        // Process EVERY result
        for (let i = 0; i < event.results.length; i++) {
          const result = event.results[i];
          
          if (result.isFinal) {
            // FINAL result - this is confirmed text
            const text = result[0].transcript;
            console.log('✅ FINAL:', text);
            finalParts.push(text);
          } else if (i === event.results.length - 1) {
            // Latest interim (current speaking)
            latestInterim = result[0].transcript;
            console.log('💬 INTERIM:', latestInterim);
          }
        }
        
        // Combine all finals
        const completeFinal = finalParts.join(' ').trim();
        allSpokenTextRef.current = completeFinal;
        
        // Update display
        setTranscript(completeFinal);
        
        console.log('📝 Complete:', completeFinal);
        console.log('📝 Interim:', latestInterim);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('❌', event.error);
        if (event.error === 'not-allowed') {
          alert('🎤 Mic access denied!');
          stopRecordingImmediate();
        }
      };

      recognitionRef.current.onend = () => {
        console.log('🔴 Ended. Active:', isActiveRef.current);
        if (isActiveRef.current) {
          setTimeout(() => {
            if (isActiveRef.current && recognitionRef.current) {
              try {
                recognitionRef.current.start();
                console.log('🔄 Restarted');
              } catch (e) {
                if (!e.message.includes('already')) {
                  console.log('Restart err:', e.message);
                }
              }
            }
          }, 150);
        }
      };
    } else {
      alert('⚠️ Use Chrome browser!');
    }

    return () => cleanup();
  }, []);

  const cleanup = () => {
    console.log('🧹 Cleanup');
    isActiveRef.current = false;
    if (timerRef.current) clearInterval(timerRef.current);
    if (volumeCheckRef.current) cancelAnimationFrame(volumeCheckRef.current);
    if (audioContextRef.current) audioContextRef.current.close().catch(() => {});
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }
    if (window.speechSynthesis) window.speechSynthesis.cancel();
  };

  const setupVolumeMonitoring = (stream) => {
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    analyserRef.current = audioContextRef.current.createAnalyser();
    const source = audioContextRef.current.createMediaStreamSource(stream);
    
    analyserRef.current.fftSize = 512;
    analyserRef.current.smoothingTimeConstant = 0.85;
    source.connect(analyserRef.current);
    
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    
    const checkVolume = () => {
      if (!isActiveRef.current) return;
      analyserRef.current.getByteFrequencyData(dataArray);
      const avg = dataArray.reduce((a, b) => a + b) / dataArray.length;
      setVolumeLevel(Math.min(100, avg * 1.5)); // Boost display
      volumeCheckRef.current = requestAnimationFrame(checkVolume);
    };
    
    checkVolume();
  };

  const startRecording = async () => {
    try {
      console.log('🎬 Start');
      
      isActiveRef.current = true;
      allSpokenTextRef.current = '';
      lastFinalIndexRef.current = 0;
      setTranscript('');
      setVolumeLevel(0);
      audioChunksRef.current = [];
      setShowEditMode(false);

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      streamRef.current = stream;
      setupVolumeMonitoring(stream);

      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      mediaRecorderRef.current.start(100);

      setIsRecording(true);
      setRecordingTime(0);
      
      timerRef.current = setInterval(() => {
        setRecordingTime(p => p + 1);
      }, 1000);

      // Wait for mic to stabilize
      setTimeout(() => {
        if (isActiveRef.current && recognitionRef.current) {
          try {
            recognitionRef.current.start();
            console.log('🎤 Recognition started');
          } catch (e) {
            console.error('Start err:', e);
          }
        }
      }, 800);

    } catch (error) {
      console.error('Error:', error);
      isActiveRef.current = false;
      alert('Mic error: ' + error.message);
    }
  };

  const stopRecordingImmediate = () => {
    isActiveRef.current = false;
    setIsRecording(false);
    cleanup();
  };

  const stopRecording = () => {
    if (recordingTime < 1) {
      alert('⏱️ Speak for 1+ second!');
      return;
    }
    
    console.log('🛑 Stop');
    
    isActiveRef.current = false;
    setIsRecording(false);
    setIsProcessing(true);

    if (timerRef.current) clearInterval(timerRef.current);
    if (volumeCheckRef.current) cancelAnimationFrame(volumeCheckRef.current);
    
    // CRITICAL: Wait for Chrome to finalize
    setTimeout(() => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
          console.log('✅ Stopped');
        } catch (e) {}
      }

      // Wait for final results
      setTimeout(() => {
        if (mediaRecorderRef.current?.state !== 'inactive') {
          mediaRecorderRef.current.stop();
        }
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(t => t.stop());
        }

        // Process after extended wait
        setTimeout(() => {
          const finalText = allSpokenTextRef.current.trim();
          
          console.log('📄 FINAL TEXT:', finalText);
          console.log('📄 Length:', finalText.length);
          
          if (finalText && finalText.length > 2) {
            // Success - show edit mode
            setEditedTranscript(finalText);
            setShowEditMode(true);
            setIsProcessing(false);
          } else {
            // No speech detected
            setIsProcessing(false);
            alert(
              `❌ No clear speech detected!\n\n` +
              `🎯 CRITICAL TIPS:\n\n` +
              `1. 🔇 Complete SILENCE in background\n` +
              `2. 🎤 Speak 6-8 inches from mic\n` +
              `3. 🗣️ Speak NATURALLY - not too fast/slow\n` +
              `4. ⏱️ Speak 3-5 seconds minimum\n` +
              `5. ⏸️ PAUSE 4-5 seconds after\n` +
              `6. 👀 Check green volume bar\n\n` +
              `💡 Try: "Tell me about BCA course"\n` +
              `(Natural speech works best!)`
            );
          }
        }, 5000); // 5 SECOND wait for finals!
      }, 2000);
    }, 1500);
  };

  const handleSendEdited = () => {
    const text = editedTranscript.trim();
    if (text.length > 2) {
      setShowEditMode(false);
      setIsProcessing(true);
      sendToBackend(text);
    }
  };

  const handleRetry = () => {
    setShowEditMode(false);
    setIsProcessing(false);
    setTranscript('');
    setEditedTranscript('');
    allSpokenTextRef.current = '';
  };

  const sendToBackend = async (text) => {
    setIsProcessing(true);
    console.log('📤 Sending:', text);
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/chat/voice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: text,
          chatId: currentChat?._id
        })
      });

      const data = await response.json();
      
      if (data.success) {
        console.log('✅ Response:', data.data.message);
        speakResponse(data.data.message);
        
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        if (onSendVoice) onSendVoice(audioBlob);

        setTimeout(() => {
          if (!window.speechSynthesis.speaking) onClose();
        }, 2000);
      } else {
        throw new Error(data.error || 'Failed');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed: ' + error.message);
      setIsProcessing(false);
    }
  };

  const speakResponse = (text) => {
    if ('speechSynthesis' in window) {
      setIsSpeaking(true);
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-IN';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      
      utterance.onend = () => {
        setIsSpeaking(false);
        setIsProcessing(false);
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
        setIsProcessing(false);
      };
      
      setTimeout(() => window.speechSynthesis.speak(utterance), 200);
    } else {
      setIsProcessing(false);
    }
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, y: 30 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 30 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-lg w-full shadow-2xl border border-gray-200 dark:border-gray-700"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <FaMicrophone className="text-purple-500" />
              Voice Chat
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition">
              <FaTimes className="text-gray-500" />
            </button>
          </div>

          <div className="flex flex-col items-center space-y-5">
            {showEditMode ? (
              /* ✅ EDIT & VERIFY MODE */
              <div className="w-full space-y-4">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-400 dark:border-blue-600 rounded-2xl p-5 shadow-sm">
                  <p className="text-sm font-bold text-blue-800 dark:text-blue-200 mb-3 flex items-center gap-2">
                    <FaEdit className="text-lg" />
                    Verify & Edit Your Question
                  </p>
                  <textarea
                    value={editedTranscript}
                    onChange={(e) => setEditedTranscript(e.target.value)}
                    className="w-full p-4 border-2 border-blue-300 dark:border-blue-600 rounded-xl bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium text-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none shadow-sm"
                    rows={5}
                    placeholder="Edit if needed..."
                    autoFocus
                  />
                  <p className="text-xs text-blue-600 dark:text-blue-300 mt-3 flex items-center gap-1">
                    <FaCheckCircle />
                    Looks good? Click Send. Need to fix? Edit above.
                  </p>
                </div>

                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSendEdited}
                    disabled={!editedTranscript.trim()}
                    className="flex-1 px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    <FaPaperPlane />
                    Send Question
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleRetry}
                    className="px-6 py-4 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-white rounded-xl font-bold transition"
                  >
                    Retry
                  </motion.button>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 rounded-lg p-4">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    <strong>💡 Common Fixes:</strong><br/>
                    • Change "levels" → "syllabus"<br/>
                    • Change "BC" → "BCA"<br/>
                    • Fix any misheard words
                  </p>
                </div>
              </div>
            ) : !isRecording && !isProcessing && !isSpeaking ? (
              /* 🎤 START SCREEN */
              <>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startRecording}
                  className="w-36 h-36 bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 rounded-full flex items-center justify-center shadow-2xl hover:shadow-purple-500/50 transition-all"
                >
                  <FaMicrophone className="text-6xl text-white drop-shadow-lg" />
                </motion.button>
                
                <p className="text-gray-600 dark:text-gray-400 font-semibold text-lg text-center">
                  Tap microphone to start
                </p>

                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-6 w-full border border-indigo-200 dark:border-indigo-800">
                  <p className="font-bold mb-4 text-indigo-700 dark:text-indigo-300 flex items-center gap-2 text-base">
                    <FaVolumeUp />
                    🎯 Pro Tips for Best Results
                  </p>
                  <ul className="space-y-3 text-gray-700 dark:text-gray-300 text-sm">
                    <li className="flex gap-3">
                      <span className="text-indigo-600 dark:text-indigo-400 font-bold shrink-0">1.</span>
                      <span>Find a <strong>quiet place</strong> (no background noise)</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-indigo-600 dark:text-indigo-400 font-bold shrink-0">2.</span>
                      <span>Speak at <strong>normal conversational pace</strong></span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-indigo-600 dark:text-indigo-400 font-bold shrink-0">3.</span>
                      <span>Hold mic <strong>6-8 inches</strong> from mouth</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-indigo-600 dark:text-indigo-400 font-bold shrink-0">4.</span>
                      <span><strong>PAUSE 4-5 seconds</strong> after speaking</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-indigo-600 dark:text-indigo-400 font-bold shrink-0">5.</span>
                      <span>You'll get to <strong>review & edit</strong> before sending!</span>
                    </li>
                  </ul>
                  <div className="mt-4 bg-white dark:bg-gray-700 rounded-xl p-4 border-2 border-indigo-300 dark:border-indigo-600 shadow-sm">
                    <p className="text-xs font-bold text-indigo-700 dark:text-indigo-300 mb-2">
                      ✅ Try saying:
                    </p>
                    <p className="text-base text-gray-800 dark:text-gray-200 font-semibold">
                      "Tell me about the BCA course"
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      (Speak naturally, like talking to a friend)
                    </p>
                  </div>
                </div>
              </>
            ) : isProcessing || isSpeaking ? (
              /* ⏳ PROCESSING */
              <div className="text-center py-12">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                  className="w-28 h-28 bg-gradient-to-br from-green-400 via-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl"
                >
                  <FaVolumeUp className="text-5xl text-white" />
                </motion.div>
                <p className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">
                  {isSpeaking ? '🔊 AI Speaking...' : '🤔 Processing...'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {isSpeaking ? 'Listen to the response' : 'Analyzing your question'}
                </p>
              </div>
            ) : (
              /* 🔴 RECORDING */
              <div className="flex flex-col items-center space-y-5 w-full">
                <motion.div
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                  className="w-36 h-36 bg-gradient-to-br from-red-500 via-pink-500 to-red-600 rounded-full flex items-center justify-center shadow-2xl relative"
                >
                  <FaMicrophone className="text-6xl text-white drop-shadow-xl" />
                  <motion.div 
                    className="absolute inset-0 rounded-full border-4 border-green-400"
                    animate={{
                      opacity: volumeLevel / 100,
                      scale: 1 + (volumeLevel / 150)
                    }}
                    transition={{ duration: 0.2 }}
                  />
                </motion.div>

                <div className="text-6xl font-mono font-black text-red-500 drop-shadow-lg">
                  {formatTime(recordingTime)}
                </div>

                {/* Volume bar */}
                <div className="w-full">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden shadow-inner">
                    <motion.div 
                      className="h-4 rounded-full bg-gradient-to-r from-green-400 via-green-500 to-green-600 shadow-lg"
                      animate={{ width: `${volumeLevel}%` }}
                      transition={{ duration: 0.15 }}
                    />
                  </div>
                  <p className="text-sm text-center mt-2 font-semibold">
                    {volumeLevel > 30 ? '✅ Perfect!' : volumeLevel > 15 ? '👌 Good' : '🔇 Speak louder'}
                  </p>
                </div>

                {/* Live transcript */}
                {transcript ? (
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border-2 border-green-500 dark:border-green-600 rounded-2xl p-5 w-full shadow-lg">
                    <p className="text-sm font-bold text-green-800 dark:text-green-200 mb-3 flex items-center gap-2">
                      <motion.span
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                      >
                        ✅
                      </motion.span>
                      Capturing...
                    </p>
                    <p className="text-gray-900 dark:text-gray-100 font-semibold text-lg leading-relaxed">
                      {transcript}
                    </p>
                  </div>
                ) : (
                  <motion.div
                    animate={{ scale: [1, 1.02, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-2 border-yellow-400 dark:border-yellow-600 rounded-2xl p-5 w-full text-center shadow-lg"
                  >
                    <p className="text-2xl text-yellow-800 dark:text-yellow-200 font-bold mb-2">
                      {recordingTime < 1 ? '⏳ Initializing...' : '🎤 Listening...'}
                    </p>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      {recordingTime < 1 ? 'Please wait' : 'Speak now!'}
                    </p>
                  </motion.div>
                )}

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={stopRecording}
                  disabled={recordingTime < 1}
                  className="px-8 py-4 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white rounded-2xl font-bold text-lg shadow-2xl flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <FaStop className="text-xl" />
                  Stop & Review
                  <FaEdit className="text-xl" />
                </motion.button>

                <p className="text-sm text-gray-500 dark:text-gray-400 text-center font-medium">
                  💡 Finish speaking, PAUSE 4-5 seconds, then click Stop
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default VoiceRecorder;
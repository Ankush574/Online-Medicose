import React, { useState, useContext, useEffect, useRef } from "react";
import "./Chatbot.css";
import { AuthContext } from "./AuthContext";
import { useTheme } from "./ThemeContext";
import Tesseract from "tesseract.js";
import {
  fetchBotReply,
  createDraftPrescriptionsFromOcr,
} from "./chatService";
import ChatWindow from "./ChatWindow";
import { useAppointmentFlow } from "./useAppointmentFlow";

const Chatbot = () => {
  const { user } = useContext(AuthContext);
  const { mode: themeMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [input, setInput] = useState("");
  const displayName = user?.name || user?.email || "there";

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "bot",
      text: `Hi ${displayName}! I can help you book appointments, manage prescriptions, request refills, track orders, or navigate your dashboard. What would you like to do?`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      createdAt: Date.now(),
    },
  ]);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [cameraStatus, setCameraStatus] = useState("");
  const [isOcrRunning, setIsOcrRunning] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [pendingOcrMeds, setPendingOcrMeds] = useState(null);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  const [language, setLanguage] = useState(() => {
    if (typeof window === "undefined") return "en";
    try {
      const stored = window.localStorage.getItem("medicose_chat_language");
      return stored === "hi" ? "hi" : "en";
    } catch {
      return "en";
    }
  });

  const inputPlaceholders = [
    "Book appointment with dentist",
    "Refill my BP medicine",
    "Show my last prescription",
  ];

  const openPrescriptionFilePicker = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Auto-scroll to the latest message whenever messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Rotate input placeholder suggestions when the user isn't typing
  useEffect(() => {
    if (typeof window === "undefined") return;
    const interval = window.setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % inputPlaceholders.length);
    }, 8000);
    return () => window.clearInterval(interval);
  }, [inputPlaceholders.length]);

  // Setup Web Speech API for voice input
  useEffect(() => {
    if (typeof window === "undefined") return;
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      recognitionRef.current = null;
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language === "hi" ? "hi-IN" : "en-US";
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      let finalTranscript = "";
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const res = event.results[i];
        if (res.isFinal) {
          finalTranscript += res[0].transcript;
        } else {
          interim += res[0].transcript;
        }
      }

      if (finalTranscript) {
        setInput((prev) => (prev ? `${prev} ${finalTranscript}` : finalTranscript));
      }
      setInterimTranscript(interim);
    };
    recognition.onerror = () => {
      setIsListening(false);
    };
    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript("");
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
      recognitionRef.current = null;
    };
  }, [language]);

  const handleToggle = () => {
    setIsOpen((prev) => {
      const next = !prev;
      if (next) {
        setIsCollapsed(false);
      }
      return next;
    });
  };

  const [soundEnabled, setSoundEnabled] = useState(() => {
    if (typeof window === "undefined") return true;
    try {
      const stored = window.localStorage.getItem("medicose_chat_sound");
      return stored !== "off";
    } catch {
      return true;
    }
  });

  const toggleSound = () => {
    setSoundEnabled((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem("medicose_chat_sound", next ? "on" : "off");
        if (!next && typeof window !== "undefined" && window.speechSynthesis) {
          // Immediately stop any ongoing spoken reply when sound is turned off
          window.speechSynthesis.cancel();
        }
      } catch {
        // ignore storage errors
      }
      return next;
    });
  };

  const toggleLanguage = () => {
    setLanguage((prev) => {
      const next = prev === "en" ? "hi" : "en";
      try {
        if (typeof window !== "undefined") {
          window.localStorage.setItem("medicose_chat_language", next);
        }
      } catch {
        // ignore storage errors
      }

      if (recognitionRef.current) {
        try {
          recognitionRef.current.lang = next === "hi" ? "hi-IN" : "en-US";
        } catch {
          // ignore speech recognition errors
        }
      }

      return next;
    });
  };

  const handleInputChange = (value) => {
    if (value.length > MAX_INPUT_CHARS) {
      setInput(value.slice(0, MAX_INPUT_CHARS));
    } else {
      setInput(value);
    }
  };

  // Speak bot replies using browser text-to-speech
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!soundEnabled) return;

    const last = messages[messages.length - 1];
    if (!last || last.sender !== "bot" || !last.text) return;
    if (last.suppressTts) return;

    // Avoid speaking very long paragraphs
    if (last.text.length > 400) return;

    try {
      const synth = window.speechSynthesis;
      if (!synth) return;

      synth.cancel();
      const utterance = new SpeechSynthesisUtterance(last.text);
      utterance.rate = 1;
      utterance.pitch = 1;
      synth.speak(utterance);
    } catch {
      // ignore TTS errors
    }
  }, [messages, soundEnabled]);

  const playNotificationSound = () => {
    if (!soundEnabled || typeof window === "undefined") return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = 880;
      gain.gain.value = 0.05;
      osc.connect(gain);
      gain.connect(ctx.destination);
      const now = ctx.currentTime;
      osc.start(now);
      osc.stop(now + 0.12);
    } catch {
      // ignore audio errors
    }
  };

  const {
    flow,
    startBookFlow,
    startRescheduleFlow,
    startCancelFlow,
    showUpcomingAppointments,
    handleFlowInput,
  } = useAppointmentFlow({
    user,
    setMessages,
    setInput,
    setIsSending,
    playNotificationSound,
  });

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Voice input is not supported in this browser.");
      return;
    }
    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);

        const botMessage = {
          id: Date.now(),
          sender: "bot",
          text: "Listening… please speak clearly near your microphone.",
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          createdAt: Date.now(),
          suppressTts: true,
        };
        setMessages((prev) => [...prev, botMessage]);
      } catch {
        setIsListening(false);
      }
    }
  };

  const toggleCamera = async () => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices) {
      setCameraStatus("Camera not supported in this browser.");
      alert("Camera is not supported in this browser.");
      return;
    }

    if (!window.isSecureContext) {
      const msg =
        "Camera requires HTTPS or http://localhost. Please run the app with 'npm run dev' or another local server.";
      setCameraStatus(msg);
      alert(msg);
      return;
    }

    if (cameraEnabled) {
      const videoEl = videoRef.current;
      const stream = videoEl && videoEl.srcObject;
      if (stream && stream.getTracks) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (videoEl) {
        videoEl.srcObject = null;
      }
      setCameraEnabled(false);
      setCameraStatus("");
      return;
    }

    try {
      setCameraStatus("Starting camera…");
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const videoEl = videoRef.current;
      if (videoEl) {
        videoEl.srcObject = stream;
        try {
          // Some browsers need onloadedmetadata before play() so that
          // videoWidth / videoHeight are set correctly.
          const startPlayback = () => {
            try {
              const playPromise = videoEl.play();
              if (playPromise && typeof playPromise.then === "function") {
                playPromise.catch(() => {
                  // Ignore autoplay rejection; user can tap to start video
                });
              }
            } catch {
              // ignore video play errors
            }
          };

          if (videoEl.readyState >= 2) {
            startPlayback();
          } else {
            videoEl.onloadedmetadata = () => {
              startPlayback();
            };
          }
        } catch {
          // ignore video play setup errors
        }
      }
      setCameraEnabled(true);
      setCameraStatus("Camera on");
    } catch (err) {
      console.error("Camera access denied", err);
      const message =
        "Unable to access camera. Please check browser permissions and ensure no other app is using the camera.";
      setCameraStatus(message);
      alert(message);
    }
  };

  // Capture current camera frame and run OCR
  const runOcrOnCurrentFrame = async () => {
    if (typeof document === "undefined") {
      return { ok: false, error: "Document context is not available." };
    }

    const videoEl = videoRef.current;
    if (!videoEl) {
      return { ok: false, error: "Camera is not active. Please turn it on first." };
    }

    // Wait briefly for the camera to produce frames so videoWidth/videoHeight become non-zero
    const waitForVideoReady = () =>
      new Promise((resolve) => {
        const start = Date.now();
        const check = () => {
          if (videoEl.videoWidth && videoEl.videoHeight) {
            resolve(true);
            return;
          }
          if (Date.now() - start > 5000) {
            resolve(false);
            return;
          }
          setTimeout(check, 150);
        };
        check();
      });

    const ready = await waitForVideoReady();
    if (!ready) {
      return {
        ok: false,
        error:
          "Camera image is not ready yet. Please hold the prescription steady in front of the camera for a few seconds, then tap 'Scan Prescription' again.",
      };
    }

    const width = videoEl.videoWidth;
    const height = videoEl.videoHeight;

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return { ok: false, error: "Canvas drawing is not supported in this browser." };
    }

    // Basic crop/pad to center region to reduce background noise
    const targetWidth = Math.floor(width * 0.8);
    const targetHeight = Math.floor(height * 0.8);
    const sx = Math.floor((width - targetWidth) / 2);
    const sy = Math.floor((height - targetHeight) / 2);

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(videoEl, sx, sy, targetWidth, targetHeight, 0, 0, width, height);

    try {
      const result = await Tesseract.recognize(canvas, "eng");
      const text = (result?.data?.text || "").trim();
      if (!text) {
        return { ok: false, error: "I couldn't read any text from the image. Please try again." };
      }

      const lines = text
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

      const medicineRegex = /(mg|ml|tablet|tab\b|capsule|cap\b)/i;
      const medicineLines = lines.filter((l) => medicineRegex.test(l));
      const otherLines = lines.filter((l) => !medicineRegex.test(l));

      const parsedMedicines = medicineLines.map((line) => {
        // Very lightweight parser: try to grab name and strength tokens
        const parts = line.split(/\s+/);
        let name = "";
        let strength = "";
        parts.forEach((p) => {
          if (!strength && /(mg|ml)/i.test(p)) {
            strength = p;
          } else if (!name) {
            name = p;
          }
        });
        return {
          originalLine: line,
          medicineName: name || line,
          strength: strength || "",
        };
      });

      return {
        ok: true,
        text,
        medicineLines,
        otherLines,
        parsedMedicines,
      };
    } catch (err) {
      console.error("OCR failed", err);
      return {
        ok: false,
        error:
          "OCR failed while reading the prescription. Please adjust the lighting and focus, then try again.",
      };
    }
  };

  // Run OCR on an uploaded image file
  const runOcrOnUploadedFile = async (file) => {
    if (!file) {
      return { ok: false, error: "No file selected." };
    }

    if (typeof document === "undefined") {
      return { ok: false, error: "Document context is not available." };
    }

    if (!file.type.startsWith("image/")) {
      return { ok: false, error: "Please upload an image file (jpg, png, etc.)." };
    }

    const imageUrl = URL.createObjectURL(file);
    const img = new Image();

    const loadImage = () =>
      new Promise((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Failed to load image."));
        img.src = imageUrl;
      });

    try {
      await loadImage();

      const width = img.naturalWidth || img.width;
      const height = img.naturalHeight || img.height;
      if (!width || !height) {
        return { ok: false, error: "Image has no valid size." };
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        return { ok: false, error: "Canvas drawing is not supported in this browser." };
      }

      const targetWidth = Math.floor(width * 0.8);
      const targetHeight = Math.floor(height * 0.8);
      const sx = Math.floor((width - targetWidth) / 2);
      const sy = Math.floor((height - targetHeight) / 2);

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, sx, sy, targetWidth, targetHeight, 0, 0, width, height);

      try {
        const result = await Tesseract.recognize(canvas, "eng");
        const text = (result?.data?.text || "").trim();
        if (!text) {
          return {
            ok: false,
            error: "I couldn't read any text from the uploaded image. Please try again.",
          };
        }

        const lines = text
          .split("\n")
          .map((l) => l.trim())
          .filter((l) => l.length > 0);

        const medicineRegex = /(mg|ml|tablet|tab\b|capsule|cap\b)/i;
        const medicineLines = lines.filter((l) => medicineRegex.test(l));
        const otherLines = lines.filter((l) => !medicineRegex.test(l));

        const parsedMedicines = medicineLines.map((line) => {
          const parts = line.split(/\s+/);
          let name = "";
          let strength = "";
          parts.forEach((p) => {
            if (!strength && /(mg|ml)/i.test(p)) {
              strength = p;
            } else if (!name) {
              name = p;
            }
          });
          return {
            originalLine: line,
            medicineName: name || line,
            strength: strength || "",
          };
        });

        return {
          ok: true,
          text,
          medicineLines,
          otherLines,
          parsedMedicines,
        };
      } catch (err) {
        console.error("OCR failed", err);
        return {
          ok: false,
          error:
            "OCR failed while reading the uploaded prescription. Please try a clearer image.",
        };
      } finally {
        URL.revokeObjectURL(imageUrl);
      }
    } catch (err) {
      console.error("Image load failed", err);
      URL.revokeObjectURL(imageUrl);
      return { ok: false, error: "Failed to load the uploaded image." };
    }
  };

  const handleOcrResult = (result) => {
    let textReply;
    if (!result.ok) {
      textReply = result.error;
    } else {
      const { medicineLines, otherLines, parsedMedicines } = result;

      if (parsedMedicines && parsedMedicines.length) {
        setPendingOcrMeds(parsedMedicines);
      } else {
        setPendingOcrMeds(null);
      }

      const medSection =
        medicineLines && medicineLines.length
          ?
              "Medicines I detected:\n" +
              medicineLines.map((l, idx) => `${idx + 1}. ${l}`).join("\n") +
              "\n\n"
          : "I could not clearly identify medicine lines.\n\n";

      const otherSection =
        otherLines && otherLines.length
          ? "Other text on the prescription:\n" + otherLines.join("\n") + "\n\n"
          : "";

      const confirmHint =
        parsedMedicines && parsedMedicines.length
          ? "If this looks correct, type 'ADD MEDICINES' to create draft prescriptions from these lines, or 'CANCEL' if it is not correct."
          : "Because I could not clearly map medicines from this image, please add or update items manually in Dashboard → Prescriptions / Medications.";

      textReply =
        medSection +
        otherSection +
        "Please confirm everything before saving. This scan is for convenience only and does not replace professional medical advice. " +
        confirmHint;
    }

    const replyMsg = {
      id: Date.now() + 2,
      sender: "bot",
      text: textReply,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      createdAt: Date.now(),
      suppressTts: true,
    };
    setMessages((prev) => [...prev, replyMsg]);
    playNotificationSound();
  };

  const MAX_INPUT_CHARS = 300;

  const detectLocalIntent = (text) => {
    const lower = text.toLowerCase();

    const hasWord = (word) => lower.split(/[^a-z0-9]+/).includes(word);

    if (
      lower.includes("appointment") ||
      lower.includes("book doctor") ||
      lower.includes("see doctor") ||
      lower.includes("consult doctor") ||
      (hasWord("book") && hasWord("doctor"))
    ) {
      return "appointment.book";
    }

    return null;
  };

  const sendMessage = async (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    // Handle OCR confirmation commands locally before sending to backend
    if (pendingOcrMeds && trimmed.toUpperCase() === "ADD MEDICINES") {
      setPendingOcrMeds(null);

      const loadingMsg = {
        id: Date.now(),
        sender: "bot",
        text:
          "Okay, I'll create draft prescriptions from the scanned medicines. You can review and edit them in Dashboard → Prescriptions.",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        createdAt: Date.now(),
        suppressTts: true,
      };
      setMessages((prev) => [...prev, loadingMsg]);

      setIsSending(true);
      const result = await createDraftPrescriptionsFromOcr(pendingOcrMeds, user);
      setIsSending(false);

      const doneMsg = {
        id: Date.now() + 1,
        sender: "bot",
        text: result.ok
          ? `I created ${result.count} draft prescription(s) from your scan. Please review them in Dashboard → Prescriptions before relying on them.`
          : result.error ||
            "I couldn't create prescriptions from this scan. Please add or update medicines manually in Dashboard → Prescriptions.",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        createdAt: Date.now(),
        suppressTts: true,
      };
      setMessages((prev) => [...prev, doneMsg]);
      playNotificationSound();
      return;
    }

    if (pendingOcrMeds && trimmed.toUpperCase() === "CANCEL") {
      setPendingOcrMeds(null);
      const cancelMsg = {
        id: Date.now(),
        sender: "bot",
        text:
          "Okay, I won't save any medicines from that scan. You can still add them manually in Dashboard → Prescriptions.",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        createdAt: Date.now(),
        suppressTts: true,
      };
      setMessages((prev) => [...prev, cancelMsg]);
      playNotificationSound();
      return;
    }

    const localIntent = detectLocalIntent(trimmed);
    if (!flow && localIntent === "appointment.book") {
      startBookFlow();
      return;
    }

    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const userMessage = {
      id: Date.now(),
      sender: "user",
      text: trimmed,
      timestamp: time,
      createdAt: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    setIsSending(true);
    const replyText = await fetchBotReply(trimmed, user?.token, language);
    setIsSending(false);

    const botMessage = {
      id: Date.now() + 1,
      sender: "bot",
      text: replyText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      createdAt: Date.now(),
    };

    setMessages((prev) => [...prev, botMessage]);
    playNotificationSound();
  };

  const doctorOptions = [
    "Dr. Sarah Johnson (General Medicine)",
    "Dr. Ahmed Khan (Cardiology)",
    "Any available doctor",
  ];

  const handleBookAppointmentStep = async (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const userMessage = {
      id: Date.now(),
      sender: "user",
      text: trimmed,
      timestamp: time,
      createdAt: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    if (!flow || flow.type !== "bookAppointment") {
      return;
    }

    if (flow.step === 1) {
      const lower = trimmed.toLowerCase();
      if (lower.includes("option")) {
        const optionsText = doctorOptions
          .map((name, index) => `${index + 1}. ${name}`)
          .join("\n");

        const botMessage = {
          id: Date.now() + 1,
          sender: "bot",
          text:
            "Here are some doctors you can choose from. Reply with a number or the doctor's name:\n" +
            optionsText,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          createdAt: Date.now(),
        };
        setMessages((prev) => [...prev, botMessage]);
        return;
      }

      let selectedDoctor = trimmed;
      const asNumber = parseInt(trimmed, 10);
      if (!Number.isNaN(asNumber) && asNumber >= 1 && asNumber <= doctorOptions.length) {
        selectedDoctor = doctorOptions[asNumber - 1];
      }

      const nextFlow = {
        type: "bookAppointment",
        step: 2,
        data: { ...(flow.data || {}), doctorName: selectedDoctor },
      };
      setFlow(nextFlow);

      const botMessage = {
        id: Date.now() + 1,
        sender: "bot",
        text:
          "Great. For which date and time would you like this appointment? You can say things like 'tomorrow 10 AM', 'next Monday evening', or '6 Feb 2026 2:30 PM'.",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        createdAt: Date.now(),
      };
      setMessages((prev) => [...prev, botMessage]);
      return;
    }

    if (flow.step === 2) {
      const lower = trimmed.toLowerCase();
      const now = new Date();
      let parsed;

      if (lower === "today") {
        parsed = now;
      } else if (lower === "tomorrow") {
        parsed = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      } else if (lower.includes("tomorrow")) {
        const base = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        parsed = new Date(`${base.toDateString()} ${trimmed}`);
      } else if (lower.includes("morning") || lower.includes("evening")) {
        const base = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        const hours = lower.includes("evening") ? 18 : 10;
        parsed = new Date(base.setHours(hours, 0, 0, 0));
      } else {
        parsed = new Date(trimmed);
      }
      if (Number.isNaN(parsed.getTime())) {
        const botMessage = {
          id: Date.now() + 1,
          sender: "bot",
          text:
            "I couldn't understand that date and time. Please try something like 'tomorrow 10 AM', 'next Monday evening', or '6 Feb 2026 2:30 PM'.",
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          createdAt: Date.now(),
        };
        setMessages((prev) => [...prev, botMessage]);
        return;
      }

      const pretty = parsed.toLocaleString([], {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });

      const nextFlow = {
        type: "bookAppointment",
        step: 3,
        data: { ...(flow.data || {}), datetime: pretty },
      };
      setFlow(nextFlow);

      const botMessage = {
        id: Date.now() + 1,
        sender: "bot",
        text: "Got it. What is the main reason for this appointment?",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        createdAt: Date.now(),
      };
      setMessages((prev) => [...prev, botMessage]);
      return;
    }

    if (flow.step === 3) {
      const payload = {
        ...(flow.data || {}),
        reason: trimmed,
      };

      setIsSending(true);
      const result = await createAppointment(user, payload);
      setIsSending(false);
      setFlow(null);

      let textReply;
      if (result.ok) {
        const { doctorName, datetime } = payload;
        textReply =
          `Your appointment with ${doctorName || "the selected doctor"} on ${datetime} ` +
          "has been scheduled. You can review or manage it anytime in Dashboard → Appointments.";
      } else {
        textReply =
          "I tried to create the appointment but something went wrong. Please try again later or use the Appointments page directly.";
      }

      const botMessage = {
        id: Date.now() + 2,
        sender: "bot",
        text: textReply,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        createdAt: Date.now(),
      };
      setMessages((prev) => [...prev, botMessage]);
      playNotificationSound();
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    if (flow) {
      await handleFlowInput(input);
    } else {
      await sendMessage(input);
    }
  };

  const handleQuickAction = (item) => {
    if (item.action === "bookAppointment") {
      startBookFlow();
    } else if (item.action === "rescheduleAppointment") {
      startRescheduleFlow();
    } else if (item.action === "cancelAppointment") {
      startCancelFlow();
    } else if (item.action === "scanPrescription") {
      const introMessage = {
        id: Date.now(),
        sender: "bot",
        text:
          "I'll try to read the text from your prescription. Please hold it steady in front of the camera. This may take a few seconds...",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        createdAt: Date.now(),
      };
      setMessages((prev) => [...prev, introMessage]);

      if (!cameraEnabled) {
        const warnMessage = {
          id: Date.now() + 1,
          sender: "bot",
          text:
            "Your camera is currently off. Please turn it on with the camera button in the header, then tap 'Scan Prescription' again.",
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          createdAt: Date.now(),
        };
        setMessages((prev) => [...prev, warnMessage]);
        playNotificationSound();
        return;
      }

      setIsOcrRunning(true);
      runOcrOnCurrentFrame().then((result) => {
        setIsOcrRunning(false);
        handleOcrResult(result);
      });
    } else if (item.action === "uploadPrescription") {
      const introMessage = {
        id: Date.now(),
        sender: "bot",
        text:
          "Please choose a clear photo of your prescription from your device. I will try to read the medicines for you.",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        createdAt: Date.now(),
      };
      setMessages((prev) => [...prev, introMessage]);
      openPrescriptionFilePicker();
    } else if (item.action === "listAppointments") {
      showUpcomingAppointments();
    } else if (item.message) {
      sendMessage(item.message);
    }
  };

  const handlePrescriptionFileSelected = (file) => {
    if (!file) return;

    const infoMessage = {
      id: Date.now(),
      sender: "bot",
      text: `Got your file: ${file.name}. I'll try to read the prescription text now...`,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      createdAt: Date.now(),
    };
    setMessages((prev) => [...prev, infoMessage]);

    setIsOcrRunning(true);
    runOcrOnUploadedFile(file).then((result) => {
      setIsOcrRunning(false);
      handleOcrResult(result);
    });
  };


  return (
    <>
      {/* Floating button */}
      <button
        type="button"
        className="chatbot-toggle"
        onClick={handleToggle}
        aria-label={isOpen ? "Close chat" : "Open chat"}
        aria-expanded={isOpen}
        aria-controls="medicose-chat-window"
      >
        💬
      </button>

      {/* Chat window */}
      {isOpen && (
        <ChatWindow
          messages={messages}
          isSending={isSending}
          input={input}
          onInputChange={handleInputChange}
          onSend={handleSend}
          onClose={handleToggle}
          onQuickAction={handleQuickAction}
          messagesEndRef={messagesEndRef}
          isCollapsed={isCollapsed}
          onToggleCollapsed={() => setIsCollapsed((prev) => !prev)}
          soundEnabled={soundEnabled}
          onToggleSound={toggleSound}
          themeMode={themeMode}
          isListening={isListening}
          onToggleListening={toggleListening}
          cameraEnabled={cameraEnabled}
          onToggleCamera={toggleCamera}
          videoRef={videoRef}
          fileInputRef={fileInputRef}
          onPrescriptionFileSelected={handlePrescriptionFileSelected}
          cameraStatus={cameraStatus}
          placeholderText={inputPlaceholders[placeholderIndex]}
          MAX_INPUT_CHARS={MAX_INPUT_CHARS}
          language={language}
          onToggleLanguage={toggleLanguage}
          interimTranscript={interimTranscript}
        />
      )}
    </>
  );
};

export default Chatbot;

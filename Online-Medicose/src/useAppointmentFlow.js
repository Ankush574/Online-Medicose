import { useState } from "react";
import {
  fetchAppointments,
  updateAppointment,
  createAppointment,
} from "./chatService";

const doctorOptions = [
  "Dr. Sarah Johnson (General Medicine)",
  "Dr. Ahmed Khan (Cardiology)",
  "Any available doctor",
];

const formatTime = () =>
  new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

export const useAppointmentFlow = ({
  user,
  setMessages,
  setInput,
  setIsSending,
  playNotificationSound,
}) => {
  const [flow, setFlow] = useState(null);

  const startBookFlow = () => {
    setFlow({ type: "bookAppointment", step: 1, data: {} });
    const botMessage = {
      id: Date.now(),
      sender: "bot",
      text:
        "Great, let's book an appointment. Here are some doctors you can choose from. Reply with a number or the doctor's name:\n" +
        doctorOptions.map((name, index) => `${index + 1}. ${name}`).join("\n"),
      timestamp: formatTime(),
      createdAt: Date.now(),
    };
    setMessages((prev) => [...prev, botMessage]);
    playNotificationSound();
  };

  const startRescheduleFlow = () => {
    setFlow({ type: "rescheduleAppointment", step: 1, data: {} });
    const botMessage = {
      id: Date.now(),
      sender: "bot",
      text:
        "I'll reschedule your next upcoming appointment. What new date and time would you like? (For example: 2026-02-06 02:30 PM)",
      timestamp: formatTime(),
      createdAt: Date.now(),
    };
    setMessages((prev) => [...prev, botMessage]);
    playNotificationSound();
  };

  const startCancelFlow = () => {
    setFlow({ type: "cancelAppointment", step: 1, data: {} });
    const botMessage = {
      id: Date.now(),
      sender: "bot",
      text:
        "I can cancel your next upcoming appointment. Please type YES to confirm, or NO to keep it.",
      timestamp: formatTime(),
      createdAt: Date.now(),
    };
    setMessages((prev) => [...prev, botMessage]);
    playNotificationSound();
  };

  const showUpcomingAppointments = async () => {
    const loadingMsg = {
      id: Date.now(),
      sender: "bot",
      text: "Let me check your upcoming appointments...",
      timestamp: formatTime(),
      createdAt: Date.now(),
    };
    setMessages((prev) => [...prev, loadingMsg]);

    const result = await fetchAppointments(user);

    let textReply;
    if (!result.ok) {
      textReply =
        result.error ||
        "I couldn't load your appointments right now. Please try again later or open Dashboard → Appointments.";
    } else if (!result.data.length) {
      textReply =
        "You don't have any upcoming appointments yet. You can create one here in chat or from Dashboard → Appointments.";
    } else {
      const upcoming = result.data
        .slice()
        .sort((a, b) => {
          const da = new Date(a.datetime || a.createdAt || 0).getTime();
          const db = new Date(b.datetime || b.createdAt || 0).getTime();
          return da - db;
        })
        .slice(0, 3);

      const lines = upcoming.map((appt, index) => {
        let whenLabel;
        if (appt.datetime) {
          const parsed = new Date(appt.datetime);
          if (!Number.isNaN(parsed.getTime())) {
            whenLabel = parsed.toLocaleString([], {
              year: "numeric",
              month: "short",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            });
          } else {
            whenLabel = appt.datetime;
          }
        } else {
          whenLabel = new Date(appt.createdAt).toLocaleString();
        }
        const who = appt.doctorName || "your doctor";
        const status = appt.status || "Scheduled";
        return `${index + 1}. ${whenLabel} with ${who} – ${status}`;
      });

      textReply =
        "Here are your next appointments (up to 3):\n" +
        lines.join("\n") +
        "\n\nYou can manage them in Dashboard → Appointments.";
    }

    const replyMsg = {
      id: Date.now() + 1,
      sender: "bot",
      text: textReply,
      timestamp: formatTime(),
      createdAt: Date.now(),
    };
    setMessages((prev) => [...prev, replyMsg]);
    playNotificationSound();
  };

  const pickNextUpcomingAppointment = async () => {
    const result = await fetchAppointments(user);
    if (!result.ok) {
      return { ok: false, error: result.error || "Failed to load appointments" };
    }
    if (!result.data.length) {
      return { ok: false, error: "You don't have any upcoming appointments." };
    }
    const upcoming = result.data
      .slice()
      .sort((a, b) => {
        const da = new Date(a.datetime || a.createdAt || 0).getTime();
        const db = new Date(b.datetime || b.createdAt || 0).getTime();
        return da - db;
      })
      .filter((appt) => (appt.status || "Scheduled") !== "Cancelled");

    if (!upcoming.length) {
      return { ok: false, error: "You don't have any upcoming appointments." };
    }

    return { ok: true, data: upcoming[0] };
  };

  const handleFlowInput = async (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const time = formatTime();
    const userMessage = {
      id: Date.now(),
      sender: "user",
      text: trimmed,
      timestamp: time,
      createdAt: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    if (!flow) return;

    if (flow.type === "bookAppointment") {
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
            timestamp: formatTime(),
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
          timestamp: formatTime(),
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
            timestamp: formatTime(),
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
          timestamp: formatTime(),
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
          timestamp: formatTime(),
          createdAt: Date.now(),
        };
        setMessages((prev) => [...prev, botMessage]);
        playNotificationSound();
        return;
      }
    }

    if (flow.type === "rescheduleAppointment") {
      setIsSending(true);
      const pickResult = await pickNextUpcomingAppointment();

      let textReply;
      if (!pickResult.ok) {
        textReply =
          pickResult.error ||
          "I couldn't find an appointment to reschedule. Please try again later or use Dashboard → Appointments.";
      } else {
        const appt = pickResult.data;
        const appointmentId = appt._id || appt.id;
        const oldWhen = appt.datetime || new Date(appt.createdAt).toLocaleString();
        const doctorName = appt.doctorName || "your doctor";

        const updateResult = await updateAppointment(appointmentId, { datetime: trimmed }, user);
        if (updateResult.ok) {
          textReply =
            `Done. Your appointment with ${doctorName} has been moved from ${oldWhen} to ${trimmed}. ` +
            "You can review the change in Dashboard → Appointments.";
        } else {
          textReply =
            updateResult.error ||
            "I couldn't reschedule that appointment. Please try again later or use Dashboard → Appointments.";
        }
      }

      setIsSending(false);
      setFlow(null);

      const botMessage = {
        id: Date.now() + 1,
        sender: "bot",
        text: textReply,
        timestamp: formatTime(),
        createdAt: Date.now(),
      };
      setMessages((prev) => [...prev, botMessage]);
      playNotificationSound();
      return;
    }

    if (flow.type === "cancelAppointment") {
      const lower = trimmed.toLowerCase();
      if (!(lower === "yes" || lower === "y")) {
        setFlow(null);
        const botMessage = {
          id: Date.now() + 1,
          sender: "bot",
          text: "Okay, I won't cancel your appointment.",
          timestamp: formatTime(),
          createdAt: Date.now(),
        };
        setMessages((prev) => [...prev, botMessage]);
        playNotificationSound();
        return;
      }

      setIsSending(true);
      const pickResult = await pickNextUpcomingAppointment();

      let textReply;
      if (!pickResult.ok) {
        textReply =
          pickResult.error ||
          "I couldn't find an appointment to cancel. Please try again later or use Dashboard → Appointments.";
      } else {
        const appt = pickResult.data;
        const appointmentId = appt._id || appt.id;
        const when = appt.datetime || new Date(appt.createdAt).toLocaleString();
        const doctorName = appt.doctorName || "your doctor";

        const updateResult = await updateAppointment(appointmentId, { status: "Cancelled" }, user);
        if (updateResult.ok) {
          textReply =
            `Your appointment with ${doctorName} on ${when} has been cancelled. ` +
            "You can always book a new one from Dashboard → Appointments or here in chat.";
        } else {
          textReply =
            updateResult.error ||
            "I couldn't cancel that appointment. Please try again later or use Dashboard → Appointments.";
        }
      }

      setIsSending(false);
      setFlow(null);

      const botMessage = {
        id: Date.now() + 1,
        sender: "bot",
        text: textReply,
        timestamp: formatTime(),
        createdAt: Date.now(),
      };
      setMessages((prev) => [...prev, botMessage]);
      playNotificationSound();
    }
  };

  return {
    flow,
    startBookFlow,
    startRescheduleFlow,
    startCancelFlow,
    showUpcomingAppointments,
    handleFlowInput,
  };
};

// Chat-related API helpers for MediCose chatbot

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const MEDIBOT_API_URL =
  import.meta.env.VITE_CHATBOT_API_URL || `${API_BASE_URL}/chat`;

// Call the backend chatbot endpoint and return a reply string
export const fetchBotReply = async (message, token, language) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 12000);

    const headers = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(MEDIBOT_API_URL, {
      method: "POST",
      headers,
      body: JSON.stringify({ message, language }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const contentType = response.headers.get("content-type") || "";
    let data = null;
    let textPayload = "";

    if (contentType.includes("application/json")) {
      data = await response.json();
    } else {
      textPayload = await response.text();
    }

    if (!response.ok) {
      const apiReply =
        (data && (data.reply || data.message || data.text)) ||
        (textPayload && textPayload.trim());

      if (apiReply) {
        return apiReply;
      }

      throw new Error(`Request failed with status ${response.status}`);
    }

    if (data) {
      const textReply =
        data.reply ||
        data.message ||
        data.text ||
        (typeof data === "string" ? data : JSON.stringify(data));

      if (!textReply || (typeof textReply === "string" && !textReply.trim())) {
        return "I asked MediBot, but it responded with an empty message. Please try asking again or use the main dashboard pages in the meantime.";
      }

      return textReply;
    }

    return textPayload && textPayload.trim()
      ? textPayload.trim()
      : "I sent your question to MediBot, but I couldn't read the reply properly.";
  } catch (error) {
    console.error("MediBot API error", error);
    if (error.name === "AbortError") {
      return "I'm having trouble connecting right now (timeout). Please check your connection and try again, or use the main dashboard pages for a moment.";
    }
    return "I couldn't reach MediBot right now. Please check your internet connection or try again later.";
  }
};

// Fetch appointments for the current user
export const fetchAppointments = async (user) => {
  if (!user?.id && !user?.email) {
    return { ok: false, error: "You need to be logged in to see your appointments." };
  }

  try {
    const params = new URLSearchParams();
    if (user.id) params.append("userId", user.id);
    if (user.email) params.append("userEmail", user.email);

    const headers = {};
    if (user.token) {
      headers.Authorization = `Bearer ${user.token}`;
    }

    const response = await fetch(`${API_BASE_URL}/appointments?${params.toString()}`, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || `Request failed with status ${response.status}`);
    }

    const data = await response.json();
    return { ok: true, data: Array.isArray(data) ? data : [] };
  } catch (error) {
    console.error("Fetch appointments via chatbot failed", error);
    return { ok: false, error: error.message || "Failed to load appointments" };
  }
};

// Update an appointment by id
export const updateAppointment = async (appointmentId, updates, user) => {
  if (!appointmentId) {
    return { ok: false, error: "Missing appointment id" };
  }

  try {
    const headers = {
      "Content-Type": "application/json",
    };
    if (user?.token) {
      headers.Authorization = `Bearer ${user.token}`;
    }

    const response = await fetch(`${API_BASE_URL}/appointments/${appointmentId}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const raw = await response.text();
      console.error("Update appointment failed", response.status, raw);

      if (response.status === 404) {
        return {
          ok: false,
          error:
            "I couldn't find that appointment to update. Please check it in Dashboard → Appointments.",
        };
      }
      if (response.status === 403) {
        return {
          ok: false,
          error:
            "You don't have permission to modify that appointment. Please use Dashboard → Appointments.",
        };
      }

      return {
        ok: false,
        error:
          "I couldn't update that appointment right now. Please try again later or use Dashboard → Appointments.",
      };
    }

    const data = await response.json();
    return { ok: true, data };
  } catch (error) {
    console.error("Update appointment via chatbot failed", error);
    return {
      ok: false,
      error:
        "I couldn't update that appointment right now. Please try again later or use Dashboard → Appointments.",
    };
  }
};

// Create a new appointment
export const createAppointment = async (user, { doctorName, datetime, reason }) => {
  try {
    const headers = {
      "Content-Type": "application/json",
    };
    if (user?.token) {
      headers.Authorization = `Bearer ${user.token}`;
    }

    const body = {
      userId: user?.id,
      userEmail: user?.email,
      doctorName,
      datetime,
      reason,
    };

    const response = await fetch(`${API_BASE_URL}/appointments`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || `Request failed with status ${response.status}`);
    }

    const data = await response.json();
    return { ok: true, data };
  } catch (error) {
    console.error("Create appointment via chatbot failed", error);
    return { ok: false, error: error.message || "Failed to create appointment" };
  }
};

// Create draft prescriptions from OCR output
export const createDraftPrescriptionsFromOcr = async (parsedMedicines, user) => {
  if (!user?.id && !user?.email) {
    return { ok: false, error: "You need to be logged in to save prescriptions." };
  }

  try {
    const headers = {
      "Content-Type": "application/json",
    };
    if (user?.token) {
      headers.Authorization = `Bearer ${user.token}`;
    }

    const results = [];
    for (const med of parsedMedicines) {
      const body = {
        userId: user.id,
        userEmail: user.email,
        medicineName: med.medicineName,
        strength: med.strength,
        dosage: "",
        duration: "",
        prescribedDate: "",
        expiryDate: "",
        doctor: "",
        notes: `Imported from OCR line: ${med.originalLine}`,
        status: "Draft",
      };

      const response = await fetch(`${API_BASE_URL}/prescriptions`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const raw = await response.text();
        console.error("Create prescription from OCR failed", response.status, raw);
        results.push({ ok: false });
      } else {
        results.push({ ok: true });
      }
    }

    const successCount = results.filter((r) => r.ok).length;
    if (!successCount) {
      return { ok: false, error: "I couldn't create any draft prescriptions from this scan." };
    }

    return {
      ok: true,
      count: successCount,
    };
  } catch (err) {
    console.error("Create prescriptions from OCR failed", err);
    return {
      ok: false,
      error:
        "Something went wrong while saving these medicines. Please try again later or add them manually in Dashboard → Prescriptions.",
    };
  }
};

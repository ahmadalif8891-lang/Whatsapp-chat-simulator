import React, { useState, useRef, useEffect } from "react";
import {
  ChevronLeft,
  Video,
  Phone,
  Plus,
  Camera,
  Mic,
  Send,
  Sticker,
  User,
  CheckCheck,
  Trash2,
} from "lucide-react";

const colors = {
  screenBg: "#000000",
  chatBg: "#0a0a0d",
  headerBg: "#000000",
  inputBarBg: "#000000",
  inputPillBg: "#26252a",
  sentBubble: "#1f8a57",
  receivedBubble: "#26252a",
  accentIcon: "#ffffff",
  textPrimary: "#f2f2f2",
  textSecondary: "#8e8e93",
  timeOnBubble: "rgba(255,255,255,0.65)",
  avatarBg: "#48484a",
  cardBg: "#111114",
  fieldBg: "#1c1c1e",
  accentBtn: "#1f8a57",
  divider: "#1c1c1e",
};

const fontStack =
  "-apple-system, 'SF Pro Text', 'Helvetica Neue', Helvetica, Arial, sans-serif";

const CONTACTS_KEY = "wa-sim-contacts";
const chatKey = (id) => `wa-sim-chat-${id}`;

// Pengganti storage (fitur khusus Claude Artifacts) supaya app ini
// bisa jalan normal di browser biasa pakai localStorage.
const storage = {
  get: async (key) => {
    const v = localStorage.getItem(key);
    return v !== null ? { value: v } : null;
  },
  set: async (key, value) => {
    localStorage.setItem(key, value);
    return { value };
  },
  delete: async (key) => {
    localStorage.removeItem(key);
    return {};
  },
};

function getTimeContext() {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 15) {
    return {
      periode: "jam sekolah (pagi-siang)",
      konteks:
        "Kamu lagi di sekolah: kegiatan kayak lagi pelajaran, jam istirahat, ngerjain tugas di kelas, atau abis upacara. Kadang balesnya agak lama/singkat karena masih di kelas atau HP disembunyiin dari guru.",
    };
  }
  if (hour >= 15 && hour < 18) {
    return {
      periode: "sore (pulang sekolah)",
      konteks:
        "Kamu baru pulang sekolah atau lagi di jalan/ekskul/les. Kegiatan santai kayak istirahat di rumah, main HP, atau nongkrong bentar sama temen.",
    };
  }
  if (hour >= 18 && hour < 22) {
    return {
      periode: "malam",
      konteks:
        "Kamu lagi di rumah: abis makan malam, belajar/ngerjain PR, rebahan sambil main HP, atau nonton sesuatu. Suasana lebih santai dan personal.",
    };
  }
  return {
    periode: "larut malam/dini hari",
    konteks:
      "Kamu harusnya udah mau tidur atau susah tidur, balesnya kadang ngantuk-ngantuk gitu, atau bilang lagi kebangun tengah malem.",
  };
}

function buildSystemPrompt(name, gender) {
  const kata_ganti = gender === "cewek" ? "cewek" : "cowok";
  const { periode, konteks } = getTimeContext();
  const jamSekarang = new Date().toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `Kamu roleplay sebagai "${name}", seorang ${kata_ganti} remaja Indonesia yang chat-an sama user di WhatsApp.

WAKTU SAAT INI: sekarang jam ${jamSekarang} (${periode}).
KONTEKS KEGIATAN KAMU SEKARANG: ${konteks}
Kalau user nanya "lagi ngapain" atau "gimana kabar/kegiatan", jawab sesuai konteks waktu ini secara natural (jangan sebut jam persisnya kayak robot, cukup cerita kegiatannya kayak orang beneran). Jangan kontradiksi sama waktu ini di sepanjang chat.

BACKSTORY:
- Kamu sama user dulu satu sekolah/satu kelas, sekarang udah beda sekolah jadi jarang ketemu.
- Dulu kamu sempat naksir/suka sama user waktu masih sekolah bareng, tapi itu udah lama, cuma jadi nostalgia yang kadang muncul dikit-dikit lewat kode-kode receh, bukan pernyataan cinta yang serius atau menggebu-gebu.
- Sekarang hubungan kalian lebih ke temenan deket yang suka reply cepet dan asik diajak ngobrol apa aja.

GAYA CHAT (WAJIB):
- Bahasa Indonesia gaul ala Gen Z, santai, banyak singkatan: "gpp", "wkwk", "btw", "anjir", "literally", "spill", "gaje", "worth it", dll.
- Sering pakai huruf yang diulang di akhir kata buat penekanan, misal: "iyaaa", "capeee", "santuyyy", "benerann", "yaudahh".
- SUPER PENDEK kayak orang chat beneran di HP: maksimal 1-2 kalimat singkat per baris. JANGAN pernah bikin paragraf panjang atau jelasin sesuatu secara detail/rapi.
- FORMAT WAJIB: KEBANYAKAN balasan cukup 1 bubble aja (satu baris). Cuma SESEKALI (jangan sering-sering, jarang aja) kalau emang ada 2 ide/reaksi yang beda boleh dipecah jadi 2 bubble. JANGAN jadiin kebiasaan/pola tetap—variasiin, jangan tiap kali kirim pasti multi-bubble. Taruh tiap bubble di baris baru kalau memang dipecah.
- Emoji dipakai SANGAT JARANG, cuma sesekali kalau bener-bener pas momennya (misal lagi kaget/ketawa banget). Sebagian besar balasan nggak usah pake emoji sama sekali.
- Kadang menggoda dikit / baper dikit ala anak sekolah tapi tetap ringan dan lucu, JANGAN romantis berlebihan, JANGAN vulgar, JANGAN membahas hal seksual.
- Jangan terdengar seperti AI atau asisten. Jangan pernah bilang kamu adalah AI, model bahasa, atau chatbot.
- Sesekali (nggak harus tiap balasan) lempar pertanyaan balik ke user biar obrolan hidup kayak chat asli, misal nanya kabar, lagi ngapain, atau nyambungin ke topik yang user certain. Jangan nanya balik di SETIAP pesan, biar nggak keliatan kayak interogasi — kadang cukup komentar/reaksi doang tanpa pertanyaan.
- FITUR REPLY (opsional, dipakai sesekali aja kalau relevan): kalau kamu mau reply/quote spesifik ke salah satu pesan SEBELUMNYA dari user (bukan pesan yang paling baru), mulai baris itu dengan format persis: @balas("potongan singkat teks pesan yang mau di-reply") lalu spasi lalu isi balasannya. Contoh: @balas("gmn kabar nya zas") kabar gue baik kok. Potongan teks harus persis nyontek kata-kata asli dari pesan user yang direply (boleh sebagian aja, nggak perlu semua). JANGAN pakai format ini kalau cuma mau reply ke pesan paling terakhir/normal, cukup buat kalau nyambungin ke pesan yang agak lama biar kerasa natural.

FORMAT OUTPUT: balas dengan tiap bubble dipisah baris baru (\\n). Contoh:
anjir gilaa
kok bisa gitu sih wkwk
terus lu gimana?`;
}

function nowTime() {
  const d = new Date();
  return d
    .toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
    .replace(":", ".");
}

export default function App() {
  const [view, setView] = useState("loading"); // loading | list | setup | chat
  const [contacts, setContacts] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [newName, setNewName] = useState("");
  const [newGender, setNewGender] = useState("cewek");
  const scrollRef = useRef(null);

  const activeContact = contacts.find((c) => c.id === activeId) || null;

  // load daftar kontak sekali di awal
  useEffect(() => {
    (async () => {
      try {
        const result = await storage.get(CONTACTS_KEY, false);
        if (result && result.value) {
          setContacts(JSON.parse(result.value));
        }
      } catch (e) {
        // belum ada kontak tersimpan
      } finally {
        setView("list");
      }
    })();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  async function saveContacts(updated) {
    setContacts(updated);
    try {
      await storage.set(CONTACTS_KEY, JSON.stringify(updated), false);
    } catch (e) {}
  }

  async function openContact(contact) {
    setActiveId(contact.id);
    setReplyingTo(null);
    try {
      const result = await storage.get(chatKey(contact.id), false);
      setMessages(result && result.value ? JSON.parse(result.value) : []);
    } catch (e) {
      setMessages([]);
    }
    setView("chat");
  }

  async function createContact() {
    const name = newName.trim();
    if (!name) return;
    const contact = {
      id: Date.now().toString(),
      name,
      gender: newGender,
      lastMessage: "",
      lastTime: "",
    };
    const updated = [contact, ...contacts];
    await saveContacts(updated);
    setNewName("");
    setNewGender("cewek");
    setMessages([]);
    setActiveId(contact.id);
    setView("chat");
  }

  async function deleteContact(id) {
    if (!window.confirm("Hapus kontak ini beserta semua chatnya?")) return;
    const updated = contacts.filter((c) => c.id !== id);
    await saveContacts(updated);
    try {
      await storage.delete(chatKey(id), false);
    } catch (e) {}
    if (activeId === id) {
      setView("list");
      setActiveId(null);
    }
  }

  async function persistMessages(id, msgs) {
    try {
      await storage.set(chatKey(id), JSON.stringify(msgs), false);
    } catch (e) {}
    const last = msgs[msgs.length - 1];
    if (last) {
      const updated = contacts.map((c) =>
        c.id === id ? { ...c, lastMessage: last.text, lastTime: last.time } : c
      );
      await saveContacts(updated);
    }
  }

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading || !activeContact) return;
    const userMsg = {
      role: "user",
      text,
      time: nowTime(),
      replyTo: replyingTo ? { role: replyingTo.role, text: replyingTo.text } : null,
    };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    persistMessages(activeContact.id, newMessages);
    setInput("");
    setReplyingTo(null);
    setLoading(true);

    try {
      const apiMessages = newMessages.map((m) => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.text,
      }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system: buildSystemPrompt(activeContact.name, activeContact.gender),
          messages: apiMessages,
        }),
      });
      const data = await response.json();
      const rawReply =
        data?.content?.find((c) => c.type === "text")?.text?.trim() ||
        "eh sinyal gua jelek anjir, coba lagi bentar ya";

      const bubbles = rawReply
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 3);

      const replyRegex = /^@balas\("(.+?)"\)\s*(.*)$/i;
      let runningMessages = newMessages;

      for (let i = 0; i < bubbles.length; i++) {
        if (i > 0) {
          await new Promise((r) => setTimeout(r, 500 + Math.random() * 500));
        }
        let bubbleText = bubbles[i];
        let quoted = null;
        const match = bubbleText.match(replyRegex);
        if (match) {
          const snippet = match[1].toLowerCase();
          const target = runningMessages
            .slice()
            .reverse()
            .find((m) => m.text.toLowerCase().includes(snippet));
          if (target) {
            quoted = { role: target.role, text: target.text };
            bubbleText = match[2] || "";
          } else {
            bubbleText = match[2] || bubbleText;
          }
        }
        if (!bubbleText.trim()) continue;
        const aiMsg = { role: "assistant", text: bubbleText, time: nowTime(), replyTo: quoted };
        runningMessages = [...runningMessages, aiMsg];
        setMessages(runningMessages);
        persistMessages(activeContact.id, runningMessages);
      }
    } catch (e) {
      const errMsg = {
        role: "assistant",
        text: "waduh error, coba kirim lagi ya wkwk",
        time: nowTime(),
        replyTo: null,
      };
      const finalMsgs = [...newMessages, errMsg];
      setMessages(finalMsgs);
      persistMessages(activeContact.id, finalMsgs);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") sendMessage();
  }

  // ---------- LOADING ----------
  if (view === "loading") {
    return (
      <div
        style={{
          width: "100%",
          height: "100vh",
          backgroundColor: colors.screenBg,
        }}
      />
    );
  }

  // ---------- DAFTAR KONTAK ----------
  if (view === "list") {
    return (
      <div
        style={{
          width: "100%",
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          backgroundColor: colors.screenBg,
          fontFamily: fontStack,
          position: "relative",
        }}
      >
        <div
          style={{
            padding: "18px 16px 12px",
            backgroundColor: colors.headerBg,
            flexShrink: 0,
          }}
        >
          <div style={{ color: colors.textPrimary, fontSize: "26px", fontWeight: 700 }}>
            Chats
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto" }}>
          {contacts.length === 0 && (
            <div style={{ textAlign: "center", color: colors.textSecondary, fontSize: "13px", marginTop: "40px" }}>
              Belum ada kontak. Tap + buat mulai chat baru.
            </div>
          )}
          {contacts.map((c) => (
            <div
              key={c.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "10px 16px",
                borderBottom: `1px solid ${colors.divider}`,
                cursor: "pointer",
              }}
              onClick={() => openContact(c)}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  backgroundColor: colors.avatarBg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <User size={24} color="#d1d1d6" fill="#d1d1d6" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: colors.textPrimary, fontSize: "16px", fontWeight: 600 }}>
                  {c.name}
                </div>
                <div
                  style={{
                    color: colors.textSecondary,
                    fontSize: "13px",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {c.lastMessage || "Mulai ngobrol..."}
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
                <span style={{ color: colors.textSecondary, fontSize: "12px" }}>{c.lastTime}</span>
                <Trash2
                  size={16}
                  color={colors.textSecondary}
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteContact(c.id);
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => setView("setup")}
          style={{
            position: "absolute",
            bottom: "28px",
            right: "20px",
            width: "54px",
            height: "54px",
            borderRadius: "50%",
            backgroundColor: colors.accentBtn,
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: "0 4px 14px rgba(0,0,0,0.4)",
          }}
        >
          <Plus size={26} color="#ffffff" />
        </button>
      </div>
    );
  }

  // ---------- SETUP KONTAK BARU ----------
  if (view === "setup") {
    return (
      <div
        style={{
          width: "100%",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.screenBg,
          fontFamily: fontStack,
          padding: "0 24px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "384px",
            backgroundColor: colors.cardBg,
            borderRadius: "20px",
            padding: "24px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
          }}
        >
          <h1 style={{ color: colors.textPrimary, fontSize: "18px", fontWeight: 600, marginBottom: "4px" }}>
            Kontak Baru
          </h1>
          <p style={{ color: colors.textSecondary, fontSize: "14px", marginBottom: "20px" }}>
            Atur nama kontak buat chat baru.
          </p>

          <label style={{ color: colors.textSecondary, fontSize: "12px", marginBottom: "4px", display: "block" }}>
            Nama kontak
          </label>
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            style={{
              width: "100%",
              backgroundColor: colors.fieldBg,
              color: colors.textPrimary,
              borderRadius: "10px",
              padding: "10px 12px",
              marginBottom: "16px",
              outline: "none",
              border: "none",
              fontFamily: fontStack,
              fontSize: "14px",
              boxSizing: "border-box",
            }}
            placeholder="Nama kontak"
          />

          <label style={{ color: colors.textSecondary, fontSize: "12px", marginBottom: "8px", display: "block" }}>
            Gaya bahasa
          </label>
          <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
            {["cewek", "cowok"].map((g) => (
              <button
                key={g}
                onClick={() => setNewGender(g)}
                style={{
                  flex: 1,
                  padding: "8px 0",
                  borderRadius: "10px",
                  fontSize: "14px",
                  textTransform: "capitalize",
                  border: "none",
                  cursor: "pointer",
                  backgroundColor: newGender === g ? colors.accentBtn : colors.fieldBg,
                  color: newGender === g ? "#ffffff" : colors.textSecondary,
                  fontFamily: fontStack,
                }}
              >
                {g}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={() => setView("list")}
              style={{
                flex: 1,
                backgroundColor: colors.fieldBg,
                color: colors.textSecondary,
                fontWeight: 500,
                padding: "10px 0",
                borderRadius: "10px",
                border: "none",
                cursor: "pointer",
                fontFamily: fontStack,
                fontSize: "15px",
              }}
            >
              Batal
            </button>
            <button
              onClick={createContact}
              disabled={!newName.trim()}
              style={{
                flex: 1,
                backgroundColor: colors.accentBtn,
                opacity: newName.trim() ? 1 : 0.4,
                color: "#ffffff",
                fontWeight: 500,
                padding: "10px 0",
                borderRadius: "10px",
                border: "none",
                cursor: newName.trim() ? "pointer" : "not-allowed",
                fontFamily: fontStack,
                fontSize: "15px",
              }}
            >
              Mulai Chat
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---------- CHAT ----------
  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: colors.screenBg,
        fontFamily: fontStack,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "14px 12px 10px",
          backgroundColor: colors.headerBg,
          flexShrink: 0,
        }}
      >
        <div
          style={{ display: "flex", alignItems: "center", gap: "2px", cursor: "pointer" }}
          onClick={() => setView("list")}
        >
          <ChevronLeft color={colors.accentBtn} size={30} strokeWidth={2.5} />
        </div>
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            backgroundColor: colors.avatarBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <User size={20} color="#d1d1d6" fill="#d1d1d6" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              color: colors.textPrimary,
              fontSize: "17px",
              fontWeight: 600,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {activeContact ? activeContact.name : ""}
          </div>
        </div>
        <Video size={24} color={colors.accentIcon} strokeWidth={1.6} />
        <Phone size={20} color={colors.accentIcon} strokeWidth={1.8} />
      </div>

      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "14px 12px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          backgroundColor: colors.chatBg,
          backgroundImage:
            "radial-gradient(circle at 15px 15px, rgba(255,255,255,0.025) 1.5px, transparent 0)",
          backgroundSize: "34px 34px",
        }}
      >
        {messages.length === 0 && (
          <div style={{ textAlign: "center", color: colors.textSecondary, fontSize: "13px", marginTop: "24px" }}>
            Mulai ngobrol sama {activeContact ? activeContact.name : ""} ✨
          </div>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: m.role === "user" ? "flex-end" : "flex-start",
            }}
          >
            <div
              onClick={() => setReplyingTo(m)}
              style={{
                maxWidth: "78%",
                padding: "8px 12px",
                borderRadius: "18px",
                fontSize: "16px",
                lineHeight: 1.3,
                backgroundColor: m.role === "user" ? colors.sentBubble : colors.receivedBubble,
                color: colors.textPrimary,
                cursor: "pointer",
              }}
            >
              {m.replyTo && (
                <div
                  style={{
                    borderLeft: "3px solid rgba(255,255,255,0.5)",
                    backgroundColor: "rgba(0,0,0,0.18)",
                    borderRadius: "6px",
                    padding: "4px 8px",
                    marginBottom: "5px",
                    fontSize: "12.5px",
                    color: "rgba(255,255,255,0.75)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {m.replyTo.text}
                </div>
              )}
              <div style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{m.text}</div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  alignItems: "center",
                  gap: "3px",
                  fontSize: "11px",
                  color: colors.timeOnBubble,
                  marginTop: "3px",
                }}
              >
                {m.time}
                {m.role === "user" && <CheckCheck size={14} color={colors.timeOnBubble} />}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <div
              style={{
                backgroundColor: colors.receivedBubble,
                color: colors.textSecondary,
                fontSize: "13px",
                padding: "8px 14px",
                borderRadius: "18px",
              }}
            >
              mengetik...
            </div>
          </div>
        )}
      </div>

      {replyingTo && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: colors.fieldBg,
            padding: "8px 14px",
            marginTop: "1px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", minWidth: 0, flex: 1 }}>
            <span style={{ color: colors.accentBtn, fontSize: "12px", fontWeight: 600 }}>
              Membalas {replyingTo.role === "user" ? "diri sendiri" : activeContact?.name}
            </span>
            <span
              style={{
                color: colors.textSecondary,
                fontSize: "13px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {replyingTo.text}
            </span>
          </div>
          <button
            onClick={() => setReplyingTo(null)}
            style={{
              background: "transparent",
              border: "none",
              color: colors.textSecondary,
              fontSize: "20px",
              cursor: "pointer",
              padding: "0 4px",
            }}
          >
            ×
          </button>
        </div>
      )}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "10px 10px 14px",
          backgroundColor: colors.inputBarBg,
          flexShrink: 0,
        }}
      >
        <Plus size={26} color={colors.accentIcon} strokeWidth={1.8} style={{ flexShrink: 0 }} />
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            backgroundColor: colors.inputPillBg,
            borderRadius: "9999px",
            padding: "8px 10px 8px 14px",
            gap: "8px",
          }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message"
            style={{
              flex: 1,
              backgroundColor: "transparent",
              outline: "none",
              border: "none",
              color: colors.textPrimary,
              fontSize: "16px",
              fontFamily: fontStack,
            }}
          />
          <Sticker size={20} color={colors.textSecondary} style={{ flexShrink: 0 }} />
        </div>
        <Camera size={24} color={colors.accentIcon} strokeWidth={1.6} style={{ flexShrink: 0 }} />
        <button
          onClick={input.trim() ? sendMessage : undefined}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            width: "30px",
            minWidth: "30px",
            height: "30px",
            border: "none",
            background: "transparent",
            cursor: "pointer",
            padding: 0,
          }}
        >
          {input.trim() ? (
            <div
              style={{
                width: "30px",
                height: "30px",
                borderRadius: "50%",
                backgroundColor: colors.accentBtn,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Send size={15} color="#ffffff" />
            </div>
          ) : (
            <Mic size={24} color={colors.accentIcon} strokeWidth={1.7} />
          )}
        </button>
      </div>
    </div>
  );
}

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { IoClose, IoSend } from "react-icons/io5";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { useBranding } from "../../../hooks/BrandingContext";
import getEnv from "../../../lib/env";
import ChatMessage from "./ChatMessage";
import ADEPanel from "./ADEPanel";
import FieldErrorModal from "./FieldErrorModal";
import PreFillModal from "./PreFillModal";
import { checkFieldForErrors } from "../../../lib/checkFieldForErrors";
import { discoverFormFields } from "../../../lib/discoverFormFields";
import { UseAIChat } from "@/context/AiChatContext";

// Translated widget-generated strings (error messages, confirmations, etc.)
// All keys must be present for every language; English is the fallback.
const WIDGET_STRINGS = {
  en: {
    error: "Sorry, something went wrong",
    errorCouldnt: "Sorry, I wasn't able to do that",
    errorVerify: "Sorry, that verification code didn't work",
    errorSend: "Sorry, I couldn't send that",
    tryAgain: "Please try again.",
    keepOpenAck: "Great! I'll stay open and be here whenever you need me.",
    introClosing: "I'm here to help as needed.",
    revertFailed: "Sorry, the revert failed",
    formNotLoaded: "Sorry, I couldn't load the form details",
    fetchFailed: "Sorry, I couldn't fetch that page",
    brandingApplied: (url) =>
      `I've applied the branding from **${url}**. The colors, fonts, and logos have been pre-filled — feel free to ask me to adjust anything!`,
  },
  es: {
    error: "Lo siento, algo salió mal",
    errorCouldnt: "Lo siento, no pude hacer eso",
    errorVerify: "Lo siento, ese código de verificación no funcionó",
    errorSend: "Lo siento, no pude enviar eso",
    tryAgain: "Por favor, inténtalo de nuevo.",
    keepOpenAck: "¡Perfecto! Me quedaré abierto y estaré aquí cuando me necesites.",
    introClosing: "Estoy aquí para ayudar cuando lo necesites.",
    revertFailed: "Lo siento, no se pudo revertir la acción",
    formNotLoaded: "Lo siento, no pude cargar los detalles del formulario",
    fetchFailed: "Lo siento, no pude obtener esa página",
    brandingApplied: (url) =>
      `He aplicado el branding de **${url}**. Los colores, fuentes y logos han sido completados. ¡Puedes pedirme que ajuste lo que necesites!`,
  },
  fr: {
    error: "Désolé, quelque chose s'est mal passé",
    errorCouldnt: "Désolé, je n'ai pas pu faire cela",
    errorVerify: "Désolé, ce code de vérification ne fonctionne pas",
    errorSend: "Désolé, je n'ai pas pu envoyer cela",
    tryAgain: "Veuillez réessayer.",
    keepOpenAck: "Parfait ! Je reste ouvert et serai là quand vous aurez besoin de moi.",
    introClosing: "Je suis là pour aider si besoin.",
    revertFailed: "Désolé, l'annulation a échoué",
    formNotLoaded: "Désolé, je n'ai pas pu charger les détails du formulaire",
    fetchFailed: "Désolé, je n'ai pas pu récupérer cette page",
    brandingApplied: (url) =>
      `J'ai appliqué le branding de **${url}**. Les couleurs, polices et logos ont été pré-remplis — demandez-moi d'ajuster ce que vous souhaitez !`,
  },
  pt: {
    error: "Desculpe, algo deu errado",
    errorCouldnt: "Desculpe, não consegui fazer isso",
    errorVerify: "Desculpe, esse código de verificação não funcionou",
    errorSend: "Desculpe, não consegui enviar isso",
    tryAgain: "Por favor, tente novamente.",
    keepOpenAck: "Ótimo! Ficarei aberto e estarei aqui sempre que precisar de mim.",
    introClosing: "Estou aqui para ajudar quando necessário.",
    revertFailed: "Desculpe, a reversão falhou",
    formNotLoaded: "Desculpe, não consegui carregar os detalhes do formulário",
    fetchFailed: "Desculpe, não consegui buscar essa página",
    brandingApplied: (url) =>
      `Apliquei o branding de **${url}**. Cores, fontes e logotipos foram preenchidos — sinta-se à vontade para pedir ajustes!`,
  },
  zh: {
    error: "抱歉，出现了问题",
    errorCouldnt: "抱歉，无法完成该操作",
    errorVerify: "抱歉，该验证码无效",
    errorSend: "抱歉，无法发送",
    tryAgain: "请重试。",
    keepOpenAck: "太好了！我会一直在这里，随时为您提供帮助。",
    introClosing: "我随时准备提供帮助。",
    revertFailed: "抱歉，撤销操作失败",
    formNotLoaded: "抱歉，无法加载表单详情",
    fetchFailed: "抱歉，无法获取该页面",
    brandingApplied: (url) => `已应用 **${url}** 的品牌设置。颜色、字体和徽标已预填充——请随时告诉我需要调整的地方！`,
  },
  ar: {
    error: "عذراً، حدث خطأ ما",
    errorCouldnt: "عذراً، لم أتمكن من إتمام ذلك",
    errorVerify: "عذراً، رمز التحقق هذا لم يكن صحيحاً",
    errorSend: "عذراً، لم أتمكن من الإرسال",
    tryAgain: "يرجى المحاولة مرة أخرى.",
    keepOpenAck: "رائع! سأبقى مفتوحاً وسأكون هنا كلما احتجت إليّ.",
    introClosing: "أنا هنا للمساعدة عند الحاجة.",
    revertFailed: "عذراً، فشل التراجع عن الإجراء",
    formNotLoaded: "عذراً، لم أتمكن من تحميل تفاصيل النموذج",
    fetchFailed: "عذراً، لم أتمكن من جلب تلك الصفحة",
    brandingApplied: (url) =>
      `تم تطبيق العلامة التجارية من **${url}**. تم ملء الألوان والخطوط والشعارات — اطلب مني أي تعديلات!`,
  },
  de: {
    error: "Entschuldigung, etwas ist schiefgelaufen",
    errorCouldnt: "Entschuldigung, ich konnte das nicht abschließen",
    errorVerify: "Entschuldigung, dieser Bestätigungscode hat nicht funktioniert",
    errorSend: "Entschuldigung, ich konnte das nicht senden",
    tryAgain: "Bitte versuchen Sie es erneut.",
    keepOpenAck: "Toll! Ich bleibe geöffnet und bin immer für Sie da.",
    introClosing: "Ich bin bei Bedarf für Sie da.",
    revertFailed: "Entschuldigung, die Rückgängig-Aktion ist fehlgeschlagen",
    formNotLoaded: "Entschuldigung, ich konnte die Formulardetails nicht laden",
    fetchFailed: "Entschuldigung, ich konnte die Seite nicht abrufen",
    brandingApplied: (url) =>
      `Das Branding von **${url}** wurde angewendet. Farben, Schriften und Logos wurden vorausgefüllt — bitten Sie mich gerne um Anpassungen!`,
  },
  it: {
    error: "Spiacente, qualcosa è andato storto",
    errorCouldnt: "Spiacente, non sono riuscito a completare quella operazione",
    errorVerify: "Spiacente, quel codice di verifica non ha funzionato",
    errorSend: "Spiacente, non sono riuscito a inviare",
    tryAgain: "Per favore riprova.",
    keepOpenAck: "Ottimo! Rimarrò aperto e sarò qui quando avrai bisogno di me.",
    introClosing: "Sono qui per aiutare quando necessario.",
    revertFailed: "Spiacente, il ripristino è fallito",
    formNotLoaded: "Spiacente, non sono riuscito a caricare i dettagli del modulo",
    fetchFailed: "Spiacente, non sono riuscito a recuperare quella pagina",
    brandingApplied: (url) =>
      `Ho applicato il branding di **${url}**. Colori, font e loghi sono stati precompilati — chiedimi pure di apportare modifiche!`,
  },
  ko: {
    error: "죄송합니다, 문제가 발생했습니다",
    errorCouldnt: "죄송합니다, 작업을 완료할 수 없었습니다",
    errorVerify: "죄송합니다, 그 인증 코드가 작동하지 않았습니다",
    errorSend: "죄송합니다, 전송할 수 없었습니다",
    tryAgain: "다시 시도해 주세요.",
    keepOpenAck: "좋습니다! 계속 열려 있을게요, 필요하실 때마다 여기 있겠습니다.",
    introClosing: "필요하실 때 도움을 드리겠습니다.",
    revertFailed: "죄송합니다, 되돌리기에 실패했습니다",
    formNotLoaded: "죄송합니다, 양식 세부 정보를 불러올 수 없었습니다",
    fetchFailed: "죄송합니다, 해당 페이지를 가져올 수 없었습니다",
    brandingApplied: (url) =>
      `**${url}**의 브랜딩이 적용되었습니다. 색상, 폰트, 로고가 미리 채워졌습니다 — 조정이 필요하시면 말씀해 주세요!`,
  },
  ja: {
    error: "申し訳ありませんが、問題が発生しました",
    errorCouldnt: "申し訳ありませんが、その操作を完了できませんでした",
    errorVerify: "申し訳ありませんが、その確認コードは正しくありませんでした",
    errorSend: "申し訳ありませんが、送信できませんでした",
    tryAgain: "もう一度お試しください。",
    keepOpenAck: "素晴らしい！開いたままにして、必要なときにいつでもここにいます。",
    introClosing: "必要なときにいつでもお手伝いします。",
    revertFailed: "申し訳ありませんが、元に戻すことができませんでした",
    formNotLoaded: "申し訳ありませんが、フォームの詳細を読み込めませんでした",
    fetchFailed: "申し訳ありませんが、そのページを取得できませんでした",
    brandingApplied: (url) =>
      `**${url}**のブランディングを適用しました。色、フォント、ロゴが事前に入力されました — 調整が必要な場合はお知らせください！`,
  },
  vi: {
    error: "Xin lỗi, đã xảy ra lỗi",
    errorCouldnt: "Xin lỗi, tôi không thể thực hiện điều đó",
    errorVerify: "Xin lỗi, mã xác minh đó không hoạt động",
    errorSend: "Xin lỗi, tôi không thể gửi điều đó",
    tryAgain: "Vui lòng thử lại.",
    keepOpenAck: "Tuyệt vời! Tôi sẽ ở đây bất cứ khi nào bạn cần.",
    introClosing: "Tôi ở đây để giúp đỡ khi cần.",
    revertFailed: "Xin lỗi, việc hoàn tác thất bại",
    formNotLoaded: "Xin lỗi, tôi không thể tải chi tiết biểu mẫu",
    fetchFailed: "Xin lỗi, tôi không thể tải trang đó",
    brandingApplied: (url) =>
      `Đã áp dụng thương hiệu từ **${url}**. Màu sắc, phông chữ và biểu trưng đã được điền sẵn — hãy yêu cầu tôi điều chỉnh bất cứ điều gì!`,
  },
  hi: {
    error: "माफ़ करें, कुछ गलत हो गया",
    errorCouldnt: "माफ़ करें, मैं ऐसा नहीं कर सका",
    errorVerify: "माफ़ करें, वह सत्यापन कोड काम नहीं किया",
    errorSend: "माफ़ करें, मैं वह नहीं भेज सका",
    tryAgain: "कृपया पुनः प्रयास करें।",
    keepOpenAck: "बढ़िया! मैं खुला रहूँगा और जब भी आपको ज़रूरत होगी, यहाँ रहूँगा।",
    introClosing: "मैं आवश्यकता पड़ने पर सहायता करने के लिए यहाँ हूँ।",
    revertFailed: "माफ़ करें, वापस करने में विफल रहा",
    formNotLoaded: "माफ़ करें, मैं फ़ॉर्म विवरण लोड नहीं कर सका",
    fetchFailed: "माफ़ करें, मैं वह पेज प्राप्त नहीं कर सका",
    brandingApplied: (url) =>
      `**${url}** से ब्रांडिंग लागू की गई। रंग, फ़ॉन्ट और लोगो पहले से भरे गए हैं — कुछ भी समायोजित करने के लिए मुझसे पूछें!`,
  },
  ru: {
    error: "Извините, что-то пошло не так",
    errorCouldnt: "Извините, я не смог это выполнить",
    errorVerify: "Извините, этот код подтверждения не подошёл",
    errorSend: "Извините, не удалось отправить",
    tryAgain: "Пожалуйста, попробуйте снова.",
    keepOpenAck: "Отлично! Я останусь открытым и буду здесь, когда вам понадоблюсь.",
    introClosing: "Я здесь, чтобы помочь при необходимости.",
    revertFailed: "Извините, не удалось отменить действие",
    formNotLoaded: "Извините, не удалось загрузить детали формы",
    fetchFailed: "Извините, не удалось загрузить эту страницу",
    brandingApplied: (url) =>
      `Применён брендинг из **${url}**. Цвета, шрифты и логотипы заполнены — попросите меня внести любые изменения!`,
  },
  tl: {
    error: "Paumanhin, may naganap na mali",
    errorCouldnt: "Paumanhin, hindi ko nagawa iyon",
    errorVerify: "Paumanhin, hindi gumana ang code ng pagpapatunay",
    errorSend: "Paumanhin, hindi ko maipadala iyon",
    tryAgain: "Pakisubukan muli.",
    keepOpenAck: "Napakagaling! Mananatili akong bukas at nandito kapag kailangan mo ako.",
    introClosing: "Nandito ako para tumulong kung kinakailangan.",
    revertFailed: "Paumanhin, nabigo ang pag-undo",
    formNotLoaded: "Paumanhin, hindi ko ma-load ang mga detalye ng form",
    fetchFailed: "Paumanhin, hindi ko makuha ang pahinang iyon",
    brandingApplied: (url) =>
      `Inilapat ang branding mula sa **${url}**. Ang mga kulay, font, at logo ay na-pre-fill — humingi sa akin ng anumang ayusin!`,
  },
  pl: {
    error: "Przepraszam, coś poszło nie tak",
    errorCouldnt: "Przepraszam, nie mogłem tego zrobić",
    errorVerify: "Przepraszam, ten kod weryfikacyjny nie zadziałał",
    errorSend: "Przepraszam, nie mogłem tego wysłać",
    tryAgain: "Proszę spróbować ponownie.",
    keepOpenAck: "Świetnie! Pozostanę otwarty i będę tutaj, kiedy mnie potrzebujesz.",
    introClosing: "Jestem tutaj, aby pomóc w razie potrzeby.",
    revertFailed: "Przepraszam, cofnięcie nie powiodło się",
    formNotLoaded: "Przepraszam, nie mogłem załadować szczegółów formularza",
    fetchFailed: "Przepraszam, nie mogłem pobrać tej strony",
    brandingApplied: (url) =>
      `Zastosowano branding z **${url}**. Kolory, czcionki i logo zostały wstępnie wypełnione — poproś mnie o wszelkie zmiany!`,
  },
};

// Languages shown in the rotating applicant assistant banner.
// `banner` is the translation of "Ask me a question in any language" in that language.
const LANGUAGES = [
  // ── Western Hemisphere ───────────────────────────────────────────────────
  { code: "en", flag: "🇺🇸", native: "English", banner: "Ask me a question in any language" },
  { code: "es", flag: "🇲🇽", native: "Español", banner: "Hazme una pregunta en cualquier idioma" },
  { code: "pt", flag: "🇧🇷", native: "Português", banner: "Faça-me uma pergunta em qualquer idioma" },
  { code: "fr", flag: "🇨🇦", native: "Français", banner: "Posez-moi une question dans n'importe quelle langue" },
  { code: "ht", flag: "🇭🇹", native: "Kreyòl", banner: "Poze m yon kesyon nan nenpòt lang" },
  // ── Europe ───────────────────────────────────────────────────────────────
  { code: "de", flag: "🇩🇪", native: "Deutsch", banner: "Stellen Sie mir eine Frage in jeder Sprache" },
  { code: "it", flag: "🇮🇹", native: "Italiano", banner: "Fammi una domanda in qualsiasi lingua" },
  { code: "nl", flag: "🇳🇱", native: "Nederlands", banner: "Stel mij een vraag in elke taal" },
  { code: "pl", flag: "🇵🇱", native: "Polski", banner: "Zadaj mi pytanie w dowolnym języku" },
  { code: "ru", flag: "🇷🇺", native: "Русский", banner: "Задайте мне вопрос на любом языке" },
  { code: "no", flag: "🇳🇴", native: "Norsk", banner: "Still meg et spørsmål på hvilket som helst språk" },
  { code: "da", flag: "🇩🇰", native: "Dansk", banner: "Stil mig et spørgsmål på ethvert sprog" },
  { code: "sv", flag: "🇸🇪", native: "Svenska", banner: "Ställ mig en fråga på vilket språk som helst" },
  { code: "tr", flag: "🇹🇷", native: "Türkçe", banner: "Bana herhangi bir dilde soru sorun" },
  // ── Asia / Middle East / Pacific ─────────────────────────────────────────
  { code: "ar", flag: "🇸🇦", native: "العربية", banner: "اسألني سؤالاً بأي لغة" },
  { code: "hi", flag: "🇮🇳", native: "हिन्दी", banner: "किसी भी भाषा में मुझसे प्रश्न पूछें" },
  { code: "zh", flag: "🇨🇳", native: "中文", banner: "用任何语言问我一个问题" },
  { code: "ja", flag: "🇯🇵", native: "日本語", banner: "どんな言語でも質問してください" },
  { code: "ko", flag: "🇰🇷", native: "한국어", banner: "어떤 언어로든 질문해 주세요" },
  { code: "vi", flag: "🇻🇳", native: "Tiếng Việt", banner: "Hỏi tôi một câu hỏi bằng bất kỳ ngôn ngữ nào" },
  { code: "tl", flag: "🇵🇭", native: "Filipino", banner: "Magtanong sa akin sa anumang wika" },
  { code: "id", flag: "🇮🇩", native: "Indonesia", banner: "Tanyakan pertanyaan kepada saya dalam bahasa apa pun" },
  { code: "th", flag: "🇹🇭", native: "ภาษาไทย", banner: "ถามคำถามฉันในภาษาใดก็ได้" },
];

// Maps page IDs (from the backend navigateToPage tool) to frontend routes.
// Add new entries here when a new navigable page is added to navigationTool.js.
const PAGE_ROUTES = {
  "application-forms": "/application-forms",
  branding: "/branding",
  "branding-create": "/branding/create",
  strategies: "/strategies",
  "lookup-management": "/strategies-key",
  "role-management": "/all-roles",
  "user-management": "/all-users",
  email: "/email",
  applications: "/applications",
  testing: "/testing",
};

const PAGE_LABELS = {
  "application-forms": "Application Forms",
  branding: "Branding Management",
  "branding-create": "Create New Branding",
  strategies: "Strategies",
  "lookup-management": "Lookup Management",
  "role-management": "Role Management",
  "user-management": "User Management",
  email: "Email Templates",
  applications: "Applications",
  testing: "Automated Testing",
};

// Returns "#000000" or "#ffffff" — whichever contrasts more against the given hex background.
// Uses the WCAG relative luminance formula.
const contrastingIconColor = (hex = "#000000") => {
  const h = hex.replace("#", "");
  if (h.length < 6) return "#ffffff";
  const toLinear = (c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  const r = toLinear(parseInt(h.slice(0, 2), 16));
  const g = toLinear(parseInt(h.slice(2, 4), 16));
  const b = toLinear(parseInt(h.slice(4, 6), 16));
  const L = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  // Contrast ratio vs white = (L + 0.05) / 0.05, vs black = 1.05 / (L + 0.05)
  return L > 0.179 ? "#000000" : "#ffffff";
};

const SERVER_URL = getEnv("SERVER_URL");
const AI_CHAT_MODE = import.meta.env.VITE_AI_CHAT_MODE ?? "guided";

const PANEL_WIDTH = 520;
const PANEL_HEIGHT = 700;
const PANEL_MIN_WIDTH = 300;
const PANEL_MIN_HEIGHT = 380;

export default function AIChatWidget() {
  const {
    isOpen,
    setIsOpen: _setIsOpen,
    messages,
    addMessage,
    isLoading,
    setIsLoading,
    getScreenContext,
    currentScreenId,
    formDataSignal,
    widgetResetSignal,
    fieldChangeSignal,
    pushRevertable,
    popRevertable,
    signalContinuationPending,
    triggerAutoMessage: _triggerAutoMessage,
    autoMessageSignal,
    pendingAutoMessageRef,
    assistantMode,
  } = UseAIChat();
  // Logging wrapper — every setIsOpen call is traced so we can see who's opening the widget.
  const setIsOpen = useCallback(
    (val) => {
      console.log(
        `%c[WIDGET-OPEN] setIsOpen(${val}) — assistantMode=${assistantMode} messages=${messages.length} sessionClosed=${sessionStorage.getItem("ai-widget-user-closed")}`,
        val ? "color:#16a34a; font-weight:bold" : "color:#dc2626; font-weight:bold",
      );
      console.trace("[WIDGET-OPEN] caller stack");
      _setIsOpen(val);
    },
    [_setIsOpen, assistantMode, messages.length],
  ); // eslint-disable-line react-hooks/exhaustive-deps
  const { user } = useSelector((s) => s.auth);
  const {
    accentColor,
    secondaryColor,
    buttonTextSecondary,
    textColor,
    fontFamily,
    aiVoice,
    aiCustomPrompt,
    aiLaunchButtonColor,
    aiHeaderColor,
    aiBannerColor,
    aiBannerTextColor,
    primaryColor,
    buttonTextPrimary,
    aiUseCustomIcon,
  } = useBranding();

  const effectiveLaunchColor = aiLaunchButtonColor || accentColor;
  const effectiveHeaderColor = aiHeaderColor || accentColor;
  const effectiveBannerColor = aiBannerColor || secondaryColor;
  const effectiveBannerText = aiBannerTextColor || buttonTextSecondary;

  const navigate = useNavigate();
  const { pathname } = useLocation();
  const fabIconColor = contrastingIconColor(effectiveLaunchColor);
  const headerIconColor = contrastingIconColor(effectiveHeaderColor);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const voice = aiVoice || "nova";
  const pendingListenRef = useRef(false); // set when user holds PTT while bot is speaking
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);
  // Set to true by activateField so the post-response auto-focus doesn't steal focus
  // back from the form field. Cleared when the user next interacts with the chat input.
  const suppressChatFocusRef = useRef(false);
  // Set to true when the user explicitly focuses the chat textarea. Cleared when the user
  // moves focus to a real element outside the chat panel (intentional departure).
  // Ensures focus returns to the textarea after loading completes even when
  // suppressChatFocusRef is set (e.g. stale flag from a prior activateField call).
  const userFocusedChatRef = useRef(false);
  // null when inactive; { lang: "es", langName: "Spanish" } when the applicant has activated translation mode.
  const [translationMode, setTranslationMode] = useState(null);
  const translationModeRef = useRef(null);
  // Hover-translation tooltip: { text, x, y } or null
  const [translationTooltip, setTranslationTooltip] = useState(null);
  const tooltipCacheRef = useRef({}); // label text → translated string
  const tooltipTimerRef = useRef(null); // debounce timer
  const tooltipTargetRef = useRef(null); // currently hovered label element
  // Detected language of the form (BCP-47 name, e.g. "Spanish"). Set on first open.
  const formLanguageRef = useRef("English");
  // Set to true when the screen-change handler sends [FIELD_FOCUS] for the initial field directly
  // (bypassing the 1000ms pause timer). The pause timer checks this and skips to avoid duplicates.
  const suppressNextFocusGuidanceRef = useRef(false);
  // Help-level slider: 0 = off, 1–100 = scales delay from 10 s (less help) to 2 s (more help).
  // Default 50 = 5-second pause before guidance fires.
  // Tracks elements we disabled in applicant mode so we can re-enable them on page change.
  const maxHelpDisabledElsRef = useRef([]);
  const maxHelpDisabledSignsRef = useRef([]); // [data-ai-type="sign"] wrappers blocked via pointer-events
  const [bannerIdx, setBannerIdx] = useState(0);
  const [bannerFading, setBannerFading] = useState(false);
  // Stores the most recent field-focus timer callback so onInputChange can reset the timer
  // when the user types (ensuring the pause window resets on each keystroke).
  const fieldTimerCallbackRef = useRef(null);
  const recognitionRef = useRef(null);
  const audioRef = useRef(null);
  const panelRef = useRef(null);
  // Panel dodge: saved position before moving out of the way of a field.
  // null means the panel is at its normal (user-chosen) position.
  const homePositionRef = useRef(null);
  // The fieldId of the field most recently activated/filled, so we know when to restore.
  const activatedFieldIdRef = useRef(null);
  // Set to true on each screen change so the FIRST dodgeForField call extends the avoid-zone
  // to also cover the form's display text (from form container top down to the focused field).
  const isInitialScreenDodgeRef = useRef(false);

  // Measure the real header height so button and panel sit flush below it.
  // Re-runs on every route change (pathname) so the button stays centered on
  // the header/body dividing line even when the header shifts between pages.
  const [headerBottom, setHeaderBottom] = useState(() => {
    const header = document.querySelector(".bg-header");
    return header ? header.getBoundingClientRect().bottom : 80;
  });
  useLayoutEffect(() => {
    const update = () => {
      const header = document.querySelector(".bg-header");
      if (header) setHeaderBottom(header.getBoundingClientRect().bottom);
    };
    update();
    const header = document.querySelector(".bg-header");
    if (!header) return;
    const ro = new ResizeObserver(update);
    ro.observe(header);
    return () => ro.disconnect();
  }, [pathname]);

  // Draggable position — updated when the panel opens to sit below the measured header
  const [position, setPosition] = useState({
    top: 80,
    left: Math.max(0, window.innerWidth - PANEL_WIDTH - 24),
  });
  const [panelWidth, setPanelWidth] = useState(PANEL_WIDTH);
  const [panelHeight, setPanelHeight] = useState(PANEL_HEIGHT);
  const dragRef = useRef({ isDragging: false, startX: 0, startY: 0, startLeft: 0, startTop: 0 });
  const resizeRef = useRef({
    isResizing: false,
    edge: "",
    startX: 0,
    startY: 0,
    startW: 0,
    startH: 0,
    startLeft: 0,
    startTop: 0,
  });
  // Tracks the TARGET panel position/size — updated synchronously whenever we move the panel.
  // Used in dodgeForField instead of getBoundingClientRect() so we always check against the
  // intended final position, not the mid-animation visual position.
  const panelTargetRef = useRef({
    top: 80,
    left: Math.max(0, window.innerWidth - PANEL_WIDTH - 24),
    width: PANEL_WIDTH,
    height: PANEL_HEIGHT,
  });

  // Refs kept current every render — safe to read inside callbacks/effects
  const isVoiceModeRef = useRef(false);
  const isSpeakingRef = useRef(false);
  const isLoadingRef = useRef(false);
  const sendMessageRef = useRef(null);
  const autoGuideRef = useRef(null);
  // Tracks the most recent [FIELD_FOCUS] that arrived while the AI was busy.
  // Processed immediately after the current request finishes, ensuring the bot
  // always catches up to wherever the user currently is.
  const pendingFieldFocusRef = useRef(null);
  // Incremented whenever a new [FIELD_FOCUS] request starts (or is queued as pending).
  // Lets an in-flight request detect it has been superseded and skip displaying its response.
  const fieldFocusGenerationRef = useRef(0);
  // AbortController for the currently in-flight autoGuide fetch.
  // Aborted immediately when the user moves to a new field.
  const autoGuideAbortRef = useRef(null);
  const justFinishedSpeakingRef = useRef(false);
  const pendingAnalysisRef = useRef(null);
  const pendingFormContinuationRef = useRef(null); // stores { toolArgs, history } while waiting for form data to load
  const pendingFollowUpRef = useRef(null); // task auto-sent after AI-triggered navigation
  const navTimeoutRef = useRef(null); // clears stale follow-up if page never loads
  const prevScreenIdRef = useRef(null);
  const initialGreetingShownRef = useRef(false); // prevents double-greeting when endpoint change clears messages mid-session
  // Stores the plain-text of what the AI last said so we can reject echoes
  const lastAIPlainTextRef = useRef("");
  // Called once when the current TTS utterance ends — used for the accessibility offer handoff
  const onSpeakEndRef = useRef(null);
  // True while the one-shot accessibility offer is being spoken — blocks auto-listen restart
  const accessibilityOfferRef = useRef(false);
  // Tracks the most recently detected language (from AI [LANG:xx] tags) for widget string translation
  const lastDetectedLanguageRef = useRef(null);
  const fabRef = useRef(null); // ref to the floating action button
  const [fabNudged, setFabNudged] = useState(false); // true when FAB is dodging an overlapping element
  const autoGuideTimerRef = useRef(null);
  // Tracks the last screenId+timestamp for which a PAGE_SUMMARY autoGuide fired.
  // Prevents double-firing when multiple triggers race (e.g. goToNextStep on same screen).
  const lastAutoGuidedRef = useRef({ screenId: null, at: 0 });
  // Tracks field IDs that have already received a [JUST_COMPLETED] error check this session.
  // Prevents the same error from being reported multiple times for the same field.
  const justCompletedSentRef = useRef(new Set());
  // Set to true immediately before focusNextAfterButton runs so notify() knows the field
  // transition was triggered by a button press (not user tabbing) and skips [JUST_COMPLETED].
  const buttonTriggeredFocusRef = useRef(false);
  const [introButtonsDismissed, setIntroButtonsDismissed] = useState(false);
  // Assisted Direct Entry panel — set when AI calls openFieldPanel
  const [adePanel, setAdePanel] = useState(null);
  const adePanelCallbackRef = useRef(null); // stores { args, history, ctx } to avoid stale closures
  const confirmedValuesRef = useRef({}); // accumulates every fieldId→value filled this session; emitted on goToNextStep
  // Pre-fill confirmation dialog (basic mode only)
  const [preFillModal, setPreFillModal] = useState(null); // null | { preFilled, remaining }
  const preFillShownRef = useRef(new Set()); // screenIds already shown — never show twice
  const preFillWatchRef = useRef(null); // interval watching slow-loading fields inside the modal

  // Silent field-error monitor (basic mode only)
  const [fieldErrorModal, setFieldErrorModal] = useState(null); // null | { fieldId, fieldLabel, fieldType, description, suggestion, currentValue }
  const confirmedErrorsRef = useRef({}); // { [fieldId]: Set<string> } — values the applicant confirmed intentionally
  // Synchronous flag set during focusout so the click interceptor can block immediately
  // (React setState is async — this ref bridges the gap before the modal renders).
  const pendingFieldErrorRef = useRef(null);
  // The button/link element whose click was intercepted while a field error was pending.
  // Re-clicked automatically after the applicant confirms or corrects the value.
  const blockedClickTargetRef = useRef(null);
  isLoadingRef.current = isLoading;
  isSpeakingRef.current = isSpeaking;

  // Reset voice/conversation mode when a new applicant session starts (clearOnMount fires)
  useEffect(() => {
    if (!widgetResetSignal) return;
    // Stop any active TTS audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
    // Stop speech recognition
    recognitionRef.current?.stop();
    setIsListening(false);
    // Turn off voice mode and clear pending listen
    isVoiceModeRef.current = false;
    setIsVoiceMode(false);
    pendingListenRef.current = false;
    lastDetectedLanguageRef.current = null;
  }, [widgetResetSignal]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-send a queued message (e.g. from clicking "Build live action" on the demo page)
  useEffect(() => {
    if (!autoMessageSignal || !pendingAutoMessageRef?.current) return;
    const text = pendingAutoMessageRef.current;
    pendingAutoMessageRef.current = null;
    // Small delay to let the widget finish opening/rendering before sending
    setTimeout(() => {
      if (sendMessageRef.current) sendMessageRef.current(text);
    }, 400);
  }, [autoMessageSignal]); // eslint-disable-line react-hooks/exhaustive-deps

  // When the applicant focuses a form field (via Tab or click):
  //   • The panel dodges IMMEDIATELY — no delay, always tracks the current field.
  //   • AI guidance fires only after the user pauses (no typing) for a fixed 3 s delay (non-applicant mode only).
  //   • Leaving a field cancels the pause timer AND aborts any in-flight request,
  //     so the bot never gets stuck responding to a field the user already left.
  useEffect(() => {
    if (!isOpen) return;

    let pauseTimer = null;
    let lastNotifiedFieldId = null;
    // Fill-state of the field when the user first focused it — used to detect empty→filled
    // transitions for [JUST_COMPLETED] validation.
    // Fill-state of the field when the user first focused it — used to detect empty→filled
    // transitions for [JUST_COMPLETED] validation.
    let lastNotifiedFieldWasFilled = false;
    // Timestamp of the most recent input event on the current field.
    // Used in pause mode to reset the guidance timer whenever the user types.
    let lastInputTime = 0;

    // Cancel the pending pause timer AND abort the current in-flight AI request.
    // Called immediately whenever the user moves to a new field.
    const cancelPendingWork = () => {
      clearTimeout(pauseTimer);
      pauseTimer = null;
      fieldTimerCallbackRef.current = null;
      if (autoGuideAbortRef.current) {
        fieldFocusGenerationRef.current++; // invalidate any response still in flight
        pendingFieldFocusRef.current = null; // no stale pending should fire after this
        autoGuideAbortRef.current.abort();
        autoGuideAbortRef.current = null;
      }
    };

    const onFocusIn = (e) => {
      const target = e.target;

      // Phone-field country selector: auto-advance to the number input on Tab-forward.
      if (target.classList?.contains("PhoneInputCountrySelect")) {
        const numberInput = target.closest(".PhoneInput")?.querySelector(".PhoneInputInput");
        if (numberInput && e.relatedTarget !== numberInput) numberInput.focus();
        return;
      }

      // Signature field: focus can land on the wrapper div (tab) or anywhere inside it (canvas click).
      const signMarker = target.closest?.("[data-ai-type='sign']");
      if (signMarker) {
        const sigFieldId = signMarker.getAttribute("data-ai-id");
        if (sigFieldId && sigFieldId !== lastNotifiedFieldId) {
          // Immediately: cancel stale work, move panel
          cancelPendingWork();
          lastNotifiedFieldId = sigFieldId;
          const sigValue = signMarker.getAttribute("data-ai-value") || "";
          lastNotifiedFieldWasFilled = !!sigValue;
          const outerMarker = signMarker.parentElement?.closest("[data-ai-type='sign']") || signMarker;
          console.log(`[FOCUS] field: id="${sigFieldId}" label="signature" type=sign filled=${!!sigValue}`);
          dodgeForField(outerMarker);

          // Signature fields always get immediate guidance — the applicant needs to understand
          // what they're signing before they can proceed, regardless of guidance mode.
          if (!sigValue && assistantMode === "applicant" && AI_CHAT_MODE !== "basic") {
            const sigTimerCallback = () => {
              const signText =
                (outerMarker.getAttribute("data-ai-text") || "").trim() ||
                (signMarker.getAttribute("data-ai-text") || "").trim();
              const ctx = getScreenContext();
              const sigField = ctx?.currentState?.fields?.find((f) => f.isSignature);
              if (sigField) sendSignatureGuidance(sigField, signText);
            };
            fieldTimerCallbackRef.current = sigTimerCallback;
            pauseTimer = setTimeout(sigTimerCallback, 300);
          }
        }
        return;
      }

      if (!["INPUT", "SELECT", "TEXTAREA"].includes(target.tagName)) return;
      if (target === inputRef.current) return;
      const fieldId = target.type === "radio" ? target.getAttribute("name") : target.id || target.getAttribute("name");
      if (!fieldId) return;
      if (fieldId === lastNotifiedFieldId) return;

      // Capture the previous field before updating tracking — used for [JUST_COMPLETED] below.
      const prevFieldId = lastNotifiedFieldId;
      const prevFieldWasFilled = lastNotifiedFieldWasFilled;

      // Immediately: cancel all pending/in-flight work for the previous field, move the panel.
      cancelPendingWork();
      lastNotifiedFieldId = fieldId;
      lastNotifiedFieldWasFilled = false; // updated when pause timer fires
      activatedFieldIdRef.current = fieldId;
      console.log(`[FOCUS] field: id="${fieldId}" type=${target.type || "text"}`);
      dodgeForField(target);

      lastInputTime = 0; // reset per-field typing tracker

      if (assistantMode !== "applicant" || AI_CHAT_MODE === "basic") return;

      // Immediate: auto-fill batch skip for Google Places and similar.
      // When the current field AND the next field are both filled already (address lookup filled
      // several fields at once), jump directly to the first genuinely empty required field so the
      // applicant doesn't have to tab through a run of pre-filled fields manually.
      // Uses a short delay to let the DOM settle after the auto-fill cascade finishes.
      if (prevFieldId) {
        setTimeout(() => {
          const batchCtx = getScreenContext();
          if (!batchCtx?.currentState?.fields?.length) return;
          const allFields = batchCtx.currentState.fields;
          const curIdx = allFields.findIndex((f) => f.id === fieldId);
          if (curIdx === -1) return;
          const curField = allFields[curIdx];
          const nextCtxF = allFields[curIdx + 1];
          const isBatchFilled = curField?.filled && nextCtxF?.filled;
          if (isBatchFilled) {
            const firstEmpty = allFields.slice(curIdx).find((f) => f.required && !f.filled && !f.isSignature);
            if (firstEmpty && firstEmpty.id !== fieldId) {
              const skipped = allFields.slice(
                curIdx,
                allFields.findIndex((f) => f.id === firstEmpty.id),
              );
              const jumpEl =
                document.getElementById(firstEmpty.id) ||
                document.querySelector(`[name="${CSS.escape(firstEmpty.id)}"]`);
              if (jumpEl) {
                jumpEl._autoFilledFields = skipped.map((f) => f.label).join(", ");
                jumpEl.focus();
              }
            }
          }
        }, 150);
      }

      // Deferred: guidance fires after the user pauses without typing for 3 s (non-applicant mode only).
      // prevFieldId / prevFieldWasFilled are captured in the closure for [JUST_COMPLETED].
      const timerCallback = () => {
        // Screen-change handler sent [FIELD_FOCUS] directly for this first field — skip to avoid duplicate.
        if (suppressNextFocusGuidanceRef.current) {
          suppressNextFocusGuidanceRef.current = false;
          return;
        }
        if (isLoadingRef.current) return; // busy with a manual chat message — skip

        const ctx = getScreenContext();
        if (!ctx?.currentState?.fields?.length) return;
        const field = ctx.currentState.fields.find((f) => f.id === fieldId);
        if (!field) return;

        if (!field.filled) justCompletedSentRef.current.delete(fieldId);

        // [JUST_COMPLETED] field validation — temporarily disabled, re-enable when ready.
        // const buttonTriggered = buttonTriggeredFocusRef.current;
        buttonTriggeredFocusRef.current = false;
        let justCompletedSection = "";
        /*
        if (!buttonTriggered && prevFieldId && prevFieldId !== fieldId) {
          const prevCtxField = ctx.currentState.fields.find((f) => f.id === prevFieldId);
          // Skip suggestion/autocomplete fields — they're filled programmatically (e.g. Google Places),
          // so ctx.currentState.fields may hold a stale intermediate keystroke value rather than the
          // final selection. Validating that partial value produces false positives.
          const isAutocomplete = prevCtxField?.directEntry === true;
          // Read the live DOM value instead of the stale ctx snapshot — avoids false errors when
          // discoverFormFields ran mid-type before the autocomplete or onChange handler committed.
          const prevEl = prevFieldId
            ? (document.getElementById(prevFieldId) || document.querySelector(`[name="${CSS.escape(prevFieldId)}"]`))
            : null;
          const liveValue = prevEl ? prevEl.value.trim() : prevCtxField?.value ?? "";
          const prevIsFilled = liveValue !== "";
          if (!isAutocomplete && prevCtxField && prevIsFilled && !prevFieldWasFilled &&
              !justCompletedSentRef.current.has(prevFieldId)) {
            justCompletedSentRef.current.add(prevFieldId);
            justCompletedSection =
              `\n\n[JUST_COMPLETED] The applicant just finished field "${prevCtxField.label}"` +
              ` (id: ${prevFieldId}, type: ${prevCtxField.type || "text"}, required: ${prevCtxField.required ? "yes" : "no"})` +
              ` with value "${liveValue}".` +
              ` Check ONLY this field for errors using the validation rules.` +
              ` If an error is found, start your response with ⚠️ and describe it in 1–2 sentences. Do NOT call activateField or goToNextStep. Do NOT give guidance for the newly focused field in the same response.` +
              ` If valid: write NOTHING about the checked field. No acknowledgement whatsoever. Immediately give guidance for the newly focused field as if [JUST_COMPLETED] was not in this message.`;
          }
        }
        */ // end JUST_COMPLETED block

        const stepInfo =
          ctx.currentState.currentStep != null
            ? ` Step ${ctx.currentState.currentStep + 1} of ${ctx.currentState.totalSteps}.`
            : "";

        const optionsHint =
          field.type === "radio" && Array.isArray(field.options) && field.options.length
            ? ` Options: ${field.options.map((o, i) => `${String.fromCharCode(97 + i)}) ${o.label}`).join(", ")}.`
            : "";

        const autoFillNote = target._autoFilledFields
          ? ` Note: the following fields were just auto-filled (likely by an address lookup or similar): ${target._autoFilledFields}. Briefly acknowledge this ("Looks like some fields were filled automatically") before giving guidance for the current field.`
          : "";
        if (target._autoFilledFields) delete target._autoFilledFields;

        const helpContextNote = field.helpContext
          ? ` FIELD HELP CONTEXT (configured by the form owner specifically for this field — use it to give more informed guidance; invite the applicant to ask more if they want deeper detail): "${field.helpContext}".`
          : "";

        autoGuideRef.current?.(
          `[FIELD_FOCUS] The applicant is now focused on field "${field.label}" (id: ${fieldId}).` +
            ` Filled: ${field.filled ? `yes, current value: "${field.value || ""}"` : "no"}. Required: ${field.required ? "yes" : "no"}. Type: ${field.type || "text"}.` +
            `${optionsHint}${stepInfo}${autoFillNote}${helpContextNote}` +
            " Provide brief guidance for this field (1–3 sentences), then end with 'Tab to move on when you're done.'" +
            justCompletedSection,
        );
      };
      // In applicant mode the AI drives the conversation — suppress passive field guidance.
      if (assistantMode !== "applicant") {
        fieldTimerCallbackRef.current = timerCallback;
        pauseTimer = setTimeout(timerCallback, 3000);
      }
    };

    // Fires on every keystroke in any form field.
    // Any typing resets the guidance timer — guidance fires only after a true pause
    // (no keystrokes for the full delay period).
    const onInputChange = (e) => {
      const t = e.target;
      if (!["INPUT", "SELECT", "TEXTAREA"].includes(t.tagName)) return;
      if (t === inputRef.current) return;
      const fId = t.id || t.getAttribute("name");
      if (!fId || fId !== lastNotifiedFieldId) return;
      if (fieldTimerCallbackRef.current) {
        lastInputTime = Date.now();
        clearTimeout(pauseTimer);
        pauseTimer = setTimeout(fieldTimerCallbackRef.current, 3000);
      }
    };

    document.addEventListener("focusin", onFocusIn, true);
    document.addEventListener("input", onInputChange, true);
    return () => {
      document.removeEventListener("focusin", onFocusIn, true);
      document.removeEventListener("input", onInputChange, true);
      clearTimeout(pauseTimer);
    };
  }, [assistantMode, isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // Silent field-error monitor — basic mode only.
  // Listens for focusout on every form field. When the applicant leaves a field,
  // runs client-side pattern checks (no AI call). If an obvious error is found and
  // the applicant hasn't already confirmed this value, shows a dialog with options to
  // keep / accept suggestion / type new value.
  //
  // Click interception: because React setState is async, focusout fires before the modal
  // renders. A capture-phase click listener blocks any button/link click that races with
  // the pending error check, stores the target, and re-fires it automatically after the
  // applicant confirms or corrects the value.
  //
  // Secure fields (SSN, passwords, bank accounts, OTP codes, etc.) are never monitored.
  useEffect(() => {
    console.log(
      "%c[FIELD-ERR] effect mount — assistantMode=%s AI_CHAT_MODE=%s",
      "color:#7c3aed;font-weight:bold",
      assistantMode,
      AI_CHAT_MODE,
    );
    if (assistantMode !== "applicant") {
      console.log("%c[FIELD-ERR] skipped: not applicant mode", "color:#7c3aed");
      return;
    }
    if (AI_CHAT_MODE !== "basic") {
      console.log("%c[FIELD-ERR] skipped: not basic mode (mode=%s)", "color:#7c3aed", AI_CHAT_MODE);
      return;
    }
    console.log("%c[FIELD-ERR] listeners registered", "color:#7c3aed;font-weight:bold");

    // Shared helper — checks an input element for errors and, if found, sets the
    // pending flag + opens the modal. Returns true if an error was detected.
    const checkAndFlag = (el) => {
      if (!el || el === inputRef.current) return false;
      if (!["INPUT", "SELECT", "TEXTAREA"].includes(el.tagName)) return false;
      if (el.type === "password") return false;
      if (el.closest?.("[data-ai-type='sign']")) return false;

      const rawValue = el.value?.trim();
      if (!rawValue) return false;

      const fieldId = el.id || el.getAttribute("name");
      if (!fieldId) return false;

      const ctx = getScreenContext();
      const fields = ctx?.currentState?.fields || [];
      const meta = fields.find((f) => f.id === fieldId);
      console.log(
        "%c[FIELD-ERR] checkAndFlag fieldId=%s meta=%o fieldMode=%s",
        "color:#7c3aed",
        fieldId,
        meta,
        meta?.fieldMode,
      );

      if (meta?.fieldMode === "secure" || meta?.isSignature) return false;
      // Skip auto-defaulted fields — e.g. PhoneInput's country-code selector
      if (meta?.isDefault) return false;

      const fieldLabel = meta?.label || fieldId;
      const fieldType = meta?.type || el.type || "text";

      const confirmed = confirmedErrorsRef.current[fieldId];
      if (confirmed instanceof Set && confirmed.has(rawValue)) return false;

      // Already pending — don't re-open the modal for the same error
      if (pendingFieldErrorRef.current) return true;

      console.log(
        "%c[FIELD-ERR] checking — fieldId=%s label=%s type=%s value=%s",
        "color:#7c3aed;font-weight:bold",
        fieldId,
        fieldLabel,
        fieldType,
        rawValue,
      );
      const error = checkFieldForErrors(fieldId, fieldLabel, fieldType, rawValue);
      console.log("%c[FIELD-ERR] result:", "color:#7c3aed;font-weight:bold", error);
      if (!error) return false;

      pendingFieldErrorRef.current = true;
      console.log("%c[FIELD-ERR] ▶ flagging error for fieldId=%s", "color:#7c3aed;font-weight:bold", fieldId);

      // For email fields: warn that any already-triggered action (e.g. OTP send)
      // may need to be repeated with the corrected address.
      const isEmail =
        fieldType === "email" || fieldId.toLowerCase().includes("email") || fieldLabel.toLowerCase().includes("email");
      const retryNote = isEmail
        ? "If a step was already triggered using this address — such as sending a verification code — you may need to repeat it after saving the corrected value."
        : null;

      setFieldErrorModal({
        fieldId,
        fieldLabel,
        fieldType,
        description: error.description,
        suggestion: error.suggestion,
        currentValue: rawValue,
        retryNote,
      });
      return true;
    };

    // Primary intercept point: mousedown on action elements fires BEFORE click and
    // before focus moves, so we can check the currently-focused field right now and
    // set the blocking flag before the click event fires.
    const onCaptureMouseDown = (e) => {
      if (e.target.closest("[data-field-error-modal]")) return;
      const actionEl = e.target.closest("button, a, input[type='submit'], [role='button']");
      if (!actionEl) return;
      const focused = document.activeElement;
      console.log(
        "%c[FIELD-ERR] mousedown on action=%s focused=%s#%s",
        "color:#a16207",
        actionEl.tagName,
        focused?.tagName,
        focused?.id,
      );
      const hasError = checkAndFlag(focused);
      if (hasError) {
        // Store the blocked element here — before click fires — so replay works correctly
        blockedClickTargetRef.current = actionEl;
        console.log(
          "%c[FIELD-ERR] ▶ mousedown: stored blocked target, click will be stopped",
          "color:#a16207;font-weight:bold",
        );
      }
    };

    // Fallback focusout handler — covers keyboard Tab navigation (no mousedown on a button).
    const onFocusOut = (e) => {
      console.log(
        "%c[FIELD-ERR] focusout tag=%s id=%s value=%s",
        "color:#7c3aed",
        e.target.tagName,
        e.target.id,
        e.target.value,
      );
      checkAndFlag(e.target);
    };

    // Capture-phase click interceptor: runs before any React event handlers.
    // Blocks the click if a field error is pending confirmation.
    const onCaptureClick = (e) => {
      console.log(
        "%c[FIELD-ERR] click capture — pending=%s target=%s",
        "color:#a16207",
        !!pendingFieldErrorRef.current,
        e.target?.tagName,
      );
      if (!pendingFieldErrorRef.current) return;
      if (e.target.closest("[data-field-error-modal]")) {
        console.log("%c[FIELD-ERR] click: modal button, letting through", "color:#a16207");
        return;
      }
      const actionEl = e.target.closest("button, a, input[type='submit'], [role='button']");
      if (!actionEl) return;
      console.log(
        "%c[FIELD-ERR] ▶ blocking click on %s text=%s",
        "color:#a16207;font-weight:bold",
        actionEl.tagName,
        actionEl.textContent?.trim(),
      );
      e.stopPropagation();
      pendingFieldErrorRef.current = null;
      if (!blockedClickTargetRef.current) blockedClickTargetRef.current = actionEl;
    };

    document.addEventListener("mousedown", onCaptureMouseDown, true);
    document.addEventListener("mousedown", onCaptureMouseDown, true);
    document.addEventListener("focusout", onFocusOut, true);
    document.addEventListener("click", onCaptureClick, true);
    return () => {
      console.log("%c[FIELD-ERR] listeners removed", "color:#7c3aed");
      document.removeEventListener("mousedown", onCaptureMouseDown, true);
      document.removeEventListener("focusout", onFocusOut, true);
      document.removeEventListener("click", onCaptureClick, true);
    };
    // NOTE: intentionally excludes currentScreenId — adding it caused the listeners to be
    // torn down and re-added on every registerScreenContext call, making the pre-click
    // focusout invisible to the error monitor. All inner state is accessed via refs.
  }, [assistantMode]); // eslint-disable-line react-hooks/exhaustive-deps

  // Pre-fill confirmation: polls until field values settle (or the hard cap fires),
  // then shows the review dialog if any non-secure fields are already filled.
  // Reuses the same data-ai-loading guard that the guided mode's settle-detection uses,
  // so AI-delayed fields (with spinners) hold the window automatically.
  useEffect(() => {
    if (assistantMode !== "applicant") return;
    if (AI_CHAT_MODE !== "basic") return;
    if (!currentScreenId) return;
    if (preFillShownRef.current.has(currentScreenId)) return;

    const screenId = currentScreenId;

    const FLOOR_MS = 150; // never fire before this many ms
    const QUIET_MS = 100; // values must be stable for this long
    const CAP_MS = 15000; // hard cap — covers AI-filled fields that take up to ~10 s
    const POLL_MS = 50; // poll interval

    const start = Date.now();
    let quietSince = start;
    let lastKey = null;
    let cancelled = false;
    let pollCount = 0;

    console.log(
      `%c[PREFILL] effect started — screenId="${screenId}" CAP=${CAP_MS}ms`,
      "color:#8b5cf6; font-weight:bold",
    );

    // Get the freshest field list available — re-discover from live DOM when formRef
    // is present, because registerScreenContext is only called when deps change (e.g.
    // currentStep), not when AI fills individual fields between registrations.
    const getLiveFields = (ctx) => {
      if (ctx?.formRef?.current) {
        return discoverFormFields(ctx.formRef.current, { silent: true });
      }
      return ctx?.currentState?.fields ?? [];
    };

    const getKey = () => {
      const ctx = getScreenContext();
      if (!ctx || ctx.screenId !== screenId) return null;
      return getLiveFields(ctx)
        .filter((f) => !f.isSignature)
        .map((f) => `${f.id}:${f.filled ? "1" : "0"}:${f.value ?? ""}`)
        .join("|");
    };

    // Returns true if a field's DOM element (or a wrapper up to containerEl) has an active spinner.
    const isFieldLoading = (containerEl, fieldId) => {
      if (!containerEl || !fieldId) return false;
      const el =
        containerEl.querySelector(`#${CSS.escape(fieldId)}`) ||
        containerEl.querySelector(`[name="${CSS.escape(fieldId)}"]`) ||
        containerEl.querySelector(`[data-ai-id="${CSS.escape(fieldId)}"]`);
      if (!el) return false;
      if (el.getAttribute("data-ai-loading") === "true") return true;
      let p = el.parentElement;
      while (p && p !== containerEl) {
        if (p.getAttribute("data-ai-loading") === "true") return true;
        p = p.parentElement;
      }
      return false;
    };

    const tryFire = (reason) => {
      if (cancelled) return;
      cancelled = true;

      const ctx = getScreenContext();
      if (!ctx || ctx.screenId !== screenId) {
        console.log(`%c[PREFILL] tryFire(${reason}) — screen changed, aborting`, "color:#8b5cf6");
        return;
      }

      const container = ctx.formRef?.current ?? null;
      const fields = getLiveFields(ctx);
      console.log(
        `%c[PREFILL] tryFire(${reason}) — elapsed=${Date.now() - start}ms totalFields=${fields.length}`,
        "color:#8b5cf6; font-weight:bold",
      );

      // Fields already filled
      const preFilled = fields
        .filter((f) => f.filled && !f.isSignature && f.fieldMode !== "secure")
        .map((f) => ({ ...f, isLoading: false }));

      // Fields not yet filled but have an active field-level spinner — include as loading placeholders
      const loadingPlaceholders = fields
        .filter((f) => !f.filled && !f.isSignature && f.fieldMode !== "secure" && isFieldLoading(container, f.id))
        .map((f) => ({ ...f, isLoading: true }));

      const allPreFilled = [...preFilled, ...loadingPlaceholders];

      if (allPreFilled.length < 3) {
        console.log("%c[PREFILL] fewer than 3 pre-filled fields — dialog suppressed", "color:#8b5cf6");
        return;
      }

      preFillShownRef.current.add(screenId);

      const remaining = fields.filter(
        (f) => !f.filled && !f.isSignature && f.required && !isFieldLoading(container, f.id),
      );
      setPreFillModal({ preFilled: allPreFilled, remaining });
    };

    const poll = () => {
      if (cancelled) return;

      // Abort if the screen changed before we fired
      if (getScreenContext()?.screenId !== screenId) {
        console.log("%c[PREFILL] poll — screen changed, cancelling", "color:#8b5cf6");
        cancelled = true;
        return;
      }

      const now = Date.now();
      const elapsed = now - start;
      const aiLoading = !!document.querySelector('[data-ai-loading="page"]');
      pollCount++;

      // Log every ~2 seconds (every 10 polls at 200ms) or when key changes
      const key = getKey();
      if (key === null) {
        console.log("%c[PREFILL] poll — getKey() returned null (screen changed?), cancelling", "color:#8b5cf6");
        cancelled = true;
        return;
      }

      const keyChanged = key !== lastKey;
      if (keyChanged) {
        console.log(
          `%c[PREFILL] poll #${pollCount} elapsed=${elapsed}ms — KEY CHANGED, resetting quiet window`,
          "color:#8b5cf6",
          { aiLoading, quietAge: now - quietSince, newKey: key.slice(0, 200) },
        );
        lastKey = key;
        quietSince = now;
      } else if (pollCount % 10 === 1) {
        // Periodic heartbeat every ~2 seconds
        console.log(`%c[PREFILL] poll #${pollCount} elapsed=${elapsed}ms — stable`, "color:#8b5cf6", {
          aiLoading,
          quietAge: now - quietSince,
          filledCount: key.split("|").filter((s) => s.includes(":1:")).length,
        });
      }

      // Hard cap — fire regardless of stability
      if (elapsed >= CAP_MS) {
        console.log(`%c[PREFILL] CAP reached at ${elapsed}ms — firing`, "color:#f59e0b; font-weight:bold");
        tryFire("cap");
        return;
      }

      // Hold while any field's AI process is still running (spinner visible)
      if (aiLoading) {
        quietSince = now;
        setTimeout(poll, POLL_MS);
        return;
      }

      // Floor + quiet window both satisfied — fire
      if (elapsed >= FLOOR_MS && now - quietSince >= QUIET_MS) {
        console.log(
          `%c[PREFILL] settled — elapsed=${elapsed}ms quietAge=${now - quietSince}ms — firing`,
          "color:#22c55e; font-weight:bold",
        );
        tryFire("settled");
        return;
      }

      setTimeout(poll, POLL_MS);
    };

    setTimeout(poll, POLL_MS);
    return () => {
      cancelled = true;
      // Remove on navigation so returning to the same page shows the dialog again.
      // The guard above (has check) still prevents double-fires during re-renders
      // within a single visit because cancelled=true stops the poller immediately.
      preFillShownRef.current.delete(screenId);
    };
  }, [assistantMode, currentScreenId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Watcher: once the pre-fill modal is open with still-loading fields, poll them
  // and update their values in-place as each one resolves.
  useEffect(() => {
    const hasLoading = preFillModal?.preFilled?.some((f) => f.isLoading);

    if (preFillWatchRef.current) {
      clearInterval(preFillWatchRef.current);
      preFillWatchRef.current = null;
    }

    if (!preFillModal || !hasLoading) return;

    preFillWatchRef.current = setInterval(() => {
      const ctx = getScreenContext();
      if (!ctx) return;
      const container = ctx.formRef?.current ?? null;
      const liveFields = ctx.formRef?.current
        ? discoverFormFields(ctx.formRef.current, { silent: true })
        : (ctx.currentState?.fields ?? []);

      setPreFillModal((prev) => {
        if (!prev) return null;
        let anyStillLoading = false;
        const newRemaining = [...prev.remaining];
        const updated = prev.preFilled
          .map((f) => {
            if (!f.isLoading) return f;
            // Check if the field's spinner has cleared
            const stillLoading = (() => {
              if (!container || !f.id) return false;
              const el =
                container.querySelector(`#${CSS.escape(f.id)}`) ||
                container.querySelector(`[name="${CSS.escape(f.id)}"]`) ||
                container.querySelector(`[data-ai-id="${CSS.escape(f.id)}"]`);
              if (!el) return false;
              if (el.getAttribute("data-ai-loading") === "true") return true;
              let p = el.parentElement;
              while (p && p !== container) {
                if (p.getAttribute("data-ai-loading") === "true") return true;
                p = p.parentElement;
              }
              return false;
            })();
            if (stillLoading) {
              anyStillLoading = true;
              return f;
            }
            const live = liveFields.find((lf) => lf.id === f.id);
            if (live?.filled) return { ...f, value: live.value, isLoading: false };
            // Resolved empty — move to remaining if required and not already there
            if (f.required && !newRemaining.some((r) => r.id === f.id)) {
              newRemaining.push({ id: f.id, label: f.label, required: true });
            }
            return null; // remove from preFilled
          })
          .filter(Boolean);

        if (!anyStillLoading && preFillWatchRef.current) {
          clearInterval(preFillWatchRef.current);
          preFillWatchRef.current = null;
        }
        return { ...prev, preFilled: updated, remaining: newRemaining };
      });
    }, 150);

    return () => {
      if (preFillWatchRef.current) {
        clearInterval(preFillWatchRef.current);
        preFillWatchRef.current = null;
      }
    };
  }, [!!preFillModal, preFillModal?.preFilled?.some((f) => f.isLoading)]); // eslint-disable-line react-hooks/exhaustive-deps

  // Immediately focus and dodge to the first unfilled required field on the current screen.
  // The bot is NOT involved — field activation happens programmatically so the user is never
  // stranded while waiting for an AI round-trip. Returns true if a field was focused.
  // requireRequired: true (default) = only focus required fields (used mid-form after button presses)
  //                  false = focus first unfilled field regardless of required (used on screen change)
  const focusFirstEmptyField = (fields, { requireRequired = true } = {}) => {
    const target = requireRequired
      ? fields?.find((f) => f.required && !f.filled && !f.isSignature)
      : fields?.find((f) => !f.filled && !f.isSignature);
    if (!target) return false;
    const el = document.getElementById(target.id) || document.querySelector(`[name="${CSS.escape(target.id)}"]`);
    if (!el) return false;
    suppressChatFocusRef.current = true;
    el.focus();
    // Only select-all if we actually moved focus (don't disrupt mid-typing on already-focused field).
    if (document.activeElement === el) {
      try {
        el.select();
      } catch (_) {}
    }
    dodgeForField(el);
    return true;
  };

  // If there is an unfilled signature field and no regular fields to focus, notify the bot
  // so it can guide the applicant through signing. Returns true if a notification was sent.
  const notifySignatureIfPending = (fields) => {
    const sigField = fields?.find((f) => f.isSignature && !f.filled);
    if (!sigField) return false;
    // Read text from the live DOM. Prefer the outermost [data-ai-type="sign"] ancestor
    // (set by the section component) over an inner wrapper (set by SignatureBox itself).
    const markerEl = document.querySelector(`[data-ai-type="sign"][data-ai-id="${sigField.id}"]`);
    const outerMarkerEl = markerEl?.parentElement?.closest("[data-ai-type='sign']");
    const signText =
      (outerMarkerEl?.getAttribute("data-ai-text") || "").trim() ||
      (markerEl?.getAttribute("data-ai-text") || "").trim() ||
      sigField.signText ||
      "";
    sendSignatureGuidance(sigField, signText);
    return true;
  };

  const sendSignatureGuidance = (sigField, signText) => {
    const signTextNote = signText ? ` The attestation/agreement text they are signing reads: "${signText}"` : "";
    autoGuideRef.current?.(
      `[FIELD_FOCUS] The applicant has reached the signature field "${sigField.label}" (id: ${sigField.id}). ` +
        `Required: ${sigField.required ? "yes" : "no"}.${signTextNote} ` +
        `First quote the attestation text verbatim, then in 1–3 plain-language sentences explain what it means in the context of a financial services application. Then in one sentence tell them how to sign.`,
    );
  };

  // Returns the nearest enabled button adjacent to inputEl in the DOM.
  // Used by the Enter-key listener and by dodgeForField (to avoid covering buttons too).
  const findAdjacentButton = (inputEl) => {
    let el = inputEl;
    for (let depth = 0; depth < 4; depth++) {
      let sibling = el.nextElementSibling;
      while (sibling) {
        if (sibling.tagName === "BUTTON" && !sibling.disabled) return sibling;
        const btn = sibling.querySelector("button:not([disabled])");
        if (btn) return btn;
        sibling = sibling.nextElementSibling;
      }
      el = el.parentElement;
      if (!el || el === document.body) break;
    }
    return null;
  };

  // After a non-navigation button press, focus the next empty field.
  // Retries with backoff because some fields (e.g. OTP input) appear only after an API response.
  // Stops automatically if the screen navigates away.
  const focusNextAfterButton = (screenId, attempt = 0) => {
    const ctx = getScreenContext();
    if (!ctx || ctx.screenId !== screenId) return; // navigated — screen-change effect handles it
    const focused = focusFirstEmptyField(ctx.currentState?.fields);
    if (!focused && attempt < 8) {
      setTimeout(() => focusNextAfterButton(screenId, attempt + 1), 350);
    }
  };

  // When the user presses Enter inside a form input, click the nearest adjacent button
  // (e.g. "Send Code" next to an email field, "Verify" next to an OTP field).
  // Also handles mouse clicks on any non-chat button (covers the same post-button focus logic).
  // Runs in bubble phase so React component handlers (suggestion dropdowns, etc.) fire first;
  // we bail out if they already called e.preventDefault().
  useEffect(() => {
    if (assistantMode !== "applicant" || AI_CHAT_MODE === "basic") return;

    // Flag set just before btn.click() so the click listener can skip that synthetic click.
    let enterTriggeredBtn = null;

    const onEnterKeydown = (e) => {
      // Google Places pac-container: if Tab is pressed and exactly one suggestion is visible, auto-select it.
      if (e.key === "Tab" && !e.defaultPrevented) {
        const t = e.target;
        if (t && ["INPUT", "TEXTAREA"].includes(t.tagName) && t !== inputRef.current) {
          const pacContainer = document.querySelector(".pac-container");
          if (pacContainer && getComputedStyle(pacContainer).display !== "none") {
            const pacItems = pacContainer.querySelectorAll(".pac-item");
            if (pacItems.length === 1) {
              e.preventDefault();
              t.dispatchEvent(
                new KeyboardEvent("keydown", { key: "ArrowDown", keyCode: 40, bubbles: true, cancelable: true }),
              );
              setTimeout(
                () =>
                  t.dispatchEvent(
                    new KeyboardEvent("keydown", { key: "Enter", keyCode: 13, bubbles: true, cancelable: true }),
                  ),
                50,
              );
              return;
            }
          }
        }
      }

      if (e.key !== "Enter") return;
      if (e.defaultPrevented) return; // component already handled (e.g. suggestion selection)
      const target = e.target;
      if (!["INPUT", "TEXTAREA"].includes(target.tagName)) return;
      if (target === inputRef.current) return; // don't intercept the chat input
      const btn = findAdjacentButton(target);
      if (!btn) return;
      if (panelRef.current?.contains(btn)) return; // don't click buttons inside the chat panel
      e.preventDefault();

      const screenId = getScreenContext()?.screenId;
      // Mark this click as Enter-triggered so onButtonClick doesn't double-fire.
      enterTriggeredBtn = btn;
      btn.click();
      enterTriggeredBtn = null;

      // Retry-with-backoff: field may not be in the DOM yet (e.g. OTP input appears after API call).
      buttonTriggeredFocusRef.current = true;
      setTimeout(() => focusNextAfterButton(screenId, 0), 350);
    };

    // Mouse-click handler: covers buttons the user clicks directly (not via Enter).
    // Uses the same retry-with-backoff logic; bails if the screen navigates.
    const onButtonClick = (e) => {
      const btn = e.target.closest("button");
      if (!btn || btn.disabled) return;
      if (panelRef.current?.contains(btn)) return; // ignore chat panel buttons
      if (btn === enterTriggeredBtn) return; // already handled by Enter key path above
      const screenId = getScreenContext()?.screenId;
      buttonTriggeredFocusRef.current = true;
      setTimeout(() => focusNextAfterButton(screenId, 0), 350);
    };

    // Bubble phase: runs after child React handlers so defaultPrevented is reliable.
    document.addEventListener("keydown", onEnterKeydown);
    document.addEventListener("click", onButtonClick);
    return () => {
      document.removeEventListener("keydown", onEnterKeydown);
      document.removeEventListener("click", onButtonClick);
    };
  }, [assistantMode]); // eslint-disable-line react-hooks/exhaustive-deps

  // ---------- drag-to-move ----------

  const onResizeMouseDown = (e, edge) => {
    e.preventDefault();
    e.stopPropagation();
    const panel = panelRef.current;
    if (!panel) return;
    const rect = panel.getBoundingClientRect();
    resizeRef.current = {
      isResizing: true,
      edge,
      startX: e.clientX,
      startY: e.clientY,
      startW: rect.width,
      startH: rect.height,
      startLeft: rect.left,
      startTop: rect.top,
    };
  };

  const onHeaderMouseDown = (e) => {
    // Don't start drag when clicking buttons inside the header
    if (e.target.closest("button")) return;
    const panel = panelRef.current;
    if (!panel) return;
    const rect = panel.getBoundingClientRect();
    dragRef.current = {
      isDragging: true,
      startX: e.clientX,
      startY: e.clientY,
      startLeft: rect.left,
      startTop: rect.top,
    };
    e.preventDefault();
  };

  useEffect(() => {
    const onMouseMove = (e) => {
      if (dragRef.current.isDragging) {
        const dx = e.clientX - dragRef.current.startX;
        const dy = e.clientY - dragRef.current.startY;
        const newTop = Math.max(0, dragRef.current.startTop + dy);
        const cur = panelTargetRef.current;
        const newLeft = Math.max(
          0,
          Math.min(window.innerWidth - (cur.width ?? PANEL_WIDTH), dragRef.current.startLeft + dx),
        );
        panelTargetRef.current = { ...cur, top: newTop, left: newLeft };
        setPosition({ top: newTop, left: newLeft });
      }
      if (resizeRef.current.isResizing) {
        const { edge, startX, startY, startW, startH, startLeft, startTop } = resizeRef.current;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        let newW = startW,
          newH = startH,
          newLeft = startLeft,
          newTop = startTop;
        if (edge.includes("e")) newW = startW + dx;
        if (edge.includes("w")) {
          newW = startW - dx;
          newLeft = startLeft + (startW - Math.max(PANEL_MIN_WIDTH, newW));
        }
        if (edge.includes("s")) newH = startH + dy;
        if (edge.includes("n")) {
          newH = startH - dy;
          newTop = startTop + (startH - Math.max(PANEL_MIN_HEIGHT, newH));
        }
        newW = Math.max(PANEL_MIN_WIDTH, Math.min(newW, window.innerWidth - newLeft));
        newH = Math.max(PANEL_MIN_HEIGHT, Math.min(newH, window.innerHeight - newTop));
        panelTargetRef.current = { top: newTop, left: newLeft, width: newW, height: newH };
        setPanelWidth(newW);
        setPanelHeight(newH);
        setPosition({ top: newTop, left: newLeft });
      }
    };
    const onMouseUp = () => {
      if (dragRef.current.isDragging) homePositionRef.current = null; // drag sets a new home
      dragRef.current.isDragging = false;
      resizeRef.current.isResizing = false;
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  // Max help mode: disable all form inputs while active so the applicant types in chat instead.
  // Removes focusable descendants of a sign wrapper from the keyboard tab order.
  // Saves the original tabindex so it can be restored by restoreSignTabOrder.
  const blockSignTabOrder = (wrapper) => {
    const els = [wrapper, ...Array.from(wrapper.querySelectorAll("[tabindex], button"))];
    for (const el of els) {
      if (el.hasAttribute("data-ai-sig-tab")) continue; // already saved
      el.setAttribute("data-ai-sig-tab", el.getAttribute("tabindex") ?? "");
      el.setAttribute("tabindex", "-1");
    }
  };

  const restoreSignTabOrder = (wrapper) => {
    const els = [wrapper, ...Array.from(wrapper.querySelectorAll("[data-ai-sig-tab]"))];
    for (const el of els) {
      if (!el.hasAttribute("data-ai-sig-tab")) continue;
      const saved = el.getAttribute("data-ai-sig-tab");
      if (saved === "") el.removeAttribute("tabindex");
      else el.setAttribute("tabindex", saved);
      el.removeAttribute("data-ai-sig-tab");
    }
  };

  // In applicant mode, disable direct form editing so users go through the chat.
  // Re-enables tracked elements on each page/step change before re-scanning the new DOM.
  // Signature boxes ([data-ai-type="sign"]) use pointer-events:none since they can't use `disabled`.
  // Runs on page/step navigation (currentScreenId + formDataSignal).
  // Skipped in basic mode — the applicant fills the form themselves.
  useEffect(() => {
    if (assistantMode !== "applicant" || AI_CHAT_MODE === "basic") return;
    // Small delay so the new page's DOM is fully rendered before we query
    const apply = () => {
      // Re-enable any previously tracked elements first (they're from the old page)
      for (const el of maxHelpDisabledElsRef.current) {
        el.disabled = false;
      }
      maxHelpDisabledElsRef.current = [];
      for (const wrapper of maxHelpDisabledSignsRef.current) {
        wrapper.style.pointerEvents = "";
        wrapper.style.opacity = "";
        wrapper.style.userSelect = "";
        restoreSignTabOrder(wrapper);
      }
      maxHelpDisabledSignsRef.current = [];

      const chatPanel = panelRef.current || document.querySelector(".ai-chat-panel");

      // Disable standard form inputs.
      // Exception: Google Places autocomplete inputs (data-ai-type="places" or nested
      // inside such a wrapper) must stay enabled — the Places API requires live DOM
      // interaction and won't work on a disabled input.
      const candidates = document.querySelectorAll(
        'input:not([type="submit"]):not([type="button"]):not([type="reset"]):not([type="image"]),' + "select, textarea",
      );
      for (const el of candidates) {
        if (
          !el.disabled &&
          !chatPanel?.contains(el) &&
          el.getAttribute("data-ai-type") !== "places" &&
          !el.closest("[data-ai-type='places']")
        ) {
          el.disabled = true;
          maxHelpDisabledElsRef.current.push(el);
        }
      }

      // Block signature boxes — canvas + buttons can't use disabled, use pointer-events instead.
      // Also remove them from the tab order so Tab doesn't jump here while all other inputs are disabled.
      const signWrappers = document.querySelectorAll('[data-ai-type="sign"]');
      for (const wrapper of signWrappers) {
        if (!chatPanel?.contains(wrapper)) {
          wrapper.style.pointerEvents = "none";
          wrapper.style.opacity = "0.55";
          wrapper.style.userSelect = "none";
          blockSignTabOrder(wrapper);
          maxHelpDisabledSignsRef.current.push(wrapper);
        }
      }
    };
    const t = setTimeout(apply, 150);
    return () => clearTimeout(t);
  }, [assistantMode, currentScreenId, formDataSignal]);

  // Auto-scroll to bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
    // In guided applicant mode the applicant types all answers in the chat box, so focus it
    // after every assistant message. In basic mode the user clicks into the chat box manually
    // — never steal focus from form fields.
    if (assistantMode === "applicant" && AI_CHAT_MODE !== "basic") {
      const last = messages[messages.length - 1];
      if (last?.role === "assistant") {
        setTimeout(() => inputRef.current?.focus(), 120);
      }
    }
  }, [messages]);

  // Focus chat input when opened (not in applicant mode — user types into form fields there).
  // Dep is isOpen only — assistantMode briefly flips to "service-provider" during screen
  // transitions and must not trigger a focus steal while the new applicant screen is mounting.
  useEffect(() => {
    if (isOpen && assistantMode !== "applicant") setTimeout(() => inputRef.current?.focus(), 100);
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isLoading && isOpen && (!suppressChatFocusRef.current || userFocusedChatRef.current)) {
      inputRef.current?.focus();
    }
  }, [isLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  // Maps form language names (from detectFormLanguage) to BCP-47 codes for comparison
  // against detectedLanguage returned by the backend.
  const FORM_LANG_TO_BCP47 = {
    English: "en",
    Spanish: "es",
    French: "fr",
    Portuguese: "pt",
    Chinese: "zh",
    Arabic: "ar",
    German: "de",
    Italian: "it",
    Korean: "ko",
    Japanese: "ja",
    Vietnamese: "vi",
    Hindi: "hi",
    Russian: "ru",
    Tagalog: "tl",
    Filipino: "tl",
    Polish: "pl",
  };

  // Update the last detected language ref whenever the AI signals a language via [LANG:xx].
  // Also manages translation mode: auto-deactivate when the user returns to the base language,
  // and update the active language when they switch between non-base languages.
  const applyDetectedLanguage = (detectedLanguage) => {
    if (!detectedLanguage) return;
    lastDetectedLanguageRef.current = detectedLanguage;

    // In applicant mode the base language is the form language; in all other modes it's English.
    const formLangCode = FORM_LANG_TO_BCP47[formLanguageRef.current] || "en";

    if (detectedLanguage === formLangCode) {
      // Applicant switched back to form language — deactivate translation mode
      if (translationModeRef.current) {
        translationModeRef.current = null;
        setTranslationMode(null);
      }
    } else if (translationModeRef.current && translationModeRef.current.lang !== detectedLanguage) {
      // Translation mode active but language switched — update to the new language
      const langName = (() => {
        try {
          return new Intl.DisplayNames(["en"], { type: "language" }).of(detectedLanguage) || detectedLanguage;
        } catch {
          return detectedLanguage;
        }
      })();
      const newMode = { lang: detectedLanguage, langName };
      translationModeRef.current = newMode;
      setTranslationMode(newMode);
      tooltipCacheRef.current = {}; // invalidate cached translations for old language
    }
  };

  // Translate a widget-generated string into the most recently detected language
  const wt = (key, ...args) => {
    const lang = lastDetectedLanguageRef.current || "en";
    const val = (WIDGET_STRINGS[lang] || WIDGET_STRINGS.en)[key] ?? WIDGET_STRINGS.en[key] ?? key;
    return typeof val === "function" ? val(...args) : val;
  };

  // When the panel opens in applicant mode, reposition to the bottom-right so the
  // centered form content at the top of the page isn't covered.
  // Clamp height so the panel always fits within the visible viewport.
  useEffect(() => {
    if (!isOpen || assistantMode !== "applicant") return;
    const M = 8;
    const availH = window.innerHeight - headerBottom - M;
    const initH = Math.max(PANEL_MIN_HEIGHT, Math.min(PANEL_HEIGHT, availH));
    const availW = window.innerWidth - M * 2;
    const initW = Math.max(PANEL_MIN_WIDTH, Math.min(PANEL_WIDTH, availW));
    const initTop = window.innerHeight - initH - M;
    const initLeft = Math.max(M, window.innerWidth - initW - M);
    panelTargetRef.current = { top: initTop, left: initLeft, width: initW, height: initH };
    setPanelWidth(initW);
    setPanelHeight(initH);
    setPosition({ top: initTop, left: initLeft });
  }, [isOpen, assistantMode]); // eslint-disable-line react-hooks/exhaustive-deps

  // Close the widget when genuinely navigating back to admin pages.
  //
  // Page navigation causes assistantMode to cycle applicant→service-provider→applicant
  // within a single render cycle. A 150 ms debounce distinguishes this from a genuine
  // exit to admin pages (where the mode stays service-provider permanently).
  const WIDGET_CLOSED_KEY = "ai-widget-user-closed";
  const openedByApplicantRef = useRef(false);
  const modeExitTimerRef = useRef(null);
  useEffect(() => {
    if (assistantMode === "applicant") {
      // Cancel any pending "genuine exit" timer — this was just page navigation.
      clearTimeout(modeExitTimerRef.current);
      modeExitTimerRef.current = null;
      openedByApplicantRef.current = true;
    } else if (openedByApplicantRef.current) {
      // Debounce: give React one render cycle to flip back to "applicant" (page nav).
      // If it does, clearTimeout above cancels this and nothing happens.
      // If it doesn't (genuine admin navigation), close the panel and reset state.
      modeExitTimerRef.current = setTimeout(() => {
        openedByApplicantRef.current = false;
        setIsOpen(false);
        preFillShownRef.current.clear();
        sessionStorage.removeItem(WIDGET_CLOSED_KEY);
      }, 150);
    }
  }, [assistantMode]); // eslint-disable-line react-hooks/exhaustive-deps

  // Nudge the FAB down when its home position overlaps a clickable element.
  // Always checks against the home rect (computed from constants) so nudging
  // the button doesn't create a feedback loop.
  useEffect(() => {
    if (isOpen) {
      setFabNudged(false);
      return;
    }

    const FAB_W = 70,
      FAB_H = 70,
      FAB_RIGHT_PX = 64,
      FAB_BOTTOM_PX = 72;

    // Find the real scrolling container — the layout scrolls inside <main>, not the document.
    const findScroller = () => {
      const main = document.querySelector("main");
      if (main && main.scrollHeight > main.clientHeight + 4) return main;
      const de = document.scrollingElement || document.documentElement;
      if (de.scrollHeight > de.clientHeight + 4) return de;
      return null; // page has no scrollable content
    };

    const checkOverlap = () => {
      const scroller = findScroller();

      // Only nudge when actually at the bottom — if there's room to scroll,
      // the user can simply scroll to clear the FAB.
      if (scroller) {
        const distFromBottom = scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight;
        if (distFromBottom > 10) {
          setFabNudged(false);
          return;
        }
      }

      // Sample several points within the FAB's home area.
      // Temporarily disable pointer-events on the FAB so elementFromPoint sees
      // through it — this gives us exactly what would receive a click if the FAB
      // weren't there, respecting z-index and any overlapping layers.
      const homeRight = window.innerWidth - FAB_RIGHT_PX;
      const homeLeft = homeRight - FAB_W;
      const homeBottom = window.innerHeight - FAB_BOTTOM_PX;
      const homeTop = homeBottom - FAB_H;
      const cx = (homeLeft + homeRight) / 2;
      const cy = (homeTop + homeBottom) / 2;
      const samplePoints = [
        [cx, cy],
        [cx - 18, cy - 18],
        [cx + 18, cy - 18],
        [cx - 18, cy + 18],
        [cx + 18, cy + 18],
      ];

      const fab = fabRef.current;
      if (fab) fab.style.pointerEvents = "none";

      const INTERACTIVE = 'button, a[href], input:not([type="hidden"]), select, textarea, [role="button"]';
      let overlaps = false;
      outer: for (const [px, py] of samplePoints) {
        let el = document.elementFromPoint(px, py);
        while (el && el !== document.body) {
          if (el.matches(INTERACTIVE)) {
            overlaps = true;
            break outer;
          }
          el = el.parentElement;
        }
      }

      if (fab) fab.style.pointerEvents = "";
      setFabNudged(overlaps);
    };

    // Use capture:true so scroll events from any container (e.g. <main>) are caught.
    document.addEventListener("scroll", checkOverlap, { passive: true, capture: true });
    window.addEventListener("resize", checkOverlap, { passive: true });
    checkOverlap();
    return () => {
      document.removeEventListener("scroll", checkOverlap, { capture: true });
      window.removeEventListener("resize", checkOverlap);
      setFabNudged(false);
    };
  }, [isOpen, currentScreenId]); // reset on screen navigation too

  // Cycle the language banner text every 3.5 s with a fade-out/fade-in transition.
  useEffect(() => {
    const id = setInterval(() => {
      setBannerFading(true);
      setTimeout(() => {
        setBannerIdx((i) => (i + 1) % LANGUAGES.length);
        setBannerFading(false);
      }, 320);
    }, 3500);
    return () => clearInterval(id);
  }, [assistantMode]);

  // Detect the natural language of the form from its field labels and descriptions.
  // Returns a language name (e.g. "Spanish") for use in the system prompt.
  const detectFormLanguage = (ctx) => {
    const fields = ctx?.currentState?.fields || [];
    const text = [
      ctx?.screenName || "",
      ctx?.description || "",
      ...fields.map((f) => `${f.label || ""} ${f.description || ""} ${f.placeholder || ""}`),
    ].join(" ");
    const len = text.replace(/\s/g, "").length || 1;

    // Non-Latin script detection by Unicode range
    if ((text.match(/[\u0600-\u06FF]/g) || []).length / len > 0.12) return "Arabic";
    if ((text.match(/[\u4E00-\u9FFF]/g) || []).length / len > 0.12) return "Chinese";
    if ((text.match(/[\u3040-\u30FF]/g) || []).length / len > 0.12) return "Japanese";
    if ((text.match(/[\uAC00-\uD7AF]/g) || []).length / len > 0.12) return "Korean";
    if ((text.match(/[\u0400-\u04FF]/g) || []).length / len > 0.12) return "Russian";
    if ((text.match(/[\u0590-\u05FF]/g) || []).length / len > 0.12) return "Hebrew";
    if ((text.match(/[\u0E00-\u0E7F]/g) || []).length / len > 0.12) return "Thai";
    if ((text.match(/[\u0900-\u097F]/g) || []).length / len > 0.12) return "Hindi";

    // Latin-script language detection via common field-label words
    const tl = text.toLowerCase();
    if (/\b(nombre|empresa|dirección|ciudad|país|fecha|teléfono|correo|apellido)\b/.test(tl)) return "Spanish";
    if (/\b(nom|prénom|adresse|entreprise|ville|pays|téléphone|courriel|date)\b/.test(tl)) return "French";
    if (/\b(nome|empresa|endereço|cidade|estado|país|telefone|cpf|cnpj)\b/.test(tl)) return "Portuguese";
    if (/\b(vorname|nachname|unternehmen|anschrift|straße|stadt|land|telefon|datum)\b/.test(tl)) return "German";
    if (/\b(nome|azienda|indirizzo|città|paese|telefono|codice fiscale|data)\b/.test(tl)) return "Italian";

    return "English";
  };

  // Show greeting only on very first open (empty transcript).
  // Guard: after the initial greeting has been shown once, subsequent messages.length===0
  // events are caused by endpoint-change navigation — the screen-change effect handles those.
  useEffect(() => {
    if (!isOpen || messages.length !== 0) return;
    if (initialGreetingShownRef.current) return;
    const ctx = getScreenContext();
    const screenName = ctx?.screenName || "this screen";

    if (assistantMode === "applicant") {
      // Detect form language on first open and store it for all subsequent AI calls
      const detectedLang = detectFormLanguage(ctx);
      formLanguageRef.current = detectedLang;
      if (detectedLang !== "English") lastDetectedLanguageRef.current = detectedLang.toLowerCase().slice(0, 2);

      if (AI_CHAT_MODE === "basic") {
        // Basic mode: passive Q&A only — just greet and offer to answer questions.
        const greetings = {
          Spanish:
            "¡Hola! Soy tu **asistente de solicitud**. Tengo contexto completo sobre esta solicitud y puedo responder cualquier pregunta.\n\nPregúntame lo que necesites sobre el formulario, los requisitos o el proceso.",
          French:
            "Bonjour\u00a0! Je suis votre **assistant de candidature**. J'ai le contexte complet de cette candidature et je peux répondre à toutes vos questions.\n\nN'hésitez pas à me poser des questions sur le formulaire, les exigences ou le processus.",
          Portuguese:
            "Olá! Sou o seu **assistente de candidatura**. Tenho contexto completo sobre esta candidatura e posso responder a qualquer pergunta.\n\nFique à vontade para me perguntar qualquer coisa sobre o formulário, os requisitos ou o processo.",
          German:
            "Hallo! Ich bin Ihr **Bewerbungsassistent**. Ich habe vollständigen Kontext zu dieser Bewerbung und beantworte gerne alle Ihre Fragen.\n\nFragen Sie mich gerne alles zum Formular, den Anforderungen oder dem Ablauf.",
          Italian:
            "Ciao! Sono il tuo **assistente per la domanda**. Ho il contesto completo di questa domanda e posso rispondere a qualsiasi tua domanda.\n\nChiedimi pure qualsiasi cosa sul modulo, i requisiti o il processo.",
          Arabic:
            "مرحباً! أنا **مساعد الطلب** الخاص بك. لدي سياق كامل حول هذا الطلب ويمكنني الإجابة على أي أسئلة لديك.\n\nلا تتردد في سؤالي عن أي شيء يتعلق بالنموذج أو المتطلبات أو العملية.",
          Chinese:
            "你好！我是您的**申请助手**。我对本申请有完整的上下文，可以回答您的任何问题。\n\n欢迎随时询问有关表格、要求或流程的任何问题。",
          Japanese:
            "こんにちは！私はあなたの**申請アシスタント**です。この申請の全情報を把握しており、どんな質問にもお答えします。\n\nフォーム、要件、または手続きについて何でもお気軽にご質問ください。",
          Korean:
            "안녕하세요! 저는 귀하의 **신청 도우미**입니다. 이 신청에 대한 전체 맥락을 파악하고 있으며 모든 질문에 답변드릴 수 있습니다.\n\n양식, 요건 또는 절차에 대해 무엇이든 자유롭게 질문해 주세요.",
          Russian:
            "Привет! Я ваш **помощник по заявке**. У меня есть полный контекст этой заявки, и я могу ответить на любые ваши вопросы.\n\nНе стесняйтесь спрашивать меня о форме, требованиях или процессе.",
        };
        const content =
          ctx?.greeting ||
          greetings[detectedLang] ||
          `Hi! I'm your **application assistant** — I'm here to help you complete your application quickly and accurately.\n\nHere's what I can do:\n- **Answer questions** about any field or requirement\n- **Explain what's needed** for each section\n- **Translate any field or instruction** into your preferred language\n- **Communicate with you in any language** — just start typing in yours\n\nFeel free to ask me anything!`;
        setIntroButtonsDismissed(true);
        addMessage({ role: "assistant", content });
      } else {
        const content =
          ctx?.greeting ||
          `Hi! I'm your **application assistant** — I'm here to guide you through every step of your application.\n\nHere's what I can do:\n- **Walk you through each field** one by one\n- **Fill in your answers** automatically as you describe them\n- **Answer any questions** about requirements or the process\n- **Translate any field or instruction** into your preferred language\n- **Communicate with you in any language** — just start typing in yours\n\nJust type your responses here and I'll take care of the rest!`;
        setIntroButtonsDismissed(true);
        addMessage({ role: "assistant", content });

        // Trigger PAGE_LOAD guidance for the very first screen. Subsequent screen changes
        // are handled by the currentScreenId effect (isScreenChange branch). This covers
        // the case where the widget opens on the initial page before any navigation occurs.
        // Retry with backoff in case the page context hasn't registered yet.
        clearTimeout(autoGuideTimerRef.current);
        let firstPageAttempt = 0;
        const tryFirstPageLoad = () => {
          const firstCtx = getScreenContext();
          const fields = firstCtx?.currentState?.fields;
          const loading = isLoadingRef.current;
          if (!fields?.length || loading) {
            // Fields not ready yet, or AI is still processing the greeting — retry.
            if (firstPageAttempt < 10) {
              firstPageAttempt++;
              autoGuideTimerRef.current = setTimeout(tryFirstPageLoad, 600);
            }
            return;
          }
          // Focus the first empty field, then send [PAGE_SUMMARY] to kick off AI guidance.
          // (The focusin timer is suppressed in max-help mode so we can't rely on [FIELD_FOCUS].)
          isInitialScreenDodgeRef.current = true;
          const focused = focusFirstEmptyField(firstCtx.currentState.fields, { requireRequired: false });
          if (!focused) notifySignatureIfPending(firstCtx.currentState.fields);

          // Mirror the screen-change handler's sendFirstFieldGuidance so the AI activates on
          // the very first screen, regardless of help-level mode.
          setTimeout(() => {
            const latestCtx = getScreenContext();
            const nonSig = latestCtx?.currentState?.fields?.filter((ff) => !ff.isSignature) ?? [];
            const latestFilled = nonSig.filter((ff) => ff.filled).length;
            const latestTotal = nonSig.length;
            if (!latestTotal) return;
            const remaining = latestTotal - latestFilled;
            const stepInfo =
              latestCtx.currentState?.currentStep != null
                ? ` Step ${latestCtx.currentState.currentStep + 1} of ${latestCtx.currentState.totalSteps}.`
                : "";
            const pageHelpContexts = (latestCtx?.currentState?.fields || [])
              .filter((ff) => ff.helpContext)
              .map((ff) => `"${ff.label}": ${ff.helpContext}`)
              .join(" | ");
            const pageHelpNote = pageHelpContexts
              ? ` PAGE FIELD HELP CONTEXTS (use proactively only for the specific focused field, but available for any user question about any field on this page): ${pageHelpContexts}.`
              : "";
            autoGuideRef.current?.(
              `[PAGE_SUMMARY] The applicant has arrived on a new step.${stepInfo}` +
                ` ${latestFilled} of ${latestTotal} field(s) are already filled in.` +
                ` ${remaining > 0 ? `${remaining} field(s) still need input.` : "All fields are filled."}` +
                pageHelpNote,
            );
          }, 50);
        };
        autoGuideTimerRef.current = setTimeout(tryFirstPageLoad, 800);
      }
    } else {
      const content =
        ctx?.greeting ||
        `Hi! I'm your assistant. I can see you're working on **${screenName}**.\n\nWhat would you like to do?`;
      addMessage({ role: "assistant", content });
    }
    initialGreetingShownRef.current = true;
  }, [isOpen, messages.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // When the active screen changes:
  //   1. Append a new greeting so the user sees the current screen's capabilities.
  //   2. Run any pending cross-page analysis (e.g. branding fetch → create page).
  useEffect(() => {
    if (!currentScreenId) return;

    const isScreenChange = prevScreenIdRef.current !== null && prevScreenIdRef.current !== currentScreenId;
    prevScreenIdRef.current = currentScreenId;

    // Pending analysis takes priority — it adds its own contextual AI message for the new screen.
    if (pendingAnalysisRef.current) {
      const pending = pendingAnalysisRef.current;
      pendingAnalysisRef.current = null;

      const runAnalysis = async () => {
        const ctx = getScreenContext();
        const chatEndpoint = ctx?.aiEndpoint || `${SERVER_URL}/api/ai/branding-chat`;
        const { brandingData, screenshotUrl, url } = pending;
        const visionContent = [
          ...(screenshotUrl ? [{ type: "image_url", image_url: { url: screenshotUrl } }] : []),
          {
            type: "text",
            text: `Here is the full-page screenshot and extracted branding data for ${url}:\n\n${JSON.stringify(brandingData, null, 2)}\n\nThe branding has been automatically applied to the create form. Please analyze the site's visual design — describe the color scheme, typography choices, and overall style — then share specific recommendations to help the user complete and refine the branding configuration.`,
          },
        ];
        setIsLoading(true);
        try {
          const res = await fetch(chatEndpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              messages: [{ role: "user", content: visionContent }],
              chatMode: AI_CHAT_MODE,
              context: {
                screenId: ctx?.screenId,
                screenName: ctx?.screenName,
                description: ctx?.description,
                currentState: ctx?.currentState,
                logos: ctx?.logos,
                colorPalette: ctx?.colorPalette || undefined,
                customPrompt: aiCustomPrompt || undefined,
              },
            }),
          });
          const data = await res.json();
          console.log("data", data);
          if (!data.success) throw new Error(data.message || "AI request failed");
          if (data.type === "tool_call") {
            await applyToolCall(data.tool, data.args, [{ role: "user", content: visionContent }]);
          } else {
            addMessage({ role: "assistant", content: data.content });
            if (isVoiceModeRef.current) speak(data.content);
          }
        } catch {
          addMessage({ role: "assistant", content: wt("brandingApplied", url) });
        } finally {
          setIsLoading(false);
        }
      };
      runAnalysis();
      return; // analysis message serves as the screen-change update
    }

    // On screen change (not first mount), append the new screen's greeting to the transcript.
    if (isScreenChange) {
      const ctx = getScreenContext();
      const screenName = ctx?.screenName || currentScreenId;

      if (assistantMode === "applicant" && AI_CHAT_MODE !== "basic") {
        // Applicant mode: debounce both the "Now on:" marker and autoGuide so that rapid
        // screen transitions (e.g. email-verified → idmission-qr → ApplicationForm) only
        // produce a single announcement for the final destination.
        const task = pendingFollowUpRef.current;
        pendingFollowUpRef.current = null;
        if (navTimeoutRef.current) {
          clearTimeout(navTimeoutRef.current);
          navTimeoutRef.current = null;
        }
        clearTimeout(autoGuideTimerRef.current);

        // IMMEDIATE: Reset panel position to the right of the form container so it doesn't
        // overlap the display text or first field while the 1000ms debounce settles.
        homePositionRef.current = null;
        {
          const _M = 8;
          const _h = Math.max(PANEL_MIN_HEIGHT, Math.min(PANEL_HEIGHT, window.innerHeight - headerBottom - _M));
          const _w = Math.max(PANEL_MIN_WIDTH, Math.min(PANEL_WIDTH, window.innerWidth - _M * 2));
          const _t = window.innerHeight - _h - _M;
          let _l = Math.max(_M, window.innerWidth - _w - _M);
          const nowCtx = getScreenContext();
          if (nowCtx?.formRef?.current) {
            const cr = nowCtx.formRef.current.getBoundingClientRect();
            const rightL = cr.right + _M;
            if (rightL + PANEL_MIN_WIDTH <= window.innerWidth) _l = rightL;
          }
          panelTargetRef.current = { top: _t, left: _l, width: _w, height: _h };
          setPanelWidth(_w);
          setPanelHeight(_h);
          setPosition({ top: _t, left: _l });
        }

        autoGuideTimerRef.current = setTimeout(() => {
          // Re-read context at fire time — this is the real current screen after navigation settles.
          const finalCtx = getScreenContext();
          // If no context is registered yet, the destination page hasn't mounted/registered yet.
          // Do nothing — the screen-change effect will fire again when it does.
          if (!finalCtx) return;
          // If fields haven't been discovered yet (form still loading, branding check pending,
          // or stepsComps not yet built), retry in 800ms. Use !fields?.length so we catch
          // both undefined (discoverFormFields returned empty) and [] — same logic as tryFirstPageLoad.
          // This is purely value-based: field.filled = el.value.trim() !== "" in discoverFormFields,
          // so autofill possibility never factors in — only what's actually in the DOM right now.
          // Sends [FIELD_FOCUS] for the first empty field immediately after "Now on:" —
          // bypasses the 1000ms focusin pause timer which the user may tab through before it fires.
          // Sends an instant page overview after "Now on:" regardless of help-delay settings.
          // The overview fires for every page — pre-filled or not — so the applicant always
          // gets a quick summary of what this step contains before they start filling fields.
          const sendFirstFieldGuidance = (fields, _ctx) => {
            const nonSigFields = fields?.filter((ff) => !ff.isSignature) ?? [];
            if (!nonSigFields.length) return;
            // Settle-detection poller: instead of a fixed delay, wait until field
            // values stop changing for SETTLE_QUIET_MS. Any change resets the quiet
            // timer, so async pre-fills (DB loads, IDMission API, AI analysis) are
            // captured no matter how long they take. Hard floor + cap bound the wait.
            const SETTLE_FLOOR_MS = 300; // never snapshot before this
            const SETTLE_QUIET_MS = 400; // snapshot after this long with no changes
            const SETTLE_CAP_MS = 2500; // always snapshot by this time
            const SETTLE_POLL_MS = 150; // poll interval

            const settleScreenId = getScreenContext()?.screenId;
            const getValuesKey = () =>
              (getScreenContext()?.currentState?.fields ?? [])
                .filter((ff) => !ff.isSignature)
                .map((ff) => `${ff.id}:${ff.filled ? "1" : "0"}`)
                .join(",");

            let settleSettled = false;
            const settleStart = Date.now();
            let lastValuesKey = getValuesKey();
            let quietSince = settleStart;

            const fireSnapshot = () => {
              if (settleSettled) return;
              settleSettled = true;
              const latestCtx = getScreenContext();
              const latestNonSig = latestCtx?.currentState?.fields?.filter((ff) => !ff.isSignature) ?? [];
              const latestFilled = latestNonSig.filter((ff) => ff.filled).length;
              const latestTotal = latestNonSig.length;
              if (!latestTotal) return;
              const stepInfo =
                latestCtx.currentState?.currentStep != null
                  ? ` Step ${latestCtx.currentState.currentStep + 1} of ${latestCtx.currentState.totalSteps}.`
                  : "";
              const remaining = latestTotal - latestFilled;

              // Collect all AI help contexts on this page so the assistant can
              // answer follow-up questions about any field, not just the focused one.
              const pageHelpContexts = (latestCtx?.currentState?.fields || [])
                .filter((ff) => ff.helpContext)
                .map((ff) => `"${ff.label}": ${ff.helpContext}`)
                .join(" | ");
              const pageHelpNote = pageHelpContexts
                ? ` PAGE FIELD HELP CONTEXTS (use proactively only for the specific focused field, but available for any user question about any field on this page): ${pageHelpContexts}.`
                : "";

              // Build CONFIRMED THIS SESSION block.
              // Synthetic keys (starting with "_", e.g. "_otp_email") are resolved to
              // actual field IDs by matching their values against the current page's fields.
              // This ensures the AI can do simple key-based lookups instead of needing to
              // parse and compare values itself — which it does unreliably in practice.
              const enrichedConfirmed = { ...confirmedValuesRef.current };
              const syntheticEntries = Object.entries(confirmedValuesRef.current).filter(([k]) => k.startsWith("_"));
              if (syntheticEntries.length > 0) {
                for (const field of latestNonSig) {
                  if (!field.value || field.isSignature || enrichedConfirmed[field.id] !== undefined) continue;
                  const match = syntheticEntries.find(
                    ([, v]) =>
                      v && typeof v === "string" && v.trim().toLowerCase() === String(field.value).trim().toLowerCase(),
                  );
                  if (match) enrichedConfirmed[field.id] = match[1];
                }
              }
              const cvEntries = Object.entries(enrichedConfirmed);
              const cvBlock =
                cvEntries.length > 0
                  ? ` [CONFIRMED THIS SESSION: ${cvEntries.map(([k, v]) => `${k}="${v}"`).join(", ")}]`
                  : "";
              // Snapshot which fields are empty at settle time. Fields filled after
              // this point (e.g. IDMission mid-session fills) land in EMPTY_AT_SCAN
              // and are collected in Step 2; fields filled before settle time are
              // excluded and appear in the Step 1 pre-filled confirmation table.
              const emptyAtScan = latestNonSig.filter((ff) => !ff.filled && !ff.isSignature).map((ff) => ff.id);
              const emptyAtScanBlock = emptyAtScan.length > 0 ? ` [EMPTY_AT_SCAN: ${emptyAtScan.join(",")}]` : "";
              autoGuideRef.current?.(
                `[PAGE_SUMMARY] The applicant has arrived on a new step.${stepInfo}` +
                  ` ${latestFilled} of ${latestTotal} field(s) are already filled in.` +
                  ` ${remaining > 0 ? `${remaining} field(s) still need input.` : "All fields are filled."}` +
                  emptyAtScanBlock +
                  cvBlock +
                  pageHelpNote,
              );
            };

            const pollSettle = () => {
              if (settleSettled) return;
              const now = Date.now();
              // Stop if the user navigated away before we settled
              if (getScreenContext()?.screenId !== settleScreenId) {
                settleSettled = true;
                return;
              }
              // Hard cap
              if (now - settleStart >= SETTLE_CAP_MS) {
                fireSnapshot();
                return;
              }
              // Detect changes and reset quiet window
              const currentKey = getValuesKey();
              if (currentKey !== lastValuesKey) {
                lastValuesKey = currentKey;
                quietSince = now;
              }
              // Hold snapshot while any field is still being populated by an async AI process
              if (document.querySelector('[data-ai-loading="true"]')) {
                quietSince = now;
              }
              // Fire once floor has passed and quiet window has held
              if (now - settleStart >= SETTLE_FLOOR_MS && now - quietSince >= SETTLE_QUIET_MS) {
                fireSnapshot();
                return;
              }
              setTimeout(pollSettle, SETTLE_POLL_MS);
            };

            setTimeout(pollSettle, SETTLE_POLL_MS);
          };

          if (!finalCtx.currentState?.fields?.length) {
            // Distinguish: fields=[] (page has no fields by design, e.g. QR scan) vs
            // fields=undefined (form still loading). If explicitly empty, add a short guard
            // delay before announcing — some screens (e.g. idmission-qr) redirect away within
            // a second or two, and we don't want to fire guidance for a transient page.
            if (Array.isArray(finalCtx.currentState?.fields)) {
              const guardedScreenId = finalCtx.screenId;
              autoGuideTimerRef.current = setTimeout(() => {
                const reCheckCtx = getScreenContext();
                // If the screen changed since we first saw it, skip — the new screen will handle it.
                if (!reCheckCtx || reCheckCtx.screenId !== guardedScreenId) return;
                const finalName = reCheckCtx.screenName || reCheckCtx.screenId || "Application Form";
                announceScreen(finalName);
                lastAutoGuidedRef.current = { screenId: guardedScreenId, at: Date.now() };
                autoGuideRef.current?.(
                  `[PAGE_SUMMARY] The applicant has arrived on: ${finalName}. This page has no form fields — guide them through whatever action this step requires.`,
                );
              }, 600);
              return;
            }
            // fields=undefined — form still loading. Retry in 800ms.
            autoGuideTimerRef.current = setTimeout(() => {
              const retryCtx = getScreenContext();
              const retryName = retryCtx?.screenName || retryCtx?.screenId || "Application Form";
              if (!retryCtx) return;
              if (!retryCtx.currentState?.fields?.length) {
                // Still no fields after retry — treat as a no-field page.
                announceScreen(retryName);
                lastAutoGuidedRef.current = { screenId: retryCtx.screenId, at: Date.now() };
                autoGuideRef.current?.(
                  `[PAGE_SUMMARY] The applicant has arrived on: ${retryName}. This page has no form fields — guide them through whatever action this step requires.`,
                );
                return;
              }
              isInitialScreenDodgeRef.current = true;
              const retryFocused = focusFirstEmptyField(retryCtx.currentState.fields, { requireRequired: false });
              if (!retryFocused) notifySignatureIfPending(retryCtx.currentState.fields);
              announceScreen(retryName);
              lastAutoGuidedRef.current = { screenId: retryCtx.screenId, at: Date.now() };
              sendFirstFieldGuidance(retryCtx.currentState.fields, retryCtx);
            }, 800);
            return;
          }
          const finalName = finalCtx.screenName || finalCtx.screenId || "Application Form";
          // Guard: if we already fired autoGuide for this screen within the last 3 seconds,
          // skip to prevent double-guidance when goToNextStep or other tools re-trigger the handler.
          // 3 seconds is long enough to block a race but short enough to allow the user to
          // navigate away and return to the same screen normally.
          const { screenId: lastSid, at: lastAt } = lastAutoGuidedRef.current;
          if (lastSid === finalCtx.screenId && Date.now() - lastAt < 3000) return;
          isInitialScreenDodgeRef.current = true;
          const finalFocused = focusFirstEmptyField(finalCtx.currentState.fields, { requireRequired: false });
          if (!finalFocused) notifySignatureIfPending(finalCtx.currentState.fields);
          announceScreen(finalName);
          lastAutoGuidedRef.current = { screenId: finalCtx.screenId, at: Date.now() };
          sendFirstFieldGuidance(finalCtx.currentState.fields, finalCtx);
          if (task && sendMessageRef.current) {
            sendMessageRef.current(task);
          }
        }, 1000);
      } else {
        // Basic applicant mode: only post a silent divider — no proactive greeting.
        // Service-provider mode: post the screen name + greeting as before.
        if (assistantMode === "applicant" && AI_CHAT_MODE === "basic") {
          // Guard: some screens (e.g. idmission-qr) are transient — they redirect away
          // within a second or two. Delay the divider so we don't announce a screen the
          // user never actually reaches.
          const guardedScreenId = ctx?.screenId || currentScreenId;
          clearTimeout(autoGuideTimerRef.current);
          autoGuideTimerRef.current = setTimeout(() => {
            const reCheckCtx = getScreenContext();
            if (!reCheckCtx || reCheckCtx.screenId !== guardedScreenId) return;
            announceScreen(screenName);
          }, 600);
        } else {
          const greeting = ctx?.greeting || `I'm now on **${screenName}**. What would you like to do?`;
          addMessage({ role: "assistant", content: greeting });
        }
        // If we arrived here via an AI navigateToPage tool call, auto-send the follow-up task.
        if (pendingFollowUpRef.current) {
          const task = pendingFollowUpRef.current;
          pendingFollowUpRef.current = null;
          if (navTimeoutRef.current) {
            clearTimeout(navTimeoutRef.current);
            navTimeoutRef.current = null;
          }
          setTimeout(() => {
            if (sendMessageRef.current) sendMessageRef.current(task);
          }, 600);
        }
      }
    }
  }, [currentScreenId]);

  // When form data loads (or fails) after selectFormForEditing, auto-continue the conversation
  useEffect(() => {
    if (!pendingFormContinuationRef.current) return;
    const { toolArgs, history } = pendingFormContinuationRef.current;
    pendingFormContinuationRef.current = null;

    const ctx = getScreenContext();

    const chatEndpoint = ctx?.aiEndpoint || `${SERVER_URL}/api/ai/branding-chat`;

    // Build the function result — either success or a descriptive error
    let toolResult;
    if (ctx?.currentState?.detailedForm) {
      toolResult = "Form details loaded. The complete section and field structure is now available in context.";
    } else {
      const forms = ctx?.currentState?.forms || [];
      const formList = forms
        .map(
          (f) =>
            `"${f.name}"${f.headerText && f.headerText !== f.name ? ` (displayed as "${f.headerText}")` : ""} [${f._id}]`,
        )
        .join(", ");
      toolResult = `Error: Form with ID "${toolArgs.formId}" was not found — it may have been deleted or renamed. Available forms: ${formList || "none"}. Please use a valid form ID from this list and retry.`;
    }

    const continuationHistory = [
      ...history,
      {
        role: "assistant",
        content: null,
        function_call: { name: "selectFormForEditing", arguments: JSON.stringify(toolArgs) },
      },
      { role: "function", name: "selectFormForEditing", content: toolResult },
    ];

    const runContinuation = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(chatEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            messages: continuationHistory,
            chatMode: AI_CHAT_MODE,
            context: {
              screenId: ctx.screenId,
              screenName: ctx.screenName,
              description: ctx.description,
              currentState: ctx.currentState,
              logos: ctx.logos,
              colorPalette: ctx?.colorPalette || undefined,
              customPrompt: aiCustomPrompt || undefined,
            },
          }),
        });
        const data = await res.json();
        console.log("data", data);
        if (!data.success) throw new Error(data.message || "AI request failed");
        if (data.type === "tool_call") {
          await applyToolCall(data.tool, data.args, continuationHistory);
        } else {
          addMessage({ role: "assistant", content: data.content });
          if (isVoiceModeRef.current) speak(data.content);
        }
      } catch (err) {
        const detail = err?.message || "";
        addMessage({
          role: "assistant",
          content: `${wt("formNotLoaded")}${detail ? `: ${detail}` : ""}. ${wt("tryAgain")}`,
        });
      } finally {
        setIsLoading(false);
      }
    };

    runContinuation();
  }, [formDataSignal]); // eslint-disable-line react-hooks/exhaustive-deps

  // ---------- speech recognition — walkie-talkie PTT model ----------

  // Core: actually begin capturing speech. Sends transcript via sendMessage on release.
  // Stable — reads only refs so it's safe to call from onended handlers.
  const beginListening = useCallback(() => {
    if (!isVoiceModeRef.current) return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = "en-US";
    rec.onresult = (e) => {
      const transcript = e.results[0][0].transcript.trim();
      setIsListening(false);
      if (transcript && sendMessageRef.current) sendMessageRef.current(transcript);
    };
    rec.onerror = () => setIsListening(false);
    rec.onend = () => setIsListening(false);
    recognitionRef.current = rec;
    try {
      rec.start();
      setIsListening(true);
    } catch {}
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep a ref so speak()'s onended handler can call it without stale closures
  const beginListeningRef = useRef(beginListening);
  beginListeningRef.current = beginListening;

  // User holds mic button or spacebar: if bot is still speaking, queue for when it finishes.
  const startPushToTalk = useCallback(() => {
    if (!isVoiceModeRef.current) return;
    if (isSpeakingRef.current) {
      pendingListenRef.current = true; // beginListening() will fire from speak()'s onended
      return;
    }
    beginListeningRef.current();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // User releases: stop the mic. The recognition onresult handler sends whatever was captured.
  const stopListening = useCallback(() => {
    pendingListenRef.current = false;
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const toggleVoiceMode = () => {
    const next = !isVoiceMode;
    isVoiceModeRef.current = next;
    setIsVoiceMode(next);
    if (!next) {
      stopListening();
      stopSpeaking();
      pendingListenRef.current = false;
    }
  };

  // ---------- text-to-speech ----------

  const stopSpeaking = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  };

  const speakFallback = (plain) => {
    if (!window.speechSynthesis) {
      onSpeakEndRef.current?.();
      onSpeakEndRef.current = null;
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(plain);
    utterance.rate = 1.05;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      justFinishedSpeakingRef.current = true;
      setIsSpeaking(false);
      onSpeakEndRef.current?.();
      onSpeakEndRef.current = null;
      if (pendingListenRef.current) {
        pendingListenRef.current = false;
        beginListeningRef.current();
      }
    };
    window.speechSynthesis.speak(utterance);
  };

  const speak = async (text) => {
    stopSpeaking();
    const plain = text
      .replace(/\*\*(.+?)\*\*/g, "$1")
      .replace(/\*(.+?)\*/g, "$1")
      .replace(/#+\s/g, "")
      .replace(/`(.+?)`/g, "$1")
      .trim();

    // Store for echo rejection
    lastAIPlainTextRef.current = plain;

    const ttsEndpoint =
      assistantMode === "applicant" ? `${SERVER_URL}/api/ai/applicant-tts` : `${SERVER_URL}/api/ai/tts`;
    try {
      const res = await fetch(ttsEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ text: plain, voice }),
      });
      if (!res.ok) throw new Error("TTS unavailable");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onplay = () => setIsSpeaking(true);
      audio.onended = () => {
        justFinishedSpeakingRef.current = true;
        setIsSpeaking(false);
        URL.revokeObjectURL(url);
        audioRef.current = null;
        onSpeakEndRef.current?.();
        onSpeakEndRef.current = null;
        if (pendingListenRef.current) {
          pendingListenRef.current = false;
          beginListeningRef.current();
        }
      };
      audio.onerror = () => {
        justFinishedSpeakingRef.current = true;
        setIsSpeaking(false);
        URL.revokeObjectURL(url);
        audioRef.current = null;
        onSpeakEndRef.current?.();
        onSpeakEndRef.current = null;
        if (pendingListenRef.current) {
          pendingListenRef.current = false;
          beginListeningRef.current();
        }
      };
      await audio.play();
    } catch {
      speakFallback(plain);
    }
  };

  // ---------- AI messaging ----------

  // After a save tool completes, send the function result back to the AI so it can
  // chain a follow-up action (e.g. navigation) from the same user request.
  const continueAfterToolCall = async (toolName, toolArgs, resultSummary, currentHistory, chatEndpoint, ctx) => {
    const toolResultHistory = [
      ...currentHistory,
      { role: "assistant", content: null, function_call: { name: toolName, arguments: JSON.stringify(toolArgs) } },
      { role: "function", name: toolName, content: resultSummary },
    ];
    try {
      const res = await fetch(chatEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          messages: toolResultHistory,
          chatMode: AI_CHAT_MODE,
          context: {
            screenId: ctx?.screenId,
            screenName: ctx?.screenName,
            description: ctx?.description,
            currentState: ctx?.currentState,
            logos: ctx?.logos,
            colorPalette: ctx?.colorPalette || undefined,
            forms: ctx?.forms || undefined,
            brandingId: ctx?.brandingId || undefined,
            maxHelpMode: assistantMode === "applicant",
          },
        }),
      });
      const data = await res.json();
      console.log("data", data);
      if (!data.success) throw new Error(data.message || "AI request failed");
      applyDetectedLanguage(data.detectedLanguage);
      if (data.type === "tool_call") {
        // Guard: if the screen changed since the AI was sent this context, discard the tool call.
        // This prevents stale responses (e.g. goToNextStep after OTP verification) from acting
        // on the wrong page after navigation has already occurred.
        const postToolCtx = getScreenContext();
        if (postToolCtx?.screenId !== ctx?.screenId) return;
        await applyToolCall(data.tool, data.args, toolResultHistory);
      } else {
        addMessage({ role: "assistant", content: data.content || toolArgs.explanation });
        if (isVoiceModeRef.current) speak(data.content || toolArgs.explanation);
        // Dodge toward the next unfilled field so the panel doesn't cover the field the AI is about to address.
        if (assistantMode === "applicant" && ctx?.currentState?.fields) {
          const nextField = ctx.currentState.fields.find((f) => !f.filled && !f.isSignature);
          if (nextField) {
            const nextEl =
              document.getElementById(nextField.id) ||
              document.querySelector(`[name="${CSS.escape(nextField.id)}"]`) ||
              document.querySelector(`[data-ai-id="${CSS.escape(nextField.id)}"]`);
            if (nextEl) setTimeout(() => dodgeForField(nextEl), 150);
          }
        }
      }
    } catch {
      // Fall back to just showing the explanation
      addMessage({ role: "assistant", content: toolArgs.explanation });
      if (isVoiceModeRef.current) speak(toolArgs.explanation);
    }
  };

  // ── Scroll to bottom ──────────────────────────────────────────────────────
  // Uses direct scrollTop assignment on the messages container — more reliable
  // than scrollIntoView which can be intercepted by ancestor scroll handlers.
  // Adds the "Now on: X" screen announcement and, if translation mode is active,
  // fetches and appends a translated version of the screen name.
  const announceScreen = async (name) => {
    const tm = translationModeRef.current;
    if (!tm) return;
    try {
      const res = await fetch(`${SERVER_URL}/api/ai/translate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: name, targetLang: tm.lang, targetLangName: tm.langName }),
      });
      const data = await res.json();
      if (data.success && data.translation) {
        addMessage({ role: "assistant", content: `*(${tm.langName}: **${data.translation}**)* ` });
      }
    } catch {
      // silently ignore translation errors — the English announcement already posted
    }
  };

  // ── Hover-translation tooltip ─────────────────────────────────────────────
  // When translation mode is active, hovering a <label> shows its translated
  // text in a small fixed tooltip. Translations are cached to avoid re-fetching.
  useEffect(() => {
    if (!translationMode) {
      setTranslationTooltip(null);
      tooltipTargetRef.current = null;
      clearTimeout(tooltipTimerRef.current);
      return;
    }

    const { lang, langName } = translationMode;

    // Find the nearest ancestor that directly contains non-whitespace text nodes.
    // Excludes the chat panel, interactive form controls, and pure-icon elements.
    const getTextBlock = (el) => {
      if (!el) return null;
      if (panelRef.current?.contains(el)) return null; // never inside the chat widget
      if (["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName)) return null;

      let node = el;
      while (node && node !== document.body) {
        if (node === panelRef.current) return null;
        const hasDirectText = Array.from(node.childNodes).some(
          (n) => n.nodeType === Node.TEXT_NODE && n.textContent?.trim().length > 1,
        );
        if (hasDirectText) return node;
        node = node.parentElement;
      }
      return null;
    };

    const handleMouseOver = (e) => {
      const label = getTextBlock(e.target);
      if (!label) return;
      if (label === tooltipTargetRef.current) return; // still on same block

      clearTimeout(tooltipTimerRef.current);
      tooltipTargetRef.current = label;
      setTranslationTooltip(null);

      const text = label.textContent?.trim();
      if (!text) return;

      // Capture cursor position now — used for tooltip placement so it appears
      // near the hovered text regardless of how wide the ancestor container is.
      const mouseX = e.clientX;
      const mouseY = e.clientY;

      tooltipTimerRef.current = setTimeout(async () => {
        if (tooltipTargetRef.current !== label) return; // moved away

        const x = mouseX;
        const y = mouseY - 12;

        // Show cached value immediately if available
        if (tooltipCacheRef.current[text]) {
          setTranslationTooltip({ text: tooltipCacheRef.current[text], x, y });
          return;
        }

        try {
          const res = await fetch(`${SERVER_URL}/api/ai/translate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text, targetLang: lang, targetLangName: langName }),
          });
          const data = await res.json();
          if (data.success && data.translation) {
            tooltipCacheRef.current[text] = data.translation;
            if (tooltipTargetRef.current === label) {
              setTranslationTooltip({ text: data.translation, x, y });
            }
          }
        } catch {
          /* silently ignore */
        }
      }, 400);
    };

    const handleMouseOut = (e) => {
      const current = tooltipTargetRef.current;
      if (!current) return;
      const relatedTarget = e.relatedTarget;
      // Mouse moved into the tracked element or a descendant — keep timer alive
      if (relatedTarget && (current === relatedTarget || current.contains(relatedTarget))) return;
      clearTimeout(tooltipTimerRef.current);
      tooltipTargetRef.current = null;
      setTranslationTooltip(null);
    };

    document.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("mouseout", handleMouseOut);
    return () => {
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseout", handleMouseOut);
      clearTimeout(tooltipTimerRef.current);
      tooltipTargetRef.current = null;
      setTranslationTooltip(null);
    };
  }, [translationMode]); // eslint-disable-line react-hooks/exhaustive-deps

  const scrollToBottom = useCallback((instant = false) => {
    const el = messagesContainerRef.current;
    if (!el) return;
    if (instant) {
      el.scrollTop = el.scrollHeight;
    } else {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }
  }, []);

  // ── Panel dodge helpers ────────────────────────────────────────────────────

  const rectsOverlap = (a, b) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;

  // Move the panel out of the way of `el` if they overlap.
  //
  // Evaluates all four available regions (left / right / above / below the field)
  // and picks the one where the panel fits best. Within the chosen region:
  //   - Width and height are capped to the available space.
  //   - When one dimension must shrink, the other is expanded proportionally
  //     (up to the region limit) so total panel area stays as large as possible.
  //   - A shrunken dimension never goes below PANEL_MIN_WIDTH / PANEL_MIN_HEIGHT.
  //
  // Saves the original position + dimensions to homePositionRef so they can
  // be fully restored when the panel is no longer overlapping.
  const dodgeForField = (el) => {
    if (!el || !panelRef.current) return;
    // Use the TARGET position (where the panel was last told to go) rather than
    // getBoundingClientRect(), which returns the mid-animation visual position.
    const t = panelTargetRef.current;
    const panelRect = { top: t.top, left: t.left, right: t.left + t.width, bottom: t.top + t.height };

    // Build the avoid-zone: start with the field, then union in its label and adjacent button.
    let fieldRect = el.getBoundingClientRect();

    // Radio buttons: the focused element is a tiny circle; expand to cover the entire group
    // (all options + their label text) by finding the closest ancestor that contains all
    // same-name inputs.
    if (el.type === "radio" && el.name) {
      const totalInDoc = document.querySelectorAll(`input[type="radio"][name="${CSS.escape(el.name)}"]`).length;
      let container = el.parentElement;
      for (let depth = 0; depth < 8; depth++) {
        if (!container || container === document.body) break;
        if (container.querySelectorAll(`input[type="radio"][name="${CSS.escape(el.name)}"]`).length >= totalInDoc) {
          const cr = container.getBoundingClientRect();
          fieldRect = { left: cr.left, right: cr.right, top: cr.top, bottom: cr.bottom };
          break;
        }
        container = container.parentElement;
      }
    }

    // Signature fields: the sign_text (attestation paragraph) is rendered as a previous sibling
    // of the [data-ai-type="sign"] wrapper, so union it in so the panel never covers it.
    if (el.getAttribute?.("data-ai-type") === "sign") {
      let sib = el.previousElementSibling;
      while (sib) {
        const sr = sib.getBoundingClientRect();
        if (sr.height > 0) {
          fieldRect = {
            left: Math.min(fieldRect.left, sr.left),
            right: Math.max(fieldRect.right, sr.right),
            top: Math.min(fieldRect.top, sr.top),
            bottom: Math.max(fieldRect.bottom, sr.bottom),
          };
        }
        sib = sib.previousElementSibling;
      }
    }

    const elTag = el.tagName || "?";
    const elId = el.id || el.getAttribute?.("data-ai-id") || "(no id)";
    console.log(
      `[DODGE] field: <${elTag}> id="${elId}" fieldRect={top:${fieldRect.top.toFixed(0)}, bot:${fieldRect.bottom.toFixed(0)}, left:${fieldRect.left.toFixed(0)}, right:${fieldRect.right.toFixed(0)}} panelRect={top:${panelRect.top.toFixed(0)}, bot:${panelRect.bottom.toFixed(0)}, left:${panelRect.left.toFixed(0)}, right:${panelRect.right.toFixed(0)}}`,
    );

    // Include the field's label so it is never covered.
    // Use only field-specific selectors to avoid accidentally grabbing labels for other fields.
    let labelEl = el.closest(".input-box")?.querySelector("h4") ?? null;
    if (!labelEl && el.id) {
      labelEl = document.querySelector(`label[for="${CSS.escape(el.id)}"]`);
    }
    if (labelEl) {
      const lr = labelEl.getBoundingClientRect();
      console.log(
        `[DODGE] label found: <${labelEl.tagName}> text="${labelEl.textContent?.trim().slice(0, 40)}" rect={top:${lr.top.toFixed(0)}, bot:${lr.bottom.toFixed(0)}}`,
      );
      fieldRect = {
        left: Math.min(fieldRect.left, lr.left),
        right: Math.max(fieldRect.right, lr.right),
        top: Math.min(fieldRect.top, lr.top),
        bottom: Math.max(fieldRect.bottom, lr.bottom),
      };
    } else {
      console.log(`[DODGE] label: none found`);
    }

    // Include any adjacent button (e.g. "Send Code", "Verify", submit).
    // Only include if the button is within 100px of the field vertically — this prevents
    // distant UI buttons (e.g. "Enable Help" further down the page) from inflating the avoid-zone.
    const adjBtn = findAdjacentButton(el);
    if (adjBtn) {
      const btnRect = adjBtn.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      const vertGap = Math.max(0, btnRect.top - elRect.bottom, elRect.top - btnRect.bottom);
      if (vertGap <= 100) {
        console.log(
          `[DODGE] button found: "${adjBtn.textContent?.trim().slice(0, 30)}" rect={top:${btnRect.top.toFixed(0)}, bot:${btnRect.bottom.toFixed(0)}}`,
        );
        fieldRect = {
          left: Math.min(fieldRect.left, btnRect.left),
          right: Math.max(fieldRect.right, btnRect.right),
          top: Math.min(fieldRect.top, btnRect.top),
          bottom: Math.max(fieldRect.bottom, btnRect.bottom),
        };
      } else {
        console.log(
          `[DODGE] button: found "${adjBtn.textContent?.trim().slice(0, 30)}" but ${vertGap.toFixed(0)}px away — skipping`,
        );
      }
    } else {
      console.log(`[DODGE] button: none found`);
    }

    // On the first field focus after a screen change, extend the avoid-zone to cover the form's
    // display text (from form container top down to the first field). This prevents the panel
    // from overlapping critical instructional text that appears above the first field on render.
    if (isInitialScreenDodgeRef.current) {
      isInitialScreenDodgeRef.current = false;
      const nowCtx = getScreenContext();
      if (nowCtx?.formRef?.current) {
        const cr = nowCtx.formRef.current.getBoundingClientRect();
        if (cr.top < fieldRect.top) fieldRect = { ...fieldRect, top: cr.top };
      }
    }

    console.log(
      `[DODGE] avoidRect after unions: {top:${fieldRect.top.toFixed(0)}, bot:${fieldRect.bottom.toFixed(0)}, left:${fieldRect.left.toFixed(0)}, right:${fieldRect.right.toFixed(0)}}`,
    );

    if (!rectsOverlap(panelRect, fieldRect)) {
      console.log(`[DODGE] no overlap — skipping move`);
      return;
    }

    // Save home once — subsequent calls while already dodging preserve the original home.
    if (!homePositionRef.current) {
      homePositionRef.current = {
        top: panelRect.top,
        left: panelRect.left,
        width: PANEL_WIDTH,
        height: PANEL_HEIGHT,
      };
    }

    const M = 8; // margin from viewport edges and field edges
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // The four candidate regions around the field
    const regions = [
      { id: "right", left: fieldRect.right + M, top: M, w: vw - fieldRect.right - M * 2, h: vh - M * 2 },
      { id: "left", left: M, top: M, w: fieldRect.left - M * 2, h: vh - M * 2 },
      { id: "below", left: M, top: fieldRect.bottom + M, w: vw - M * 2, h: vh - fieldRect.bottom - M * 2 },
      { id: "above", left: M, top: M, w: vw - M * 2, h: fieldRect.top - M * 2 },
    ];

    // Score each region: prefer regions that need the least shrinking
    const scored = regions
      .filter((r) => r.w >= PANEL_MIN_WIDTH && r.h >= PANEL_MIN_HEIGHT)
      .map((r) => {
        const fitW = Math.min(PANEL_WIDTH, r.w);
        const fitH = Math.min(PANEL_HEIGHT, r.h);
        return { ...r, fitW, fitH, score: fitW * fitH };
      })
      .sort((a, b) => b.score - a.score);

    regions.forEach((r) => {
      const pass = r.w >= PANEL_MIN_WIDTH && r.h >= PANEL_MIN_HEIGHT;
      const s = scored.find((s) => s.id === r.id);
      console.log(
        `[DODGE] region ${r.id}: w=${r.w.toFixed(0)} h=${r.h.toFixed(0)} ${pass ? `PASS score=${s?.score.toFixed(0)}` : "FILTERED (too small)"}`,
      );
    });

    // Pick the best usable region, or fall back to the largest raw region
    const best =
      scored[0] ??
      regions
        .map((r) => ({
          ...r,
          fitW: Math.max(PANEL_MIN_WIDTH, Math.min(PANEL_WIDTH, r.w)),
          fitH: Math.max(PANEL_MIN_HEIGHT, Math.min(PANEL_HEIGHT, r.h)),
          score: r.w * r.h,
        }))
        .sort((a, b) => b.score - a.score)[0];

    console.log(`[DODGE] chosen region: ${best.id}`);

    // Compensate: if one dimension is compressed, expand the other proportionally
    // to preserve as much panel area as possible, capped to the region.
    let newW = best.fitW;
    let newH = best.fitH;
    const targetArea = PANEL_WIDTH * PANEL_HEIGHT;
    if (newW < PANEL_WIDTH && newH > 0) {
      newH = Math.min(best.h, Math.max(newH, Math.ceil(targetArea / newW)));
    }
    if (newH < PANEL_HEIGHT && newW > 0) {
      newW = Math.min(best.w, Math.max(newW, Math.ceil(targetArea / newH)));
    }
    newW = Math.max(PANEL_MIN_WIDTH, Math.min(best.w, newW));
    newH = Math.max(PANEL_MIN_HEIGHT, Math.min(best.h, newH));

    // Position the panel within the chosen region
    let newLeft = best.left;
    let newTop = best.top;
    if (best.id === "left") newLeft = Math.max(M, fieldRect.left - newW - M);
    if (best.id === "right") newLeft = fieldRect.right + M;
    if (best.id === "above") newTop = Math.max(M, fieldRect.top - newH - M);
    if (best.id === "below") newTop = fieldRect.bottom + M;

    // For vertical regions (above/below), maintain horizontal position if possible
    if (best.id === "above" || best.id === "below") {
      newLeft = Math.max(M, Math.min(vw - newW - M, panelRect.left));
    }
    // For horizontal regions (left/right), center vertically on the field
    if (best.id === "left" || best.id === "right") {
      const fieldCY = (fieldRect.top + fieldRect.bottom) / 2;
      newTop = Math.max(M, Math.min(vh - newH - M, fieldCY - newH / 2));
    }

    // Final viewport clamp — ensure the panel never goes off-screen regardless of region logic.
    newTop = Math.max(M, Math.min(vh - newH - M, newTop));
    newLeft = Math.max(M, Math.min(vw - newW - M, newLeft));

    console.log(
      `[DODGE] → move to top=${newTop.toFixed(0)} left=${newLeft.toFixed(0)} w=${newW.toFixed(0)} h=${newH.toFixed(0)}`,
    );
    panelTargetRef.current = { top: newTop, left: newLeft, width: newW, height: newH };
    setPanelWidth(newW);
    setPanelHeight(newH);
    setPosition({ top: newTop, left: newLeft });
    // After the panel repositions/resizes, scroll the messages list to the bottom
    // so the most recent message stays visible in the new layout.
    setTimeout(() => scrollToBottom(), 50);
  };

  // Restore panel to its home size and position.
  // Skips restore if the home position would still overlap the next unfilled field.
  const restoreHomePosition = (fields, afterFieldId) => {
    if (!homePositionRef.current) return;
    const home = homePositionRef.current;
    const rW = home.width ?? PANEL_WIDTH;
    const rH = home.height ?? PANEL_HEIGHT;
    const homeRect = { left: home.left, top: home.top, right: home.left + rW, bottom: home.top + rH };
    if (afterFieldId && fields?.length) {
      const idx = fields.findIndex((f) => f.id === afterFieldId);
      const nextDirect = fields.slice(idx + 1).find((f) => f.directEntry && !f.filled);
      if (nextDirect) {
        const nextEl =
          document.getElementById(nextDirect.id) || document.querySelector(`[name="${CSS.escape(nextDirect.id)}"]`);
        if (nextEl && rectsOverlap(homeRect, nextEl.getBoundingClientRect())) return;
      }
    }
    panelTargetRef.current = { top: home.top, left: home.left, width: rW, height: rH };
    setPanelWidth(rW);
    setPanelHeight(rH);
    setPosition({ top: home.top, left: home.left });
    homePositionRef.current = null;
  };

  // ── end panel dodge helpers ────────────────────────────────────────────────

  const applyToolCall = async (tool, args, currentHistory) => {
    console.log(`%c[TOOL] applyToolCall: ${tool}`, "color:#c0f; font-weight:bold", args);
    const ctx = getScreenContext();
    if (!ctx?.actions) return;
    const defaultEndpoint =
      assistantMode === "applicant" ? `${SERVER_URL}/api/ai/applicant-chat` : `${SERVER_URL}/api/ai/branding-chat`;
    const chatEndpoint = ctx.aiEndpoint || defaultEndpoint;

    if (tool === "revertLastAction") {
      const { explanation } = args;
      const entry = popRevertable();
      if (!entry) {
        addMessage({ role: "assistant", content: explanation });
        if (isVoiceModeRef.current) speak(explanation);
        return;
      }
      try {
        const freshCtx = getScreenContext();
        await entry.revertFn(freshCtx);
        addMessage({ role: "assistant", content: explanation });
        if (isVoiceModeRef.current) speak(explanation);
      } catch (err) {
        const detail = err?.data?.message || err?.message || "";
        addMessage({
          role: "assistant",
          content: `${wt("revertFailed")}${detail ? `: ${detail}` : ""}. ${wt("tryAgain")}`,
        });
      }
      return;
    }

    if (tool === "fetchWebsiteBranding") {
      const { url, intent, companyName: aiProvidedName } = args;
      addMessage({ role: "assistant", content: `Fetching **${url}**… this may take a moment.` });
      try {
        const res = await fetch(`${SERVER_URL}/api/ai/fetch-website-branding`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ url }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message || "Failed");

        const { brandingData, screenshotUrl } = data;

        if (ctx.actions.applyExtractedBranding) {
          ctx.actions.applyExtractedBranding(brandingData);
        }
        if (screenshotUrl && ctx.actions.setWebsiteImage) {
          ctx.actions.setWebsiteImage(screenshotUrl);
        }

        // Auto-fill company name if blank
        if (!ctx.currentState?.companyName && ctx.actions.companyName) {
          const nameFromExtracted = brandingData?.name;
          const nameFromDomain = (() => {
            try {
              const hostname = new URL(url.startsWith("http") ? url : `https://${url}`).hostname;
              const base = hostname.replace(/^www\./, "").split(".")[0];
              return base.charAt(0).toUpperCase() + base.slice(1);
            } catch {
              return "";
            }
          })();
          const nameToUse = aiProvidedName || nameFromExtracted || nameFromDomain;
          if (nameToUse) ctx.actions.companyName(nameToUse);
        }

        // Auto-fill website URL if blank
        if (!ctx.currentState?.websiteUrl && ctx.actions.websiteUrl) {
          ctx.actions.websiteUrl(url);
        }

        const imageUrl = screenshotUrl || null;
        const visionContent = [
          ...(imageUrl ? [{ type: "image_url", image_url: { url: imageUrl } }] : []),
          {
            type: "text",
            text: `Here is the full-page screenshot and extracted branding data for ${url}:\n\n${JSON.stringify(brandingData, null, 2)}\n\nUser intent: ${intent || "analyze this branding for inspiration"}.\n\nPlease analyze the site's visual design and branding, then respond helpfully to the user's original request.`,
          },
        ];

        const followUpHistory = [...currentHistory, { role: "user", content: visionContent }];

        const aiRes = await fetch(chatEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            messages: followUpHistory,
            context: {
              screenId: ctx?.screenId,
              screenName: ctx?.screenName,
              description: ctx?.description,
              currentState: ctx?.currentState,
              logos: ctx?.logos,
              // Use freshly extracted palette so logo colors are in the system prompt context
              // before React state has had a chance to propagate applyExtractedBranding
              colorPalette: brandingData?.color_palette || ctx?.colorPalette || undefined,
              customPrompt: aiCustomPrompt || undefined,
            },
          }),
        });
        const aiData = await aiRes.json();
        if (!aiData.success) throw new Error(aiData.message || "AI request failed");

        if (aiData.type === "tool_call") {
          await applyToolCall(aiData.tool, aiData.args, followUpHistory);
        } else {
          addMessage({ role: "assistant", content: aiData.content });
          if (isVoiceModeRef.current) speak(aiData.content);
        }
      } catch {
        addMessage({ role: "assistant", content: `${wt("fetchFailed")} **${url}**. ${wt("tryAgain")}` });
      }
      return;
    }

    if (tool === "openManualExtractionFlow") {
      const { url, explanation } = args;
      addMessage({ role: "assistant", content: explanation });
      if (isVoiceModeRef.current) speak(explanation);
      const action = ctx?.actions?.openManualExtractionFlow;
      if (action) {
        action({ url });
      } else {
        // Screen context doesn't support this tool — inform the user
        addMessage({
          role: "assistant",
          content: "Open the Extract Branding modal and switch to the Manual Extract tab to continue.",
        });
      }
      return;
    }

    if (tool === "extractBrandingFromPastedContent") {
      const { content, explanation } = args;
      addMessage({ role: "assistant", content: explanation });
      try {
        const res = await fetch(`${SERVER_URL}/api/ai/extract-branding-from-content`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ content }),
        });
        const data = await res.json();
        if (!data.success) throw new Error("Failed to parse content");

        const { colors, cssVars, logoUrls, colorCount } = data;
        const parts = [
          colorCount > 0 ? `${colorCount} hex colors` : null,
          Object.keys(cssVars).length > 0 ? `${Object.keys(cssVars).length} CSS variables` : null,
          logoUrls.length > 0 ? `${logoUrls.length} image URLs` : null,
        ].filter(Boolean);

        const summary = parts.length
          ? `Extracted from pasted content: ${parts.join(", ")}.`
          : "No recognizable colors or URLs found in the pasted content.";

        const resultText = [
          summary,
          colors.length ? `Colors: ${colors.join(", ")}` : null,
          Object.keys(cssVars).length ? `CSS variables: ${JSON.stringify(cssVars)}` : null,
          logoUrls.length ? `Image URLs: ${logoUrls.join(", ")}` : null,
        ]
          .filter(Boolean)
          .join("\n");

        const followUpHistory = [...currentHistory, { role: "user", content: resultText }];

        const aiRes = await fetch(chatEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            messages: followUpHistory,
            context: {
              screenId: ctx?.screenId,
              screenName: ctx?.screenName,
              description: ctx?.description,
              currentState: ctx?.currentState,
              logos: ctx?.logos,
              colorPalette: ctx?.colorPalette || undefined,
            },
          }),
        });
        const aiData = await aiRes.json();
        if (!aiData.success) throw new Error(aiData.message || "AI request failed");

        if (aiData.type === "tool_call") {
          await applyToolCall(aiData.tool, aiData.args, followUpHistory);
        } else {
          addMessage({ role: "assistant", content: aiData.content });
          if (isVoiceModeRef.current) speak(aiData.content);
        }
      } catch {
        addMessage({
          role: "assistant",
          content:
            "I couldn't parse the pasted content. Try pasting just the hex color codes or CSS variables directly.",
        });
      }
      return;
    }

    if (tool === "applyBrandingChanges") {
      const { changes, explanation } = args;
      // Snapshot current values before overwriting
      const snapshot = {};
      Object.keys(changes).forEach((key) => {
        snapshot[key] = ctx.currentState?.[key];
      });
      pushRevertable({
        description: `Applied branding changes (${Object.keys(changes).join(", ")})`,
        revertFn: (freshCtx) => {
          Object.entries(snapshot).forEach(([key, val]) => {
            if (val !== undefined && freshCtx?.actions?.[key]) freshCtx.actions[key](val);
          });
        },
      });
      Object.entries(changes).forEach(([key, value]) => {
        const setter = ctx.actions[key];
        if (setter) setter(value);
      });
      addMessage({ role: "assistant", content: explanation, toolCall: { tool, changes } });
      if (isVoiceModeRef.current) speak(explanation);
      // Continue so the AI can chain the next step of a compound command (e.g. save, assign to form)
      await continueAfterToolCall(
        tool,
        args,
        "Branding changes applied to the screen.",
        currentHistory,
        chatEndpoint,
        ctx,
      );
      return;
    }

    if (tool === "suggestColors") {
      const { colors, explanation } = args;
      // Populate the Custom Color Palette swatches
      if (ctx.actions.setSuggestedColors) ctx.actions.setSuggestedColors(colors);
      // Show in-chat preview with color swatches
      addMessage({ role: "assistant", content: explanation, toolCall: { tool: "suggestColors", colors } });
      if (isVoiceModeRef.current) speak(explanation);
      // suggestColors is end-of-turn — show colors and wait for user confirmation before applying
      return;
    }

    if (tool === "editLogo") {
      const { logoUrl, instructions, explanation } = args;
      addMessage({ role: "assistant", content: `${explanation} — this may take up to 30 seconds…` });
      setIsLoading(true);
      try {
        const res = await fetch(`${SERVER_URL}/api/ai/logo-edit`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ logoUrl, instructions }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message || "Logo edit failed");
        const freshCtx = getScreenContext();
        if (freshCtx?.actions?.addLogo) freshCtx.actions.addLogo(data.url);
        addMessage({
          role: "assistant",
          content:
            "Done! The modified logo has been added to your available logos — you can now select it from the logo panel.",
        });
        if (isVoiceModeRef.current) speak("Done! The modified logo has been added to your available logos.");
      } catch (err) {
        addMessage({
          role: "assistant",
          content: `Sorry, I couldn't edit the logo: ${err.message || "please try again."}`,
        });
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (
      [
        "resizeLogo",
        "cropLogo",
        "roundLogoCorners",
        "flattenLogo",
        "flipLogo",
        "rotateLogo",
        "grayscaleLogo",
        "addLogoPadding",
        "trimLogo",
        "removeBackgroundFromLogo",
      ].includes(tool)
    ) {
      const { logoUrl, explanation, ...params } = args;
      const ENDPOINT_MAP = {
        resizeLogo: "logo-resize",
        cropLogo: "logo-crop",
        roundLogoCorners: "logo-round-corners",
        flattenLogo: "logo-flatten",
        flipLogo: "logo-flip",
        rotateLogo: "logo-rotate",
        grayscaleLogo: "logo-grayscale",
        addLogoPadding: "logo-padding",
        trimLogo: "logo-trim",
        removeBackgroundFromLogo: "logo-remove-background",
      };
      const endpoint = ENDPOINT_MAP[tool];
      addMessage({ role: "assistant", content: explanation });
      setIsLoading(true);
      try {
        const res = await fetch(`${SERVER_URL}/api/ai/${endpoint}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ logoUrl, ...params }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message || "Logo processing failed");
        const freshCtx = getScreenContext();
        if (freshCtx?.actions?.addLogo) freshCtx.actions.addLogo(data.url);
        addMessage({ role: "assistant", content: "Done! The modified logo has been added to your available logos." });
        if (isVoiceModeRef.current) speak("Done! The modified logo has been added to your available logos.");
      } catch (err) {
        addMessage({
          role: "assistant",
          content: `Sorry, I couldn't process the logo: ${err.message || "please try again."}`,
        });
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (tool === "saveBranding") {
      const { explanation } = args;
      try {
        if (ctx.actions.saveBranding) await ctx.actions.saveBranding();
        // Chain a follow-up so the AI can issue a second action (e.g. navigation)
        await continueAfterToolCall(tool, args, "Branding saved successfully.", currentHistory, chatEndpoint, ctx);
      } catch (err) {
        const detail = err?.data?.message || err?.message || "";
        addMessage({
          role: "assistant",
          content: `${wt("errorCouldnt")}${detail ? `: ${detail}` : ""}. ${wt("tryAgain")}`,
        });
      }
      return;
    }

    if (tool === "updateEmailTemplate") {
      const { subject, body, templateName, emailType, explanation } = args;
      // Switch to edit mode so changes are visible and saveable
      if (ctx.actions.enableEdit) ctx.actions.enableEdit();
      if (subject !== undefined && ctx.actions.subject) ctx.actions.subject(subject);
      if (body !== undefined && ctx.actions.body) ctx.actions.body(body);
      if (templateName !== undefined && ctx.actions.templateName) ctx.actions.templateName(templateName);
      if (emailType !== undefined && ctx.actions.emailType) ctx.actions.emailType(emailType);
      addMessage({ role: "assistant", content: explanation });
      if (isVoiceModeRef.current) speak(explanation);
      return;
    }

    if (tool === "saveEmailTemplate") {
      const { explanation } = args;
      try {
        if (ctx.actions.saveEmailTemplate) await ctx.actions.saveEmailTemplate();
        await continueAfterToolCall(
          tool,
          args,
          "Email template saved successfully.",
          currentHistory,
          chatEndpoint,
          ctx,
        );
      } catch (err) {
        const detail = err?.data?.message || err?.message || "";
        addMessage({
          role: "assistant",
          content: `${wt("errorCouldnt")}${detail ? `: ${detail}` : ""}. ${wt("tryAgain")}`,
        });
      }
      return;
    }

    if (tool === "createStrategy") {
      const { explanation, ...strategyArgs } = args;
      try {
        if (ctx.actions.createStrategy) await ctx.actions.createStrategy(strategyArgs);
        addMessage({ role: "assistant", content: explanation });
        if (isVoiceModeRef.current) speak(explanation);
      } catch (err) {
        const detail = err?.data?.message || err?.message || "";
        addMessage({
          role: "assistant",
          content: `${wt("errorCouldnt")}${detail ? `: ${detail}` : ""}. ${wt("tryAgain")}`,
        });
      }
      return;
    }

    if (tool === "linkStrategyToForm") {
      const { explanation, ...linkArgs } = args;
      try {
        if (ctx.actions.linkStrategyToForm) await ctx.actions.linkStrategyToForm(linkArgs);
        addMessage({ role: "assistant", content: explanation });
        if (isVoiceModeRef.current) speak(explanation);
      } catch (err) {
        const detail = err?.data?.message || err?.message || "";
        addMessage({
          role: "assistant",
          content: `${wt("errorCouldnt")}${detail ? `: ${detail}` : ""}. ${wt("tryAgain")}`,
        });
      }
      return;
    }

    if (tool === "moveFormToStrategy") {
      const { explanation, ...moveArgs } = args;
      try {
        if (ctx.actions.moveFormToStrategy) await ctx.actions.moveFormToStrategy(moveArgs);
        addMessage({ role: "assistant", content: explanation });
        if (isVoiceModeRef.current) speak(explanation);
      } catch (err) {
        const detail = err?.data?.message || err?.message || "";
        addMessage({
          role: "assistant",
          content: `${wt("errorCouldnt")}${detail ? `: ${detail}` : ""}. ${wt("tryAgain")}`,
        });
      }
      return;
    }

    if (tool === "createStrategyAndMoveForm") {
      const { explanation, ...createMoveArgs } = args;
      try {
        if (ctx.actions.createStrategyAndMoveForm) await ctx.actions.createStrategyAndMoveForm(createMoveArgs);
        addMessage({ role: "assistant", content: explanation });
        if (isVoiceModeRef.current) speak(explanation);
      } catch (err) {
        const detail = err?.data?.message || err?.message || "";
        addMessage({
          role: "assistant",
          content: `${wt("errorCouldnt")}${detail ? `: ${detail}` : ""}. ${wt("tryAgain")}`,
        });
      }
      return;
    }

    if (tool === "createUser") {
      const { explanation, ...userArgs } = args;
      try {
        if (ctx.actions.createUser) await ctx.actions.createUser(userArgs);
        addMessage({ role: "assistant", content: explanation });
        if (isVoiceModeRef.current) speak(explanation);
      } catch (err) {
        const detail = err?.data?.message || err?.message || "";
        addMessage({
          role: "assistant",
          content: `${wt("errorCouldnt")}${detail ? `: ${detail}` : ""}. ${wt("tryAgain")}`,
        });
      }
      return;
    }

    if (tool === "updateUser") {
      const { explanation, ...userArgs } = args;
      try {
        if (ctx.actions.updateUser) await ctx.actions.updateUser(userArgs);
        addMessage({ role: "assistant", content: explanation });
        if (isVoiceModeRef.current) speak(explanation);
      } catch (err) {
        const detail = err?.data?.message || err?.message || "";
        addMessage({
          role: "assistant",
          content: `${wt("errorCouldnt")}${detail ? `: ${detail}` : ""}. ${wt("tryAgain")}`,
        });
      }
      return;
    }

    if (tool === "changePassword") {
      const { explanation, ...pwArgs } = args;
      try {
        if (ctx.actions.changePassword) await ctx.actions.changePassword(pwArgs);
        addMessage({ role: "assistant", content: explanation });
        if (isVoiceModeRef.current) speak(explanation);
      } catch (err) {
        const detail = err?.data?.message || err?.message || "";
        addMessage({
          role: "assistant",
          content: `${wt("errorCouldnt")}${detail ? `: ${detail}` : ""}. ${wt("tryAgain")}`,
        });
      }
      return;
    }

    if (tool === "changePasswords") {
      const { explanation, ...pwArgs } = args;
      try {
        if (ctx.actions.changePasswords) await ctx.actions.changePasswords(pwArgs);
        addMessage({ role: "assistant", content: explanation });
        if (isVoiceModeRef.current) speak(explanation);
      } catch (err) {
        const detail = err?.data?.message || err?.message || "";
        addMessage({
          role: "assistant",
          content: `${wt("errorCouldnt")}${detail ? `: ${detail}` : ""}. ${wt("tryAgain")}`,
        });
      }
      return;
    }

    if (tool === "deleteUser") {
      const { explanation, ...userArgs } = args;
      try {
        if (ctx.actions.deleteUser) await ctx.actions.deleteUser(userArgs);
        addMessage({ role: "assistant", content: explanation });
        if (isVoiceModeRef.current) speak(explanation);
      } catch (err) {
        const detail = err?.data?.message || err?.message || "";
        addMessage({
          role: "assistant",
          content: `${wt("errorCouldnt")}${detail ? `: ${detail}` : ""}. ${wt("tryAgain")}`,
        });
      }
      return;
    }

    if (tool === "deleteUsers") {
      const { explanation, ...userArgs } = args;
      try {
        if (ctx.actions.deleteUsers) await ctx.actions.deleteUsers(userArgs);
        addMessage({ role: "assistant", content: explanation });
        if (isVoiceModeRef.current) speak(explanation);
      } catch (err) {
        const detail = err?.data?.message || err?.message || "";
        addMessage({
          role: "assistant",
          content: `${wt("errorCouldnt")}${detail ? `: ${detail}` : ""}. ${wt("tryAgain")}`,
        });
      }
      return;
    }

    if (tool === "createRole") {
      const { explanation, ...roleArgs } = args;
      try {
        if (ctx.actions.createRole) await ctx.actions.createRole(roleArgs);
        addMessage({ role: "assistant", content: explanation });
        if (isVoiceModeRef.current) speak(explanation);
      } catch (err) {
        const detail = err?.data?.message || err?.message || "";
        addMessage({
          role: "assistant",
          content: `${wt("errorCouldnt")}${detail ? `: ${detail}` : ""}. ${wt("tryAgain")}`,
        });
      }
      return;
    }

    if (tool === "updateRole") {
      const { explanation, ...roleArgs } = args;
      // Snapshot old role state before updating
      const roles = ctx.currentState?.roles || [];
      const oldRole = roles.find((r) => r._id === roleArgs.roleId);
      if (oldRole) {
        pushRevertable({
          description: `Updated role "${oldRole.name}"`,
          revertFn: async (freshCtx) => {
            if (freshCtx?.actions?.updateRole) {
              await freshCtx.actions.updateRole({
                roleId: oldRole._id,
                name: oldRole.name,
                permissionNames: oldRole.permissions,
              });
            }
          },
        });
      }
      try {
        if (ctx.actions.updateRole) await ctx.actions.updateRole(roleArgs);
        addMessage({ role: "assistant", content: explanation });
        if (isVoiceModeRef.current) speak(explanation);
      } catch (err) {
        const detail = err?.data?.message || err?.message || "";
        addMessage({
          role: "assistant",
          content: `${wt("errorCouldnt")}${detail ? `: ${detail}` : ""}. ${wt("tryAgain")}`,
        });
      }
      return;
    }

    if (tool === "deleteRole") {
      const { explanation, ...roleArgs } = args;
      try {
        if (ctx.actions.deleteRole) await ctx.actions.deleteRole(roleArgs);
        addMessage({ role: "assistant", content: explanation });
        if (isVoiceModeRef.current) speak(explanation);
      } catch (err) {
        const detail = err?.data?.message || err?.message || "";
        addMessage({
          role: "assistant",
          content: `${wt("errorCouldnt")}${detail ? `: ${detail}` : ""}. ${wt("tryAgain")}`,
        });
      }
      return;
    }

    if (tool === "setLookupActive") {
      const { updates, explanation } = args;
      // Snapshot old isActive per affected lookup
      const lookups = ctx.currentState?.lookups || [];
      const snapshot = updates.map(({ searchObjectKey }) => {
        const lookup = lookups.find((l) => l.searchObjectKey === searchObjectKey);
        return { searchObjectKey, wasActive: lookup?.isActive ?? false };
      });
      pushRevertable({
        description: `Changed active status on ${updates.length} lookup(s)`,
        revertFn: async (freshCtx) => {
          if (freshCtx?.actions?.setLookupActive) {
            for (const { searchObjectKey, wasActive } of snapshot) {
              await freshCtx.actions.setLookupActive({ searchObjectKey, isActive: wasActive });
            }
          }
        },
      });
      if (ctx.actions.setLookupActive) {
        for (const update of updates) {
          await ctx.actions.setLookupActive(update);
        }
      }
      addMessage({ role: "assistant", content: explanation });
      if (isVoiceModeRef.current) speak(explanation);
      return;
    }

    if (tool === "draftNewLookup") {
      const { explanation, ...draftData } = args;
      if (ctx.actions.openCreateModal) ctx.actions.openCreateModal(draftData);
      addMessage({
        role: "assistant",
        content: `I've drafted a new lookup and opened it in the editor for your review.\n\n${explanation}`,
      });
      if (isVoiceModeRef.current) speak(explanation);
      return;
    }

    if (tool === "createLookup") {
      const { explanation, ...lookupData } = args;
      try {
        if (ctx.actions.createLookup) await ctx.actions.createLookup(lookupData);
        await continueAfterToolCall(tool, args, "Lookup created successfully.", currentHistory, chatEndpoint, ctx);
      } catch (err) {
        const detail = err?.data?.message || err?.message || "";
        addMessage({
          role: "assistant",
          content: `${wt("errorCouldnt")}${detail ? `: ${detail}` : ""}. ${wt("tryAgain")}`,
        });
      }
      return;
    }

    if (tool === "updateLookup") {
      const { explanation, ...lookupData } = args;
      try {
        if (ctx.actions.updateLookup) await ctx.actions.updateLookup(lookupData);
        await continueAfterToolCall(tool, args, "Lookup updated successfully.", currentHistory, chatEndpoint, ctx);
      } catch (err) {
        const detail = err?.data?.message || err?.message || "";
        addMessage({
          role: "assistant",
          content: `${wt("errorCouldnt")}${detail ? `: ${detail}` : ""}. ${wt("tryAgain")}`,
        });
      }
      return;
    }

    if (tool === "deleteBrandings") {
      const { explanation, brandingIds } = args;
      try {
        if (ctx.actions.deleteBrandings) await ctx.actions.deleteBrandings({ brandingIds });
        addMessage({ role: "assistant", content: explanation });
        if (isVoiceModeRef.current) speak(explanation);
      } catch (err) {
        const detail = err?.data?.message || err?.message || "";
        addMessage({
          role: "assistant",
          content: `${wt("errorCouldnt")}${detail ? `: ${detail}` : ""}. ${wt("tryAgain")}`,
        });
      }
      return;
    }

    if (tool === "openEditBranding") {
      const { explanation, brandingId } = args;
      if (ctx.actions.openEditBranding) ctx.actions.openEditBranding({ brandingId });
      addMessage({ role: "assistant", content: explanation });
      if (isVoiceModeRef.current) speak(explanation);
      return;
    }

    if (tool === "openCreateBranding") {
      const { explanation, fetchUrl } = args;
      if (fetchUrl) {
        addMessage({ role: "assistant", content: `Fetching branding from **${fetchUrl}**… this may take a moment.` });
        try {
          const res = await fetch(`${SERVER_URL}/api/ai/fetch-website-branding`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ url: fetchUrl }),
          });
          const data = await res.json();
          if (!data.success) throw new Error(data.message || "Failed to fetch branding");
          const pending = {
            brandingData: data.brandingData,
            screenshotUrl: data.screenshotUrl || null,
            url: fetchUrl,
          };
          sessionStorage.setItem("pendingBrandingData", JSON.stringify(pending));
          pendingAnalysisRef.current = pending;
        } catch (err) {
          addMessage({ role: "assistant", content: `${wt("fetchFailed")} **${fetchUrl}**: ${err.message}.` });
        }
      }
      if (ctx.actions.openCreateBranding) ctx.actions.openCreateBranding();
      addMessage({ role: "assistant", content: explanation });
      if (isVoiceModeRef.current) speak(explanation);
      return;
    }

    if (tool === "selectFormForEditing") {
      const { explanation, formId } = args;

      // Guard against stale IDs (e.g. form was renamed/deleted since the last list refresh)
      const knownForms = ctx.currentState?.forms || [];
      if (formId && !knownForms.some((f) => String(f._id) === String(formId))) {
        const formList = knownForms
          .map(
            (f) =>
              `"${f.name}"${f.headerText && f.headerText !== f.name ? ` (displayed as "${f.headerText}")` : ""} [${f._id}]`,
          )
          .join(", ");
        await continueAfterToolCall(
          tool,
          args,
          `Error: Form ID "${formId}" is not in the current forms list — it may have been deleted or recreated with a new ID. Current forms: ${formList || "none"}. Please use a valid ID from this list.`,
          currentHistory,
          chatEndpoint,
          ctx,
        );
        return;
      }

      addMessage({ role: "assistant", content: explanation || "Loading form details…" });
      if (isVoiceModeRef.current) speak(explanation || "Loading form details.");
      // Reset the form ID tracker so formDataSignal fires even if this form was
      // already loaded — this guarantees fresh data on every readiness check.
      signalContinuationPending();
      pendingFormContinuationRef.current = { toolArgs: args, history: currentHistory };
      if (ctx.actions.selectFormForEditing) ctx.actions.selectFormForEditing({ formId });
      return;
    }

    if (tool === "cloneFormSettings") {
      const { sourceFormId, targetFormId, sectionUpdates, fieldUpdates, explanation } = args;
      const cloneFailures = [];

      const targetSections = ctx.currentState?.detailedForm?.sections || [];
      const targetSectionMap = new Map(targetSections.map((s) => [String(s._id), s]));
      const forms = ctx.currentState?.forms || [];
      const sourceForm = forms.find((f) => String(f._id) === String(sourceFormId));
      const targetForm = forms.find((f) => String(f._id) === String(targetFormId));

      // Branding — independent step
      try {
        const sourceBrandingId = sourceForm?.branding?._id ? String(sourceForm.branding._id) : null;
        const sourceBrandingName = sourceForm?.branding?.name || sourceBrandingId;
        const targetBrandingId = targetForm?.branding?._id ? String(targetForm.branding._id) : null;
        if (!sourceBrandingId) {
          cloneFailures.push("**Branding:** source has no branding — skipped");
        } else if (sourceBrandingId === targetBrandingId) {
          cloneFailures.push(`**Branding:** already set to "${sourceBrandingName}" — skipped`);
        } else if (ctx.actions.setFormsBranding) {
          await ctx.actions.setFormsBranding({
            updates: [{ formId: String(targetFormId), brandingId: sourceBrandingId }],
          });
          cloneFailures.push(`**Branding:** applied "${sourceBrandingName}" ✓`);
        }
      } catch (err) {
        cloneFailures.push(`**Branding:** failed — ${err?.message || "unknown error"} ✗`);
      }

      // Email templates — independent step
      try {
        const sourceTemplates = sourceForm?.emailTemplates || [];
        const targetTemplateIds = new Set((targetForm?.emailTemplates || []).map((t) => String(t._id)));
        const missingTemplates = sourceTemplates.filter((t) => !targetTemplateIds.has(String(t._id)));
        if (!sourceTemplates.length) {
          cloneFailures.push("**Email templates:** source has none — skipped");
        } else if (!missingTemplates.length) {
          cloneFailures.push(`**Email templates:** all ${sourceTemplates.length} already attached — skipped`);
        } else if (ctx.actions.attachEmailTemplate) {
          await ctx.actions.attachEmailTemplate({
            formId: String(targetFormId),
            templateIds: missingTemplates.map((t) => String(t._id)),
          });
          cloneFailures.push(
            `**Email templates:** attached ${missingTemplates.map((t) => `"${t.name}"`).join(", ")} ✓`,
          );
        }
      } catch (err) {
        cloneFailures.push(`**Email templates:** failed — ${err?.message || "unknown error"} ✗`);
      }

      // Section updates — filter to valid target IDs and changed values, independent step
      try {
        const validSectionUpdates = (sectionUpdates || []).filter((u) => {
          const existing = targetSectionMap.get(String(u.sectionId));
          if (!existing) return false;
          const isEmpty = (v) => !v || v === "(not set)";
          if (u.displayText !== undefined && !isEmpty(u.displayText) && u.displayText !== existing.displayText)
            return true;
          if (
            u.signDisplayText !== undefined &&
            !isEmpty(u.signDisplayText) &&
            u.signDisplayText !== (existing.signDisplayText || existing.signFormatedDisplayText)
          )
            return true;
          if (
            u.aiCustomizablePrompt !== undefined &&
            !isEmpty(u.aiCustomizablePrompt) &&
            u.aiCustomizablePrompt !== existing.aiCustomizablePrompt
          )
            return true;
          if (u.aiFormatting !== undefined && !isEmpty(u.aiFormatting) && u.aiFormatting !== existing.ai_formatting)
            return true;
          if (u.isSignAiHelp !== undefined && u.isSignAiHelp !== existing.isSignAiHelp) return true;
          if (u.signAiPrompt !== undefined && !isEmpty(u.signAiPrompt) && u.signAiPrompt !== existing.signAiPrompt)
            return true;
          if (u.ownerSuggestions?.length) return true;
          return false;
        });
        if (validSectionUpdates.length && ctx.actions.updateSectionSettings) {
          await ctx.actions.updateSectionSettings({ updates: validSectionUpdates });
          cloneFailures.push(`**Section settings:** updated ${validSectionUpdates.length} section(s) ✓`);
        } else {
          cloneFailures.push("**Section settings:** all already matched — skipped");
        }
      } catch (err) {
        cloneFailures.push(`**Section settings:** failed — ${err?.message || "unknown error"} ✗`);
      }

      // Field updates — independent step
      try {
        const validFieldUpdates = (fieldUpdates || []).filter((u) => targetSectionMap.has(String(u.sectionId)));
        if (validFieldUpdates.length && ctx.actions.updateFieldSettings) {
          await ctx.actions.updateFieldSettings({ updates: validFieldUpdates });
          cloneFailures.push(`**Field settings:** updated fields in ${validFieldUpdates.length} section(s) ✓`);
        } else {
          cloneFailures.push("**Field settings:** all already matched — skipped");
        }
      } catch (err) {
        cloneFailures.push(`**Field settings:** failed — ${err?.message || "unknown error"} ✗`);
      }

      // Underwriting rules — independent step (always reported)
      try {
        if (ctx.actions.cloneRules) {
          const result = await ctx.actions.cloneRules({
            sourceFormId: String(sourceFormId),
            targetFormId: String(targetFormId),
          });
          if (result.cloned > 0) {
            cloneFailures.push(
              `**Underwriting rules:** cloned ${result.cloned} rule(s)${result.skipped ? ` (${result.skipped} already present — skipped)` : ""} ✓`,
            );
          } else if (result.skipped > 0) {
            cloneFailures.push(
              `**Underwriting rules:** all ${result.skipped} rule(s) already present on target — skipped ✓`,
            );
          } else {
            cloneFailures.push(
              `**Underwriting rules:** no rules were copied — no underwriting rules were found in the source form`,
            );
          }
        }
      } catch (err) {
        cloneFailures.push(`**Underwriting rules:** failed — ${err?.message || "unknown error"} ✗`);
      }

      const finalMessage = `Settings clone complete:\n\n${cloneFailures.join("\n")}`;
      addMessage({ role: "assistant", content: finalMessage });
      if (isVoiceModeRef.current) speak(finalMessage);
      return;
    }

    if (tool === "updateSectionSettings") {
      const { updates, sourceFormId } = args;
      const cloneResults = [];

      // Each step runs independently — a failure in one never prevents the others.
      if (sourceFormId) {
        const targetFormId = ctx.currentState?.detailedForm?._id;
        const forms = ctx.currentState?.forms || [];
        const sourceForm = forms.find((f) => String(f._id) === String(sourceFormId));
        const targetForm = forms.find((f) => String(f._id) === String(targetFormId));

        // Branding
        try {
          const sourceBrandingId = sourceForm?.branding?._id ? String(sourceForm.branding._id) : null;
          const sourceBrandingName = sourceForm?.branding?.name || sourceBrandingId;
          const targetBrandingId = targetForm?.branding?._id ? String(targetForm.branding._id) : null;
          if (!sourceBrandingId) {
            cloneResults.push("**Branding:** source has no branding — skipped");
          } else if (sourceBrandingId === targetBrandingId) {
            cloneResults.push(`**Branding:** already set to "${sourceBrandingName}" — skipped`);
          } else if (ctx.actions.setFormsBranding) {
            await ctx.actions.setFormsBranding({
              updates: [{ formId: String(targetFormId), brandingId: sourceBrandingId }],
            });
            cloneResults.push(`**Branding:** applied "${sourceBrandingName}" ✓`);
          }
        } catch (err) {
          cloneResults.push(`**Branding:** failed — ${err?.message || "unknown error"} ✗`);
        }

        // Email templates
        try {
          const sourceTemplates = sourceForm?.emailTemplates || [];
          const targetTemplateIds = new Set((targetForm?.emailTemplates || []).map((t) => String(t._id)));
          const missingTemplates = sourceTemplates.filter((t) => !targetTemplateIds.has(String(t._id)));
          if (!sourceTemplates.length) {
            cloneResults.push("**Email templates:** source has none — skipped");
          } else if (!missingTemplates.length) {
            cloneResults.push(`**Email templates:** all ${sourceTemplates.length} already attached — skipped`);
          } else if (ctx.actions.attachEmailTemplate) {
            await ctx.actions.attachEmailTemplate({
              formId: String(targetFormId),
              templateIds: missingTemplates.map((t) => String(t._id)),
            });
            cloneResults.push(
              `**Email templates:** attached ${missingTemplates.map((t) => `"${t.name}"`).join(", ")} ✓`,
            );
          }
        } catch (err) {
          cloneResults.push(`**Email templates:** failed — ${err?.message || "unknown error"} ✗`);
        }
      }

      // Section updates — filter to only valid sections in the current detailed form
      try {
        const targetSections = ctx.currentState?.detailedForm?.sections || [];
        const targetSectionMap = new Map(targetSections.map((s) => [String(s._id), s]));
        const validUpdates = (updates || []).filter((u) => targetSectionMap.has(String(u.sectionId)));
        if (validUpdates.length && ctx.actions.updateSectionSettings) {
          await ctx.actions.updateSectionSettings({ updates: validUpdates });
          const skipped = (updates || []).length - validUpdates.length;
          cloneResults.push(
            `**Section settings:** applied ${validUpdates.length} update(s)${skipped ? ` (${skipped} skipped — invalid section ID)` : ""} ✓`,
          );
        } else if ((updates || []).length && !validUpdates.length) {
          cloneResults.push(`**Section settings:** skipped — no updates matched valid sections in the current form ✗`);
        }
      } catch (err) {
        cloneResults.push(`**Section settings:** failed — ${err?.message || "unknown error"} ✗`);
      }

      // Underwriting rules — independent step
      if (sourceFormId) {
        const targetFormId = ctx.currentState?.detailedForm?._id;
        try {
          if (targetFormId && ctx.actions.cloneRules) {
            const result = await ctx.actions.cloneRules({
              sourceFormId: String(sourceFormId),
              targetFormId: String(targetFormId),
            });
            if (result.cloned > 0) {
              cloneResults.push(
                `**Underwriting rules:** cloned ${result.cloned} rule(s)${result.skipped ? ` (${result.skipped} already present — skipped)` : ""} ✓`,
              );
            } else if (result.skipped > 0) {
              cloneResults.push(
                `**Underwriting rules:** all ${result.skipped} rule(s) already present on target — skipped ✓`,
              );
            } else {
              cloneResults.push(
                `**Underwriting rules:** no rules were copied — no underwriting rules were found in the source form`,
              );
            }
          }
        } catch (err) {
          cloneResults.push(`**Underwriting rules:** failed — ${err?.message || "unknown error"} ✗`);
        }
      }

      // Pass results to AI continuation so it can incorporate them into its final summary
      const resultSummary = cloneResults.length
        ? `Completed form-level settings. Results:\n${cloneResults.join("\n")}\n\nNow continue with field updates if any, then produce a final summary that incorporates these results verbatim.`
        : "Section settings applied to preview. Continue with field updates if any, then summarise.";
      await continueAfterToolCall(tool, args, resultSummary, currentHistory, chatEndpoint, ctx);
      return;
    }

    if (tool === "updateFieldSettings") {
      const { updates } = args;
      try {
        if (ctx.actions.updateFieldSettings) await ctx.actions.updateFieldSettings({ updates });
        await continueAfterToolCall(
          tool,
          args,
          "Field settings applied to preview.",
          currentHistory,
          chatEndpoint,
          ctx,
        );
      } catch (err) {
        const detail = err?.data?.message || err?.message || "";
        addMessage({
          role: "assistant",
          content: `${wt("errorCouldnt")}${detail ? `: ${detail}` : ""}. ${wt("tryAgain")}`,
        });
      }
      return;
    }

    if (tool === "reorderSections") {
      const { sectionOrder, explanation } = args;
      try {
        if (ctx.actions.reorderSections) ctx.actions.reorderSections({ sectionOrder });
        await continueAfterToolCall(tool, args, "Sections reordered in preview.", currentHistory, chatEndpoint, ctx);
      } catch (err) {
        const detail = err?.data?.message || err?.message || "";
        addMessage({
          role: "assistant",
          content: `${wt("errorCouldnt")}${detail ? `: ${detail}` : ""}. ${wt("tryAgain")}`,
        });
      }
      return;
    }

    if (tool === "deleteSection") {
      const { sectionId, explanation } = args;
      try {
        if (ctx.actions.deleteSection) ctx.actions.deleteSection({ sectionId });
        await continueAfterToolCall(
          tool,
          args,
          "Section marked for deletion in preview.",
          currentHistory,
          chatEndpoint,
          ctx,
        );
      } catch (err) {
        const detail = err?.data?.message || err?.message || "";
        addMessage({
          role: "assistant",
          content: `${wt("errorCouldnt")}${detail ? `: ${detail}` : ""}. ${wt("tryAgain")}`,
        });
      }
      return;
    }

    if (tool === "saveFormEdits") {
      const { explanation } = args;
      try {
        if (ctx.actions.saveFormEdits) await ctx.actions.saveFormEdits();
        addMessage({ role: "assistant", content: explanation || "All changes have been saved to the form." });
        if (isVoiceModeRef.current) speak(explanation || "All changes have been saved.");
      } catch (err) {
        const detail = err?.data?.message || err?.message || "";
        addMessage({
          role: "assistant",
          content: `Save failed${detail ? `: ${detail}` : ""}. Some changes may not have been applied.`,
        });
      }
      return;
    }

    if (tool === "discardFormEdits") {
      const { explanation } = args;
      if (ctx.actions.discardFormEdits) ctx.actions.discardFormEdits();
      addMessage({ role: "assistant", content: explanation || "All pending changes have been discarded." });
      if (isVoiceModeRef.current) speak(explanation || "Pending changes discarded.");
      return;
    }

    if (tool === "updateForms") {
      const { explanation, updates } = args;
      try {
        if (ctx.actions.updateForms) await ctx.actions.updateForms({ updates });
        addMessage({ role: "assistant", content: explanation });
        if (isVoiceModeRef.current) speak(explanation);
      } catch (err) {
        const detail = err?.data?.message || err?.message || "";
        addMessage({
          role: "assistant",
          content: `${wt("errorCouldnt")}${detail ? `: ${detail}` : ""}. ${wt("tryAgain")}`,
        });
      }
      return;
    }

    if (tool === "setFormsBranding") {
      const { explanation, updates } = args;
      // Snapshot old branding per affected form before overwriting
      const forms = ctx.currentState?.forms || [];
      const snapshot = updates.map(({ formId }) => {
        const form = forms.find((f) => f._id === formId);
        return { formId, oldBrandingId: form?.branding?._id ?? null };
      });
      pushRevertable({
        description: `Applied branding to ${updates.length} form(s)`,
        revertFn: async (freshCtx) => {
          const revertUpdates = snapshot
            .filter((s) => s.oldBrandingId !== null)
            .map((s) => ({ formId: s.formId, brandingId: s.oldBrandingId }));
          const skipped = snapshot.filter((s) => s.oldBrandingId === null).length;
          if (revertUpdates.length > 0 && freshCtx?.actions?.setFormsBranding) {
            await freshCtx.actions.setFormsBranding({ updates: revertUpdates });
          }
          if (skipped > 0) {
            addMessage({
              role: "assistant",
              content: `Note: ${skipped} form(s) had no branding set before this change and cannot be automatically reverted to "no branding".`,
            });
          }
        },
      });
      try {
        if (ctx.actions.setFormsBranding) await ctx.actions.setFormsBranding({ updates });
        addMessage({ role: "assistant", content: explanation });
        if (isVoiceModeRef.current) speak(explanation);
      } catch (err) {
        const detail = err?.data?.message || err?.message || "";
        addMessage({
          role: "assistant",
          content: `${wt("errorCouldnt")}${detail ? `: ${detail}` : ""}. ${wt("tryAgain")}`,
        });
      }
      return;
    }

    if (tool === "setFormsLocation") {
      const { explanation, updates } = args;
      // Snapshot old locationStatus per affected form
      const forms = ctx.currentState?.forms || [];
      const snapshot = updates.map(({ formId }) => {
        const form = forms.find((f) => f._id === formId);
        return { formId, oldLocationStatus: form?.locationStatus ?? "disabled" };
      });
      pushRevertable({
        description: `Changed location setting on ${updates.length} form(s)`,
        revertFn: async (freshCtx) => {
          const revertUpdates = snapshot.map((s) => ({ formId: s.formId, locationStatus: s.oldLocationStatus }));
          if (freshCtx?.actions?.setFormsLocation) {
            await freshCtx.actions.setFormsLocation({ updates: revertUpdates });
          }
        },
      });
      try {
        if (ctx.actions.setFormsLocation) await ctx.actions.setFormsLocation({ updates });
        addMessage({ role: "assistant", content: explanation });
        if (isVoiceModeRef.current) speak(explanation);
      } catch (err) {
        const detail = err?.data?.message || err?.message || "";
        addMessage({
          role: "assistant",
          content: `${wt("errorCouldnt")}${detail ? `: ${detail}` : ""}. ${wt("tryAgain")}`,
        });
      }
      return;
    }

    if (tool === "deleteForms") {
      const { explanation, formIds } = args;
      try {
        if (ctx.actions.deleteForms) await ctx.actions.deleteForms({ formIds });
        addMessage({ role: "assistant", content: explanation });
        if (isVoiceModeRef.current) speak(explanation);
      } catch (err) {
        const detail = err?.data?.message || err?.message || "";
        addMessage({
          role: "assistant",
          content: `${wt("errorCouldnt")}${detail ? `: ${detail}` : ""}. ${wt("tryAgain")}`,
        });
      }
      return;
    }

    if (tool === "cloneForm") {
      const { explanation, sourceFormId, newName } = args;
      try {
        if (ctx.actions.cloneForm) {
          const result = await ctx.actions.cloneForm({ sourceFormId, newName });
          const rulesCloned = result?.rulesCloned ?? 0;
          const rulesNote =
            rulesCloned > 0
              ? `${rulesCloned} underwriting rule(s) cloned ✓`
              : "No rules were copied — no underwriting rules were found in the source form";
          await continueAfterToolCall(
            tool,
            args,
            `Form cloned successfully. New form: "${result?.name}" [${result?._id}]. All settings were copied from the source including branding, email templates, strategy linkage, section display text, owner suggestions, and field settings. **Rules:** ${rulesNote}. To verify owner suggestions and section-level settings, use selectFormForEditing on the new form.`,
            currentHistory,
            chatEndpoint,
            ctx,
          );
        }
      } catch (err) {
        const detail = err?.data?.message || err?.message || "";
        addMessage({
          role: "assistant",
          content: `${wt("errorCouldnt")}${detail ? `: ${detail}` : ""}. ${wt("tryAgain")}`,
        });
      }
      return;
    }

    if (tool === "attachEmailTemplate") {
      const { formId, templateIds } = args;
      try {
        if (ctx.actions.attachEmailTemplate) await ctx.actions.attachEmailTemplate({ formId, templateIds });
        await continueAfterToolCall(
          tool,
          args,
          "Email templates attached successfully.",
          currentHistory,
          chatEndpoint,
          ctx,
        );
      } catch (err) {
        const detail = err?.data?.message || err?.message || "";
        addMessage({
          role: "assistant",
          content: `${wt("errorCouldnt")}${detail ? `: ${detail}` : ""}. ${wt("tryAgain")}`,
        });
      }
      return;
    }

    if (tool === "detachEmailTemplate") {
      const { explanation, formId, templateIds } = args;
      try {
        if (ctx.actions.detachEmailTemplate) await ctx.actions.detachEmailTemplate({ formId, templateIds });
        addMessage({ role: "assistant", content: explanation });
        if (isVoiceModeRef.current) speak(explanation);
      } catch (err) {
        const detail = err?.data?.message || err?.message || "";
        addMessage({
          role: "assistant",
          content: `${wt("errorCouldnt")}${detail ? `: ${detail}` : ""}. ${wt("tryAgain")}`,
        });
      }
      return;
    }

    if (tool === "attachTemplateToForms") {
      const { explanation, formIds } = args;
      try {
        if (ctx.actions.attachToForms) await ctx.actions.attachToForms({ formIds });
        addMessage({ role: "assistant", content: explanation });
        if (isVoiceModeRef.current) speak(explanation);
      } catch (err) {
        const detail = err?.data?.message || err?.message || "";
        addMessage({
          role: "assistant",
          content: `${wt("errorCouldnt")}${detail ? `: ${detail}` : ""}. ${wt("tryAgain")}`,
        });
      }
      return;
    }

    if (tool === "openCreateFormModal") {
      const { explanation } = args;
      if (ctx.actions.openCreateFormModal) ctx.actions.openCreateFormModal();
      addMessage({ role: "assistant", content: explanation });
      if (isVoiceModeRef.current) speak(explanation);
      return;
    }

    if (tool === "previewFormStructure") {
      const { formName, sections, explanation } = args;
      addMessage({ role: "assistant", content: explanation, formPreview: { formName, sections } });
      if (isVoiceModeRef.current) speak(explanation);
      return;
    }

    if (tool === "readCsvFromPath") {
      const { filePath, explanation } = args;
      addMessage({ role: "assistant", content: explanation });
      try {
        const res = await fetch(`${SERVER_URL}/api/form/csv-from-path`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filePath }),
        });
        const d = await res.json();
        if (!d.success) throw new Error(d.message || "Could not read file");
        // Use the same phrasing as openCsvFilePicker so the formChat AI follows
        // the same CSV design workflow it uses after a manual file selection.
        const csvMessage = `Here is the CSV I selected as a starting point:\n\n**File:** ${d.filename}\n\`\`\`\n${d.content}\n\`\`\``;
        // Defer the send so applyToolCall can return first, the finally block can clear
        // isLoading, and React can re-render sendMessageRef with the updated loading state.
        // sendMessage guards with `if (isLoading) return` so calling it synchronously here
        // (while still inside applyToolCall) silently no-ops.
        setTimeout(() => {
          if (sendMessageRef.current) sendMessageRef.current(csvMessage);
        }, 100);
      } catch (err) {
        addMessage({ role: "assistant", content: `Could not read the file: ${err.message}` });
      }
      return;
    }

    if (tool === "openCsvFilePicker") {
      const { explanation } = args;
      addMessage({ role: "assistant", content: explanation });
      setTimeout(() => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".csv,text/csv";
        input.style.display = "none";
        document.body.appendChild(input);
        const cleanup = () => {
          if (document.body.contains(input)) document.body.removeChild(input);
        };
        input.onchange = async (e) => {
          const file = e.target.files?.[0];
          cleanup();
          if (!file) return;
          try {
            const text = await file.text();
            if (sendMessageRef.current) {
              await sendMessageRef.current(
                `Here is the CSV I selected as a starting point:\n\n**File:** ${file.name}\n\`\`\`\n${text}\n\`\`\``,
              );
            }
          } catch {
            addMessage({ role: "assistant", content: `${wt("errorCouldnt")}. ${wt("tryAgain")}` });
          }
        };
        input.addEventListener("cancel", cleanup);
        input.click();
      }, 100);
      return;
    }

    if (tool === "navigateToPage") {
      const { page, reason, followUpTask } = args;
      const route = PAGE_ROUTES[page];
      const label = PAGE_LABELS[page] || page;
      if (!route) return;

      addMessage({
        role: "assistant",
        content: `Navigating you to **${label}**. ${reason}`,
      });

      // Store follow-up so the screen-change effect can auto-send it
      pendingFollowUpRef.current = followUpTask;
      if (navTimeoutRef.current) clearTimeout(navTimeoutRef.current);
      // Safety: clear the follow-up after 15 s if the destination page never loads
      navTimeoutRef.current = setTimeout(() => {
        pendingFollowUpRef.current = null;
      }, 15000);

      setTimeout(() => navigate(route), 300);
      return;
    }

    if (tool === "generateFormCsv") {
      const { csvContent, filename, explanation } = args;
      // Attach the CSV to the message as a download action — the Save button in
      // ChatMessage triggers showSaveFilePicker from a real user click, which is
      // required by the browser's File System Access API security policy.
      addMessage({
        role: "assistant",
        content: explanation,
        csvDownload: { csvContent, filename },
      });
      if (isVoiceModeRef.current) speak(explanation);
      return;
    }

    // ── Applicant assistant tools ──────────────────────────────────────────────

    if (tool === "fillField") {
      const { fieldId } = args;
      const fieldMeta = ctx.currentState?.fields?.find((f) => f.id === fieldId);
      let value = args.value;

      // Normalise date values to YYYY-MM-DD so <input type="date"> accepts them
      if (fieldMeta?.type === "date" && value) {
        const parsed = new Date(value);
        if (!isNaN(parsed.getTime())) {
          const y = parsed.getFullYear();
          const m = String(parsed.getMonth() + 1).padStart(2, "0");
          const d = String(parsed.getDate()).padStart(2, "0");
          value = `${y}-${m}-${d}`;
        }
      }

      // Normalise phone numbers to E.164 format (+[country][number], digits only)
      if (
        fieldMeta?.type === "tel" ||
        fieldMeta?.type === "phone" ||
        /phone|mobile|cell/i.test(fieldId) ||
        /phone|mobile|cell/i.test(fieldMeta?.label || "")
      ) {
        if (value) {
          // Strip everything except digits and a leading +
          let digits = value.replace(/[^\d+]/g, "");
          // If no country code present, infer from already-filled address fields
          if (!digits.startsWith("+") && !digits.startsWith("00")) {
            const fields = ctx.currentState?.fields || [];
            const countryField = fields.find((f) => /country/i.test(f.label) || /country/i.test(f.id));
            const stateField = fields.find((f) => /\bstate\b/i.test(f.label) || /\bstate\b/i.test(f.id));
            const countryVal = (countryField?.value || "").toLowerCase();
            const stateVal = (stateField?.value || "").toLowerCase();
            const isUS =
              /^(us|usa|united states)$/.test(countryVal) ||
              /^(al|ak|az|ar|ca|co|ct|de|fl|ga|hi|id|il|in|ia|ks|ky|la|me|md|ma|mi|mn|ms|mo|mt|ne|nv|nh|nj|nm|ny|nc|nd|oh|ok|or|pa|ri|sc|sd|tn|tx|ut|vt|va|wa|wv|wi|wy|dc)$/.test(
                stateVal,
              );
            digits = (isUS || (!countryVal && !stateVal) ? "+1" : "+") + digits;
          } else if (digits.startsWith("00")) {
            digits = "+" + digits.slice(2);
          }
          value = digits;
        }
      }
      console.log(
        `%c[TOOL:fillField] about to fill — fieldId="${fieldId}" value="${value}" (raw args.value="${args.value}")`,
        "color:#e05; font-weight:bold",
      );
      try {
        if (ctx.actions.fillField) {
          // Dodge panel so user can see the field being filled
          const fillEl = document.getElementById(fieldId) || document.querySelector(`[name="${CSS.escape(fieldId)}"]`);
          activatedFieldIdRef.current = fieldId;
          dodgeForField(fillEl);
          await ctx.actions.fillField({ fieldId, value });
          // Record every confirmed fill so goToNextStep can emit a session-wide lookup block.
          if (value) confirmedValuesRef.current[fieldId] = value;
          // Patch the context so the AI sees this field as filled — React won't have
          // re-rendered yet, so the ref still carries the stale pre-fill state.
          const patchedCtx = {
            ...ctx,
            currentState: {
              ...ctx.currentState,
              fields:
                ctx.currentState?.fields?.map((f) => (f.id === fieldId ? { ...f, value, filled: true } : f)) ?? [],
            },
          };
          // Build continuation result — tell the AI to advance to the next field in list order.
          let fillResultMsg = `Field "${fieldId}" filled with "${value}" successfully.`;
          if (assistantMode === "applicant") {
            fillResultMsg =
              `[FILL_CONFIRMED] Field "${fieldId}" filled with "${value}". ` +
              `Do NOT apply Rule 3 (pre-filled confirmation) to this field. ` +
              `Call openFieldPanel for the next empty field after "${fieldId}" in list order immediately — pure tool call only, zero chat text.`;
          }
          // Send the function result back so the AI confirms the fill and immediately
          // asks for the next required field without waiting for user input.
          await continueAfterToolCall(tool, args, fillResultMsg, currentHistory, chatEndpoint, patchedCtx);
        }
      } catch (err) {
        const detail = err?.message || "";
        addMessage({
          role: "assistant",
          content: `${wt("errorCouldnt")}${detail ? `: ${detail}` : ""}. ${wt("tryAgain")}`,
        });
      }
      return;
    }

    if (tool === "fillSignature") {
      const { fieldId, name, explanation } = args;
      // Dispatch a custom event to the SignatureBox — it handles rendering + saving.
      const sigEl = fieldId
        ? document.querySelector(`[data-ai-id="${CSS.escape(fieldId)}"]`)
        : document.querySelector('[data-ai-type="sign"]');
      if (sigEl) {
        sigEl.dispatchEvent(new CustomEvent("ai:fill-signature", { detail: { name }, bubbles: false }));
        addMessage({ role: "assistant", content: explanation });
        if (isVoiceModeRef.current) speak(explanation);
        // Wait for the signature save to complete before telling the AI to continue.
        // SignatureBox.onSave is async (API upload); it sets data-ai-value="signed" on the
        // wrapper only after the parent updates oldSignatureUrl. A MutationObserver on that
        // attribute is the minimal reactive wait — zero polling, zero side effects elsewhere.
        if (sigEl.getAttribute("data-ai-value") !== "signed") {
          await new Promise((resolve) => {
            const timeout = setTimeout(resolve, 12000); // 12s hard cap
            const observer = new MutationObserver(() => {
              if (sigEl.getAttribute("data-ai-value") === "signed") {
                clearTimeout(timeout);
                observer.disconnect();
                resolve();
              }
            });
            observer.observe(sigEl, { attributes: true, attributeFilter: ["data-ai-value"] });
          });
        }
        // Build continuation result — tell the AI to advance to the next field in list order.
        let sigResultMsg = `Typed signature "${name}" recorded on the signature field.`;
        if (assistantMode === "applicant") {
          sigResultMsg =
            `[FILL_CONFIRMED] You just recorded signature "${name}" in this exchange — the applicant provided this name moments ago. ` +
            `Do NOT apply Rule 3 (pre-filled confirmation) to the signature field. ` +
            `Move immediately to the next field after the signature in the list order. Do not go back to any previous field.`;
        }
        // Patch context so the AI sees the signature field as filled — same pattern as fillField.
        const patchedCtx = {
          ...ctx,
          currentState: {
            ...ctx.currentState,
            fields:
              ctx.currentState?.fields?.map((f) =>
                f.isSignature || f.id === fieldId ? { ...f, value: "signed", filled: true } : f,
              ) ?? [],
          },
        };
        await continueAfterToolCall(tool, args, sigResultMsg, currentHistory, chatEndpoint, patchedCtx);
      } else {
        addMessage({ role: "assistant", content: wt("errorCouldnt") + ". " + wt("tryAgain") });
      }
      return;
    }

    if (tool === "openFieldPanel") {
      const { fieldId, explanation } = args;
      const fieldMeta = ctx.currentState?.fields?.find((f) => f.id === fieldId);
      const fieldLabel = fieldMeta?.label || fieldId;
      const fieldMode = fieldMeta?.fieldMode || "direct";

      // Guard: openFieldPanel must never be called for radio or select fields.
      // If the AI does it anyway, send an error back so it corrects itself.
      if (fieldMeta?.type === "radio" || fieldMeta?.type === "select") {
        const optionsList =
          Array.isArray(fieldMeta.options) && fieldMeta.options.length
            ? fieldMeta.options
                .map((o, i) => `${String.fromCharCode(97 + i)}) ${o.label} [value: ${o.value}]`)
                .join(", ")
            : "(no options available)";
        await continueAfterToolCall(
          tool,
          args,
          `ERROR: openFieldPanel cannot be used for "${fieldLabel}" because it is a ${fieldMeta.type} field. ` +
            `You MUST output a chat message listing options instead and wait for the applicant's choice, then call fillField. ` +
            `Field options: ${optionsList}. Do NOT call openFieldPanel again for this field.`,
          currentHistory,
          chatEndpoint,
          ctx,
        );
        return;
      }

      // Show the AI's explanation as a chat message first
      if (explanation) {
        addMessage({ role: "assistant", content: explanation });
        if (isVoiceModeRef.current) speak(explanation);
      }

      // Store history + ctx for use in the completion callback
      adePanelCallbackRef.current = { args, history: currentHistory, ctx };

      // Scroll the chat panel so the ADE panel is visible
      setTimeout(() => scrollToBottom(), 100);

      // Dodge toward the target field so the panel doesn't cover it
      const targetEl =
        document.getElementById(fieldId) ||
        document.querySelector(`[name="${CSS.escape(fieldId)}"]`) ||
        document.querySelector(`[data-ai-id="${CSS.escape(fieldId)}"]`);
      if (targetEl) setTimeout(() => dodgeForField(targetEl), 200);

      setAdePanel({ fieldId, fieldLabel, fieldMode, required: fieldMeta?.required ?? true });
      return;
    }

    if (tool === "scrollToField") {
      const { fieldId } = args;
      // Always silent — scrollToField never produces a chat message or spoken output.
      if (ctx.actions.scrollToField) {
        ctx.actions.scrollToField({ fieldId });
      } else {
        const el = document.getElementById(fieldId) || document.querySelector(`[name="${fieldId}"]`);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      // Keep focus in the chat input, not on the scrolled-to field.
      if (assistantMode === "applicant") {
        setTimeout(() => inputRef.current?.focus(), 50);
      }
      // Send result back so the AI can continue to the next action (e.g. openFieldPanel).
      await continueAfterToolCall(
        tool,
        args,
        `Scrolled to field "${fieldId}". Now call openFieldPanel for this field — Data Collection rules apply. Do NOT use activateField or output chat text.`,
        currentHistory,
        chatEndpoint,
        ctx,
      );
      return;
    }

    if (tool === "activateField") {
      const { fieldId, explanation } = args;
      const el = document.getElementById(fieldId) || document.querySelector(`[name="${CSS.escape(fieldId)}"]`);
      activatedFieldIdRef.current = fieldId;
      // Always suppress the post-response chat auto-focus, even if the element
      // isn't found yet — we don't want the chat input stealing focus.
      suppressChatFocusRef.current = true;
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        // After scroll settles: re-snap to ensure field is in viewport, then
        // dodge the panel if it overlaps, then focus.
        setTimeout(() => {
          // Re-look up in case React recreated the element during the wait
          const target =
            document.getElementById(fieldId) || document.querySelector(`[name="${CSS.escape(fieldId)}"]`) || el;
          if (!target) {
            suppressChatFocusRef.current = false;
            return;
          }
          target.scrollIntoView({ behavior: "instant", block: "center" });

          // Only move focus if the user hasn't already navigated to a different form field.
          // If they clicked/tabbed somewhere else while waiting for the AI response, respect that.
          // Also skip if the user is already on this exact field (don't disrupt mid-typing with select()).
          const active = document.activeElement;
          const alreadyOnTarget = active === target;
          const userMovedElsewhere =
            !alreadyOnTarget &&
            active &&
            active !== inputRef.current &&
            ["INPUT", "SELECT", "TEXTAREA"].includes(active.tagName);
          if (!alreadyOnTarget && !userMovedElsewhere) {
            target.focus();
            try {
              target.select();
            } catch (_) {}
          }

          dodgeForField(target);
          // Release the chat-focus suppression shortly after so normal state can resume.
          setTimeout(() => {
            suppressChatFocusRef.current = false;
          }, 400);
        }, 400);
      }
      addMessage({ role: "assistant", content: explanation });
      if (isVoiceModeRef.current) speak(explanation);
      return;
    }

    if (tool === "submitOtpCode") {
      const { otp, email } = args;
      console.log(
        "%c[AI:submitOtpCode] tool fired — email=%s otp=%s screenId=%s",
        "color:#ea580c; font-weight:bold",
        email,
        otp,
        ctx?.screenId,
      );
      console.log(
        "%c[AI:submitOtpCode] context fields=%o  actions=%o",
        "color:#ea580c",
        ctx?.currentState?.fields?.map((f) => ({ id: f.id, value: f.value, filled: f.filled })),
        Object.keys(ctx?.actions || {}),
      );
      if (ctx.actions.fillField) ctx.actions.fillField({ fieldId: "otp-field", value: otp });
      let resultSummary;
      try {
        if (ctx.actions.verifyOtpCode) await ctx.actions.verifyOtpCode({ otp, email });
        resultSummary = "OTP verification succeeded. The applicant's email is now verified.";
        // Record the verified email so Step 1 on any later page can match it purely by
        // value — the synthetic key "_otp_email" is unambiguous (not a real field ID).
        if (email) confirmedValuesRef.current["_otp_email"] = email;
        console.log("%c[AI:submitOtpCode] ✓ verification succeeded", "color:#16a34a; font-weight:bold");
      } catch (err) {
        const detail = err?.data?.message || err?.message || "";
        resultSummary = `OTP verification failed${detail ? `: ${detail}` : ""}. Ask the applicant whether they entered the code correctly and invite them to try again.`;
        console.error(
          "%c[AI:submitOtpCode] ✗ verification failed — detail=%s",
          "color:#dc2626; font-weight:bold",
          detail,
        );
      }
      console.log("%c[AI:submitOtpCode] resultSummary → %s", "color:#ea580c", resultSummary);
      await continueAfterToolCall(tool, args, resultSummary, currentHistory, chatEndpoint, ctx);
      return;
    }

    if (tool === "submitEmailForOtp") {
      const { email } = args;
      console.log(
        "%c[AI:submitEmailForOtp] tool fired — email=%s screenId=%s",
        "color:#ea580c; font-weight:bold",
        email,
        ctx?.screenId,
      );
      console.log(
        "%c[AI:submitEmailForOtp] context fields=%o  actions=%o",
        "color:#ea580c",
        ctx?.currentState?.fields?.map((f) => ({ id: f.id, value: f.value, filled: f.filled })),
        Object.keys(ctx?.actions || {}),
      );
      if (ctx.actions.fillField) ctx.actions.fillField({ fieldId: "email-field", value: email });
      let resultSummary;
      try {
        if (ctx.actions.sendOtpForEmail) await ctx.actions.sendOtpForEmail({ email });
        resultSummary = `OTP email sent successfully to ${email}. Tell the applicant to check their inbox and spam folder, then come back and provide the code.`;
        console.log("%c[AI:submitEmailForOtp] ✓ OTP sent", "color:#16a34a; font-weight:bold");
      } catch (err) {
        const detail = err?.data?.message || err?.message || "";
        resultSummary = `Failed to send OTP email to ${email}${detail ? `: ${detail}` : ""}. Let the applicant know and ask them to check the email address or try again.`;
        console.error("%c[AI:submitEmailForOtp] ✗ send failed — detail=%s", "color:#dc2626; font-weight:bold", detail);
      }
      console.log("%c[AI:submitEmailForOtp] resultSummary → %s", "color:#ea580c", resultSummary);
      await continueAfterToolCall(tool, args, resultSummary, currentHistory, chatEndpoint, ctx);
      return;
    }

    if (tool === "goToNextStep") {
      if (ctx.actions.goToNextStep) await ctx.actions.goToNextStep();
      // Wait for React to re-render with the new step's fields (or for navigation to complete)
      await new Promise((r) => setTimeout(r, 150));
      const freshCtx = getScreenContext();
      // If the page navigated away (context null or different screenId), the screen-change
      // effect and autoGuide handle the transition — nothing more needed here.
      if (!freshCtx || freshCtx.screenId !== ctx.screenId) return;
      // Build a compact confirmed-values block so the AI can do Step 1 matching on the
      // next page without relying on scanning conversation history.
      const confirmedEntries = Object.entries(confirmedValuesRef.current);
      const confirmedBlock =
        confirmedEntries.length > 0
          ? ` [CONFIRMED THIS SESSION: ${confirmedEntries.map(([k, v]) => `${k}="${v}"`).join(", ")}]`
          : "";
      await continueAfterToolCall(
        tool,
        args,
        `Moved to the next step successfully.${confirmedBlock}`,
        currentHistory,
        chatEndpoint,
        freshCtx,
      );
      return;
    }

    if (tool === "enterTranslationMode") {
      const { language, languageName, explanation } = args;
      const mode = { lang: language, langName: languageName };
      translationModeRef.current = mode;
      setTranslationMode(mode);
      tooltipCacheRef.current = {}; // clear cached translations from any previous language
      addMessage({ role: "assistant", content: explanation || "" });
      return;
    }

    if (tool === "goToPrevStep") {
      if (ctx.actions.goToPrevStep) await ctx.actions.goToPrevStep();
      await new Promise((r) => setTimeout(r, 150));
      const freshCtx = getScreenContext();
      if (!freshCtx || freshCtx.screenId !== ctx.screenId) return;
      await continueAfterToolCall(
        tool,
        args,
        "Moved to the previous step successfully.",
        currentHistory,
        chatEndpoint,
        freshCtx,
      );
      return;
    }

    // ── Testing Assistant tools ────────────────────────────────────────────────

    if (tool === "createTestCase") {
      const { explanation, ...fields } = args;
      try {
        if (ctx.actions.createTestCase) await ctx.actions.createTestCase({ explanation, ...fields });
        addMessage({ role: "assistant", content: explanation });
        if (isVoiceModeRef.current) speak(explanation);
      } catch (err) {
        const detail = err?.message || "";
        addMessage({
          role: "assistant",
          content: `Couldn't create the test case${detail ? `: ${detail}` : ""}. Please try again.`,
        });
      }
      return;
    }

    if (tool === "updateTestCase") {
      const { explanation, ...fields } = args;
      try {
        if (ctx.actions.updateTestCase) await ctx.actions.updateTestCase({ explanation, ...fields });
        addMessage({ role: "assistant", content: explanation });
        if (isVoiceModeRef.current) speak(explanation);
      } catch (err) {
        const detail = err?.message || "";
        addMessage({
          role: "assistant",
          content: `Couldn't update the test case${detail ? `: ${detail}` : ""}. Please try again.`,
        });
      }
      return;
    }

    if (tool === "deleteTestCases") {
      const { testCaseIds, explanation } = args;
      try {
        if (ctx.actions.deleteTestCases) await ctx.actions.deleteTestCases({ testCaseIds, explanation });
        addMessage({ role: "assistant", content: explanation });
        if (isVoiceModeRef.current) speak(explanation);
      } catch (err) {
        const detail = err?.message || "";
        addMessage({
          role: "assistant",
          content: `Couldn't delete the test case(s)${detail ? `: ${detail}` : ""}. Please try again.`,
        });
      }
      return;
    }

    if (tool === "duplicateTestCase") {
      const { explanation, testCaseId, newName } = args;
      try {
        if (ctx.actions.duplicateTestCase) await ctx.actions.duplicateTestCase({ testCaseId, newName, explanation });
        addMessage({ role: "assistant", content: explanation });
        if (isVoiceModeRef.current) speak(explanation);
      } catch (err) {
        const detail = err?.message || "";
        addMessage({
          role: "assistant",
          content: `Couldn't duplicate the test case${detail ? `: ${detail}` : ""}. Please try again.`,
        });
      }
      return;
    }

    if (tool === "openEditor") {
      const { testCaseId, explanation } = args;
      if (ctx.actions.openEditor) ctx.actions.openEditor({ testCaseId, explanation });
      addMessage({ role: "assistant", content: explanation });
      if (isVoiceModeRef.current) speak(explanation);
      return;
    }

    if (tool === "setFilterArea") {
      const { area, explanation } = args;
      if (ctx.actions.setFilterArea) ctx.actions.setFilterArea({ area, explanation });
      addMessage({ role: "assistant", content: explanation });
      if (isVoiceModeRef.current) speak(explanation);
      return;
    }

    if (tool === "seedFromStatic") {
      const { explanation } = args;
      try {
        if (ctx.actions.seedFromStatic) await ctx.actions.seedFromStatic({ explanation });
        addMessage({ role: "assistant", content: explanation });
        if (isVoiceModeRef.current) speak(explanation);
      } catch (err) {
        const detail = err?.message || "";
        addMessage({
          role: "assistant",
          content: `Couldn't seed from static files${detail ? `: ${detail}` : ""}. Please try again.`,
        });
      }
      return;
    }

    // ── Demo Builder tools ─────────────────────────────────────────────────────

    if (tool === "updateBuilderSteps") {
      const { message, ...stepsData } = args;
      if (ctx.actions.updateBuilderSteps) ctx.actions.updateBuilderSteps(stepsData);
      addMessage({
        role: "assistant",
        content: null,
        function_call: { name: "updateBuilderSteps", arguments: JSON.stringify(args) },
      });
      addMessage({
        role: "function",
        name: "updateBuilderSteps",
        content: `Steps replaced. New step count: ${stepsData.steps?.length ?? 0}.`,
      });
      addMessage({ role: "assistant", content: message });
      if (isVoiceModeRef.current) speak(message);
      return;
    }

    if (tool === "addStepToBuilder") {
      const { message, ...stepData } = args;
      if (ctx.actions.addStepToBuilder) ctx.actions.addStepToBuilder(stepData);
      const stepDesc = `${stepData.step?.action || ""}${stepData.step?.selector ? ` ${stepData.step.selector}` : ""}${stepData.step?.value ? ` "${stepData.step.value}"` : ""}`;
      addMessage({
        role: "assistant",
        content: null,
        function_call: { name: "addStepToBuilder", arguments: JSON.stringify(args) },
      });
      addMessage({
        role: "function",
        name: "addStepToBuilder",
        content: `Step confirmed and added: ${stepDesc}. Do NOT add this step again.`,
      });
      addMessage({ role: "assistant", content: message });
      if (isVoiceModeRef.current) speak(message);
      return;
    }

    if (tool === "buildDemoAction") {
      const { explanation, ...actionData } = args;
      if (ctx.actions.buildDemoAction) ctx.actions.buildDemoAction(actionData);
      addMessage({ role: "assistant", content: explanation });
      if (isVoiceModeRef.current) speak(explanation);
      return;
    }

    if (tool === "saveDemoAction") {
      const { explanation, ...saveData } = args;
      try {
        if (ctx.actions.saveDemoAction) await ctx.actions.saveDemoAction(saveData);
        addMessage({ role: "assistant", content: explanation });
        if (isVoiceModeRef.current) speak(explanation);
      } catch (err) {
        const detail = err?.message || "";
        addMessage({
          role: "assistant",
          content: `Couldn't save the demo action${detail ? `: ${detail}` : ""}. Please try again.`,
        });
      }
      return;
    }

    if (tool === "selectFeatures") {
      const { explanation, ...selectData } = args;
      if (ctx.actions.selectFeatures) ctx.actions.selectFeatures(selectData);
      addMessage({ role: "assistant", content: explanation });
      if (isVoiceModeRef.current) speak(explanation);
      return;
    }

    if (tool === "setNarrationInstructions") {
      const { explanation, ...instrData } = args;
      if (ctx.actions.setNarrationInstructions) ctx.actions.setNarrationInstructions(instrData);
      addMessage({ role: "assistant", content: explanation });
      if (isVoiceModeRef.current) speak(explanation);
      return;
    }
  };

  // ── Assisted Direct Entry (ADE) panel callbacks ────────────────────────────
  const handleAdePanelComplete = useCallback(
    async (value) => {
      const pending = adePanelCallbackRef.current;
      if (!pending) return;
      adePanelCallbackRef.current = null;
      setAdePanel(null);

      const { args, history, ctx } = pending;
      const { fieldId } = args;
      const fieldMeta = ctx.currentState?.fields?.find((f) => f.id === fieldId);
      const fieldLabel = fieldMeta?.label || fieldId;
      const fieldMode = fieldMeta?.fieldMode || "direct";
      const defaultEndpoint =
        assistantMode === "applicant" ? `${SERVER_URL}/api/ai/applicant-chat` : `${SERVER_URL}/api/ai/branding-chat`;
      const chatEndpoint = ctx?.aiEndpoint || defaultEndpoint;

      if (fieldMode === "secure") {
        // Fill DOM directly — value never travels to AI server
        if (ctx.actions.fillField) {
          await ctx.actions.fillField({ fieldId, value });
        }
        const patchedCtx = {
          ...ctx,
          currentState: {
            ...ctx.currentState,
            fields:
              ctx.currentState?.fields?.map((f) =>
                f.id === fieldId ? { ...f, value: "[secure]", filled: true } : f,
              ) ?? [],
          },
        };
        await continueAfterToolCall(
          "openFieldPanel",
          args,
          `SECURE_PANEL_COMPLETE: Field "${fieldLabel}" was filled securely. The value was captured locally and was NOT transmitted to AI — do not ask for or repeat it. Mark this field as complete and move to the next field in list order.`,
          history,
          chatEndpoint,
          patchedCtx,
        );
      } else {
        // Direct entry — use provided value (read from DOM by ADEPanel)
        const filledValue = value || "";

        // Detect whether this is a Google Places field (for result summary messaging).
        const targetEl = document.getElementById(fieldId) || document.querySelector(`[name="${CSS.escape(fieldId)}"]`);
        const isPlaces =
          targetEl?.getAttribute?.("data-ai-type") === "places" || !!targetEl?.closest?.("[data-places-input]");

        // For Places fields: React may not have committed city/state/zip/country values
        // to the DOM yet (onPlaceChanged -> setState -> async re-render).  Wait long enough
        // for the commit to land before we read any DOM values.
        if (isPlaces) {
          await new Promise((resolve) => setTimeout(resolve, 400));
        }

        // Always re-read ALL field values from the live DOM when building patchedFields.
        // The ctx snapshot saved in adePanelCallbackRef may be stale — e.g. Google Places
        // auto-fills city/state/zip/country after the snapshot was taken.  Reading the DOM
        // here ensures every subsequent AI turn sees the true current field state.
        const patchedFields =
          ctx.currentState?.fields?.map((f) => {
            if (f.id === fieldId) return { ...f, value: filledValue, filled: !!filledValue };
            if (f.isSignature) return f; // no standard input element
            let domValue, domFilled;
            if (f.type === "radio") {
              const checked = document.querySelector(`input[name="${CSS.escape(f.id)}"]:checked`);
              domValue = checked?.value || "";
              domFilled = !!domValue;
            } else {
              const el = document.getElementById(f.id) || document.querySelector(`[name="${CSS.escape(f.id)}"]`);
              if (!el) return f;
              if (f.type === "checkbox") {
                domValue = el.checked ? "true" : "false";
                domFilled = el.checked;
              } else {
                domValue = el.value || "";
                const isPhone =
                  f.type === "tel" || /phone|mobile|cell/i.test(f.id || "") || /phone|mobile|cell/i.test(el.name || "");
                domFilled = isPhone ? (domValue.match(/\d/g) || []).length >= 7 : !!domValue.trim();
              }
            }
            return { ...f, value: domValue, filled: domFilled };
          }) ?? [];

        const patchedCtx = {
          ...ctx,
          currentState: { ...ctx.currentState, fields: patchedFields },
        };

        const isRequired = fieldMeta?.required ?? false;

        // Record every panel completion in confirmedValuesRef so the Step 2
        // EMPTY_AT_SCAN check doesn't re-collect this field next turn.
        // Includes Places fields — the street address field itself is never written
        // by fillField in the Places flow, so it must be recorded here.
        if (filledValue) {
          confirmedValuesRef.current[fieldId] = filledValue;
        }

        // When Places fills address sub-fields, record them in confirmedValuesRef so the
        // Step 2 EMPTY_AT_SCAN check treats them as already-confirmed and skips them.
        if (isPlaces) {
          const originalFields = ctx.currentState?.fields ?? [];
          for (const pf of patchedFields) {
            if (pf.id === fieldId) continue; // primary field already recorded above
            if (!pf.filled || !pf.value) continue;
            const original = originalFields.find((f) => f.id === pf.id);
            if (!original?.filled) {
              confirmedValuesRef.current[pf.id] = pf.value;
            }
          }
        }

        // For Places completions, append a fresh CONFIRMED block so the AI sees the
        // newly-recorded city/state/zip/country values and skips them in Step 2.
        const placesConfirmedBlock = (() => {
          if (!isPlaces) return "";
          const entries = Object.entries(confirmedValuesRef.current);
          return entries.length > 0
            ? ` [CONFIRMED THIS SESSION: ${entries.map(([k, v]) => `${k}="${v}"`).join(", ")}]`
            : "";
        })();

        const resultSummary = isPlaces
          ? `PLACES_COMPLETE: Google Places address selected — "${filledValue}". Address sub-fields (city, state, zip/postal, country, etc.) have been auto-populated by the Places API; their updated values are in the field list. Skip any address sub-fields that are now filled — do NOT ask the applicant to re-enter them. Move to the next empty field after the address block (address line 2 if empty, then any non-address field).${placesConfirmedBlock}`
          : filledValue
            ? `Field "${fieldLabel}" filled with "${filledValue}" via direct entry.`
            : isRequired
              ? `panel dismissed without a value — field is still empty and required`
              : `panel dismissed without a value — field is still empty and optional`;

        await continueAfterToolCall("openFieldPanel", args, resultSummary, history, chatEndpoint, patchedCtx);
      }
    },
    [continueAfterToolCall],
  ); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAdePanelCancel = useCallback(async () => {
    const pending = adePanelCallbackRef.current;
    adePanelCallbackRef.current = null;
    setAdePanel(null);
    if (!pending) return;

    const { args, history, ctx } = pending;
    const { fieldId } = args;
    const fieldMeta = ctx.currentState?.fields?.find((f) => f.id === fieldId);
    const fieldLabel = fieldMeta?.label || fieldId;
    const isRequired = fieldMeta?.required ?? false;
    const defaultEndpoint =
      assistantMode === "applicant" ? `${SERVER_URL}/api/ai/applicant-chat` : `${SERVER_URL}/api/ai/branding-chat`;
    const chatEndpoint = ctx?.aiEndpoint || defaultEndpoint;

    await continueAfterToolCall(
      "openFieldPanel",
      args,
      isRequired
        ? `panel dismissed without a value — field is still empty and required`
        : `panel dismissed without a value — field is still empty and optional`,
      history,
      chatEndpoint,
      ctx,
    );
  }, [continueAfterToolCall, assistantMode]); // eslint-disable-line react-hooks/exhaustive-deps

  // When a "direct" ADE panel opens, temporarily re-enable the target field only.
  //
  // • Google Places field → enable ONLY the Places autocomplete input.
  // ── Pre-fill confirmation handlers (basic mode) ───────────────────────────
  const handlePreFillConfirm = useCallback(() => {
    setPreFillModal(null);
  }, []);

  const handlePreFillSkip = useCallback(() => {
    setPreFillModal(null);
  }, []);

  // ── Field-error modal handlers (basic mode) ───────────────────────────────

  // Shared: re-fires the button click that was intercepted while the error was pending.
  // Called after the modal closes so the original action continues uninterrupted.
  const replayBlockedClick = useCallback(() => {
    const el = blockedClickTargetRef.current;
    blockedClickTargetRef.current = null;
    pendingFieldErrorRef.current = null;
    if (el) setTimeout(() => el.click(), 0);
  }, []);

  const handleFieldErrorKeep = useCallback(() => {
    if (!fieldErrorModal) return;
    const { fieldId, currentValue } = fieldErrorModal;
    // Mark this value confirmed so the same error won't fire again for this field+value
    if (!confirmedErrorsRef.current[fieldId]) confirmedErrorsRef.current[fieldId] = new Set();
    confirmedErrorsRef.current[fieldId].add(currentValue);
    setFieldErrorModal(null);
    replayBlockedClick();
  }, [fieldErrorModal, replayBlockedClick]);

  const handleFieldErrorSave = useCallback(
    async (correctedValue) => {
      if (!fieldErrorModal) return;
      const { fieldId } = fieldErrorModal;
      setFieldErrorModal(null);
      const ctx = getScreenContext();
      if (ctx?.actions?.fillField) {
        const el = document.getElementById(fieldId) || document.querySelector(`[name="${CSS.escape(fieldId)}"]`);
        if (el) dodgeForField(el);
        await ctx.actions.fillField({ fieldId, value: correctedValue });
      }
      // Re-fire the blocked click after the corrected value has been written to the field
      replayBlockedClick();
    },
    [fieldErrorModal, replayBlockedClick],
  ); // eslint-disable-line react-hooks/exhaustive-deps

  //   The address sub-fields (city, state, zip, country, etc.) stay disabled for
  //   direct user interaction — the Places API populates them programmatically via
  //   React state when the user selects a suggestion, which works regardless of the
  //   disabled attribute.
  //
  // • Any other direct field → enable only that specific field.
  //
  // The cleanup re-disables everything when the panel closes.
  useEffect(() => {
    if (!adePanel || adePanel.fieldMode !== "direct") return;

    const targetEl =
      document.getElementById(adePanel.fieldId) ||
      document.querySelector(`[name="${CSS.escape(adePanel.fieldId)}"]`) ||
      document.querySelector(`[data-ai-id="${CSS.escape(adePanel.fieldId)}"]`);

    // Enable the target element and any sibling inputs within the same
    // PhoneInput container (e.g. the country <select> rendered internally by
    // react-phone-number-input, which has no id/name matching fieldId).
    const phoneContainer = targetEl?.closest?.(".PhoneInput") || null;
    const toEnable = maxHelpDisabledElsRef.current.filter((el) => {
      if (el === targetEl) return true;
      const id = el.id || el.getAttribute?.("name") || el.getAttribute?.("data-ai-id") || "";
      if (id === adePanel.fieldId) return true;
      if (phoneContainer && phoneContainer.contains(el)) return true;
      return false;
    });
    if (targetEl && !toEnable.includes(targetEl)) toEnable.unshift(targetEl);

    for (const el of toEnable) el.disabled = false;

    // Re-enable signature wrappers blocked via pointer-events (not .disabled).
    // Re-enable the matched wrapper AND any sign wrappers nested inside it
    // (e.g. SignatureBox renders its own data-ai-type="sign" div inside the outer wrapper).
    const signToEnable = maxHelpDisabledSignsRef.current.filter((wrapper) => {
      if (wrapper === targetEl) return true;
      const wId = wrapper.getAttribute?.("data-ai-id") || "";
      if (wId === adePanel.fieldId) return true;
      if (targetEl && targetEl.contains(wrapper)) return true;
      return false;
    });
    for (const wrapper of signToEnable) {
      wrapper.style.pointerEvents = "";
      wrapper.style.opacity = "";
      wrapper.style.userSelect = "";
      restoreSignTabOrder(wrapper);
    }

    return () => {
      for (const el of toEnable) el.disabled = true;
      for (const wrapper of signToEnable) {
        wrapper.style.pointerEvents = "none";
        wrapper.style.opacity = "0.55";
        wrapper.style.userSelect = "none";
        blockSignTabOrder(wrapper);
      }
    };
  }, [adePanel]); // eslint-disable-line react-hooks/exhaustive-deps

  // Scroll to bottom when the ADE panel opens or closes — its height affects the layout.
  useEffect(() => {
    setTimeout(() => scrollToBottom(), 50);
  }, [adePanel, scrollToBottom]);

  // Handle action buttons embedded in assistant messages
  const handleMessageAction = useCallback((_action) => {
    // No intro action buttons currently in use
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const sendMessage = async (text) => {
    const content = (text || input).trim();
    if (!content || isLoading) return;
    setInput("");
    // User is explicitly talking — discard any pending auto-guidance so it doesn't
    // fire after the manual response and confuse the conversation.
    pendingFieldFocusRef.current = null;

    const userMsg = { role: "user", content };
    addMessage(userMsg);
    setIsLoading(true);

    const ctx = getScreenContext();
    const defaultEndpoint =
      assistantMode === "applicant" ? `${SERVER_URL}/api/ai/applicant-chat` : `${SERVER_URL}/api/ai/branding-chat`;
    const chatEndpoint = ctx?.aiEndpoint || defaultEndpoint;
    const history = [...messages, userMsg].map((m) => {
      const msg = { role: m.role, content: m.content ?? null };
      if (m.function_call) msg.function_call = m.function_call;
      if (m.name) msg.name = m.name;
      // Embed suggestColors hex values into content so the AI can reproduce them exactly when asked to apply
      if (m.toolCall?.tool === "suggestColors" && m.toolCall?.colors?.length) {
        const colorList = m.toolCall.colors.map((c) => `${c.hex}→${c.targetProperty || c.purpose}`).join(", ");
        msg.content = `${msg.content ?? ""}\n[Suggested colors: ${colorList}]`;
      }
      return msg;
    });

    console.log("%c[SEND] → AI request", "color:#070; font-weight:bold", {
      userMessage: content,
      fields: ctx?.currentState?.fields?.map((f) => ({ id: f.id, label: f.label, value: f.value, filled: f.filled })),
      maxHelpMode: assistantMode === "applicant",
    });

    try {
      const res = await fetch(chatEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          messages: history,
          context: {
            screenId: ctx?.screenId,
            screenName: ctx?.screenName,
            description: ctx?.description,
            currentState: ctx?.currentState,
            logos: ctx?.logos,
            colorPalette: ctx?.colorPalette || undefined,
            forms: ctx?.forms || undefined,
            brandingId: ctx?.brandingId || undefined,
            maxHelpMode: assistantMode === "applicant",
            formLanguage: formLanguageRef.current !== "English" ? formLanguageRef.current : undefined,
          },
          chatMode: AI_CHAT_MODE,
        }),
      });

      const data = await res.json();
      console.log("data", data);
      if (!data.success) throw new Error(data.message || "AI request failed");
      applyDetectedLanguage(data.detectedLanguage);
      console.log("%c[SEND] ← AI response", "color:#070", {
        type: data.type,
        tool: data.tool,
        args: data.args,
        content: data.content,
      });

      if (data.type === "tool_call") {
        await applyToolCall(data.tool, data.args, history);
      } else {
        addMessage({ role: "assistant", content: data.content });
        if (isVoiceModeRef.current) speak(data.content);
      }
    } catch (err) {
      console.error("[AI Chat error]", err);
      addMessage({
        role: "assistant",
        content: `${wt("error")}${err.message ? `: ${err.message}` : ""}. ${wt("tryAgain")}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Silently triggers the AI to proactively guide the user — no user message shown in chat.
  // Used for auto-guidance on form arrival and after "keep open" is clicked.
  // Disabled in basic mode — the assistant is purely reactive there.
  const autoGuide = async (instruction, _retryCount = 0) => {
    if (AI_CHAT_MODE === "basic") return;
    const isFieldFocus = instruction.startsWith("[FIELD_FOCUS]");

    if (isLoadingRef.current) {
      if (isFieldFocus) {
        // Save the most recent field-focus instead of dropping it. When the current request
        // finishes, the finally block will process this so the bot always catches up to wherever
        // the user currently is. Incrementing the generation invalidates the in-flight request
        // so its response is discarded rather than shown for a field the user already left.
        fieldFocusGenerationRef.current++;
        pendingFieldFocusRef.current = instruction;
      } else if (_retryCount < 10) {
        setTimeout(() => autoGuideRef.current?.(instruction, _retryCount + 1), 600);
      }
      return;
    }

    // Snapshot the generation at request start. If it changes before the response arrives,
    // the user has moved to a new field and this response should be discarded.
    const generation = isFieldFocus ? ++fieldFocusGenerationRef.current : fieldFocusGenerationRef.current;

    // Create an AbortController so the fetch can be cancelled if the user moves on.
    const controller = new AbortController();
    autoGuideAbortRef.current = controller;

    const ctx = getScreenContext();
    const defaultEndpoint =
      assistantMode === "applicant" ? `${SERVER_URL}/api/ai/applicant-chat` : `${SERVER_URL}/api/ai/branding-chat`;
    const chatEndpoint = ctx?.aiEndpoint || defaultEndpoint;
    const history = [...messages].map((m) => {
      const msg = { role: m.role, content: m.content ?? null };
      if (m.function_call) msg.function_call = m.function_call;
      if (m.name) msg.name = m.name;
      if (m.toolCall?.tool === "suggestColors" && m.toolCall?.colors?.length) {
        const colorList = m.toolCall.colors.map((c) => `${c.hex}→${c.targetProperty || c.purpose}`).join(", ");
        msg.content = `${msg.content ?? ""}\n[Suggested colors: ${colorList}]`;
      }
      return msg;
    });
    const autoMsg = { role: "user", content: instruction };

    setIsLoading(true);
    const autoGuidePayload = {
      messages: [...history, autoMsg],
      context: {
        screenId: ctx?.screenId,
        screenName: ctx?.screenName,
        description: ctx?.description,
        currentState: ctx?.currentState,
        logos: ctx?.logos,
        colorPalette: ctx?.colorPalette || undefined,
        forms: ctx?.forms || undefined,
        brandingId: ctx?.brandingId || undefined,
        maxHelpMode: assistantMode === "applicant",
        formLanguage: formLanguageRef.current !== "English" ? formLanguageRef.current : undefined,
      },
      chatMode: AI_CHAT_MODE,
    };
    console.log("%c[AUTOGUIDE] → AI request", "color:#a50; font-weight:bold", {
      instruction,
      fields: ctx?.currentState?.fields?.map((f) => ({ id: f.id, label: f.label, value: f.value, filled: f.filled })),
      maxHelpMode: autoGuidePayload.context.maxHelpMode,
    });
    try {
      const res = await fetch(chatEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        signal: controller.signal,
        body: JSON.stringify(autoGuidePayload),
      });
      const data = await res.json();
      console.log("data", data);
      if (!data.success) throw new Error(data.message || "AI request failed");

      // Stale-response guard: if the generation changed (user moved to another field),
      // discard this response entirely.
      if (isFieldFocus && generation !== fieldFocusGenerationRef.current) return;

      applyDetectedLanguage(data.detectedLanguage);
      console.log("%c[AUTOGUIDE] ← AI response", "color:#a50", {
        type: data.type,
        tool: data.tool,
        args: data.args,
        content: data.content,
      });
      if (data.type === "tool_call") {
        await applyToolCall(data.tool, data.args, [...history, autoMsg]);
      } else {
        addMessage({ role: "assistant", content: data.content });
        if (isVoiceModeRef.current) speak(data.content);
        // Dodge the panel and scroll to the first empty field so the applicant sees it highlighted.
        if (assistantMode === "applicant") {
          const fields = ctx?.currentState?.fields ?? [];
          const target = fields.find((f) => f.required && !f.filled) || fields.find((f) => !f.filled);
          if (target) {
            const el =
              document.getElementById(target.id) || document.querySelector(`[name="${CSS.escape(target.id)}"]`);
            if (el) {
              dodgeForField(el);
              el.scrollIntoView({ behavior: "smooth", block: "center" });
            }
            setTimeout(() => inputRef.current?.focus(), 80);
          }
        }
      }
    } catch (err) {
      if (err?.name === "AbortError") return; // user moved on — silent cancel, no logging
      // Other errors: silently fail — don't interrupt the user
    } finally {
      if (autoGuideAbortRef.current === controller) autoGuideAbortRef.current = null;
      setIsLoading(false);
      // If a newer field-focus arrived while we were busy with a manual message (non-abortable),
      // process it now so the bot catches up.
      const pending = pendingFieldFocusRef.current;
      if (pending) {
        pendingFieldFocusRef.current = null;
        setTimeout(() => autoGuideRef.current?.(pending), 0);
      }
    }
  };

  // Keep refs current so conversation-mode callbacks always call the latest functions
  sendMessageRef.current = sendMessage;
  autoGuideRef.current = autoGuide;

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent?.isComposing) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Never show the widget on the login page or when no user is authenticated,
  // unless this is an applicant form route (publicly accessible, no admin login required)
  const isApplicantFormRoute = pathname.startsWith("/application-form/");
  if (pathname === "/login" || (!user && !isApplicantFormRoute)) return null;

  return (
    <>
      {/* Launch button — sits flush below the app header, accent-colored */}
      {!isOpen && (
        <button
          ref={fabRef}
          data-testid="ai-fab-btn"
          onClick={() => {
            // Applicant manually reopening — clear the "user closed" flag so it auto-opens again going forward
            sessionStorage.removeItem(WIDGET_CLOSED_KEY);
            const _t = headerBottom;
            const _l = Math.max(0, window.innerWidth - PANEL_WIDTH - 24);
            panelTargetRef.current = { top: _t, left: _l, width: PANEL_WIDTH, height: PANEL_HEIGHT };
            setPanelWidth(PANEL_WIDTH);
            setPanelHeight(PANEL_HEIGHT);
            setPosition({ top: _t, left: _l });
            setIsOpen(true);
          }}
          className="fixed right-16 z-[300] flex h-[70px] w-[70px] items-center justify-center rounded-full shadow-xl hover:scale-110 focus:outline-none overflow-hidden p-0"
          style={{
            bottom: fabNudged ? 8 : 72,
            backgroundColor: effectiveLaunchColor,
            transition: "bottom 0.35s cubic-bezier(0.4,0,0.2,1)",
          }}
          aria-label="Open AI assistant"
        >
          {aiUseCustomIcon !== false && (
            <img
              src="/azpayments_icon_adaptive.svg"
              alt=""
              style={{ width: "140%", height: "140%", minWidth: "140%", minHeight: "140%" }}
              draggable={false}
            />
          )}
        </button>
      )}

      {/* Chat panel */}
      {isOpen && (
        <div
          ref={panelRef}
          data-testid="ai-chat-panel"
          className="ai-chat-panel fixed z-[300] flex flex-col overflow-hidden rounded-2xl shadow-2xl"
          style={{
            width: panelWidth,
            height: panelHeight,
            top: position.top,
            left: position.left,
            background: "#fff",
            fontFamily: fontFamily ? `var(--font-${fontFamily.toLowerCase()})` : undefined,
            transition:
              dragRef.current.isDragging || resizeRef.current.isResizing
                ? "none"
                : "top 0.35s cubic-bezier(0.4,0,0.2,1), left 0.35s cubic-bezier(0.4,0,0.2,1), width 0.35s cubic-bezier(0.4,0,0.2,1), height 0.35s cubic-bezier(0.4,0,0.2,1)",
          }}
        >
          {/* Resize handles — transparent hit areas at each edge and corner */}
          {/* edges */}
          <div
            onMouseDown={(e) => onResizeMouseDown(e, "n")}
            style={{ position: "absolute", top: 0, left: 8, right: 8, height: 5, cursor: "n-resize", zIndex: 10 }}
          />
          <div
            onMouseDown={(e) => onResizeMouseDown(e, "s")}
            style={{ position: "absolute", bottom: 0, left: 8, right: 8, height: 5, cursor: "s-resize", zIndex: 10 }}
          />
          <div
            onMouseDown={(e) => onResizeMouseDown(e, "e")}
            style={{ position: "absolute", top: 8, right: 0, bottom: 8, width: 5, cursor: "e-resize", zIndex: 10 }}
          />
          <div
            onMouseDown={(e) => onResizeMouseDown(e, "w")}
            style={{ position: "absolute", top: 8, left: 0, bottom: 8, width: 5, cursor: "w-resize", zIndex: 10 }}
          />
          {/* corners */}
          <div
            onMouseDown={(e) => onResizeMouseDown(e, "nw")}
            style={{ position: "absolute", top: 0, left: 0, width: 12, height: 12, cursor: "nw-resize", zIndex: 11 }}
          />
          <div
            onMouseDown={(e) => onResizeMouseDown(e, "ne")}
            style={{ position: "absolute", top: 0, right: 0, width: 12, height: 12, cursor: "ne-resize", zIndex: 11 }}
          />
          <div
            onMouseDown={(e) => onResizeMouseDown(e, "sw")}
            style={{ position: "absolute", bottom: 0, left: 0, width: 12, height: 12, cursor: "sw-resize", zIndex: 11 }}
          />
          <div
            onMouseDown={(e) => onResizeMouseDown(e, "se")}
            style={{
              position: "absolute",
              bottom: 0,
              right: 0,
              width: 12,
              height: 12,
              cursor: "se-resize",
              zIndex: 11,
            }}
          />
          {/* Bottom-right grip indicator */}
          <div
            onMouseDown={(e) => onResizeMouseDown(e, "se")}
            style={{
              position: "absolute",
              bottom: 4,
              right: 4,
              zIndex: 12,
              pointerEvents: "none",
              opacity: 0.35,
              lineHeight: 1,
            }}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" style={{ color: "#666" }}>
              <rect x="6" y="0" width="2" height="2" />
              <rect x="6" y="4" width="2" height="2" />
              <rect x="6" y="8" width="2" height="2" />
              <rect x="2" y="4" width="2" height="2" />
              <rect x="2" y="8" width="2" height="2" />
              <rect x="0" y="8" width="2" height="2" />
            </svg>
          </div>

          {/* Header — drag handle */}
          <div
            onMouseDown={onHeaderMouseDown}
            className="flex items-center justify-between px-4 py-3 select-none"
            style={{
              backgroundColor: effectiveHeaderColor,
              cursor: "grab",
            }}
          >
            <div className="flex items-center gap-2">
              {aiUseCustomIcon !== false && (
                <img src="/azpayments_icon_adaptive.svg" alt="" className="h-9 w-9 flex-shrink-0" draggable={false} />
              )}
              <div>
                <p className="text-sm font-semibold leading-tight" style={{ color: headerIconColor }}>
                  {getScreenContext()?.assistantName || "AI Assistant"}
                </p>
                <p className="text-xs leading-tight opacity-70" style={{ color: headerIconColor }}>
                  {getScreenContext()?.screenName || "AI"}
                </p>
              </div>
            </div>
            <button
              data-testid="ai-close-btn"
              onClick={() => {
                // Remember that the applicant explicitly closed the widget so it doesn't reopen
                if (assistantMode === "applicant") sessionStorage.setItem(WIDGET_CLOSED_KEY, "1");
                setIsOpen(false);
                stopSpeaking();
                stopListening();
                isVoiceModeRef.current = false;
                setIsVoiceMode(false);
              }}
              className="rounded-full p-1 transition-colors hover:bg-black/10"
              style={{ color: headerIconColor }}
            >
              <IoClose className="h-5 w-5" />
            </button>
          </div>

          {/* Language banner — rotates through translations of "Communicate with me in any language"
               so speakers of any language immediately know they can write in their own. */}
          <div
            className="flex items-center px-3 py-2 border-b"
            style={{ backgroundColor: effectiveBannerColor, borderColor: "rgba(0,0,0,0.1)" }}
          >
            <span
              className="text-sm font-semibold w-full text-center"
              style={{ color: effectiveBannerText, opacity: bannerFading ? 0 : 1, transition: "opacity 0.32s ease" }}
            >
              {LANGUAGES[bannerIdx].banner}
            </span>
          </div>

          {/* Messages */}
          <div
            ref={messagesContainerRef}
            data-testid="ai-messages"
            className="flex-1 overflow-y-auto p-4 space-y-3"
            style={{ backgroundColor: "#f8f9ff" }}
          >
            {messages
              .filter((msg) => msg.role !== "function" && msg.content !== null)
              .map((msg) => (
                <ChatMessage
                  key={msg.id}
                  message={msg}
                  accentColor={effectiveHeaderColor}
                  accentTextColor={headerIconColor}
                  onAction={handleMessageAction}
                  introButtonsDismissed={introButtonsDismissed}
                />
              ))}
            {isLoading && (
              <div data-testid="ai-thinking" className="flex items-center gap-2 px-3 py-2">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="h-2 w-2 rounded-full bg-purple-400"
                      style={{ animation: `bounce 1s ease-in-out ${i * 0.15}s infinite` }}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-400">Thinking…</span>
              </div>
            )}
            {/* Assisted Direct Entry panel */}
            {adePanel && (
              <ADEPanel
                fieldId={adePanel.fieldId}
                fieldLabel={adePanel.fieldLabel}
                fieldMode={adePanel.fieldMode}
                isRequired={adePanel.required ?? true}
                explanation={null}
                accentColor={effectiveHeaderColor}
                onComplete={handleAdePanelComplete}
                onCancel={handleAdePanelCancel}
              />
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-100 bg-white px-3 pt-2 pb-3">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                data-testid="ai-chat-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => {
                  suppressChatFocusRef.current = false;
                  userFocusedChatRef.current = true;
                }}
                onBlur={(e) => {
                  const next = e.relatedTarget;
                  // Focus moved to a real element outside the chat panel — user intentionally left.
                  if (next && next !== document.body && panelRef.current && !panelRef.current.contains(next)) {
                    userFocusedChatRef.current = false;
                  }
                  // Focus went to null/body (e.g. textarea was disabled by isLoading) — keep the flag.
                }}
                placeholder={
                  AI_CHAT_MODE === "basic"
                    ? "Ask me anything about the application…"
                    : assistantMode === "applicant"
                      ? "Ask for help with any field…"
                      : "Ask me to change colors, fonts, layout…"
                }
                rows={1}
                className="flex-1 resize-none rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-200"
                style={{ maxHeight: "100px", overflowY: "auto" }}
                onInput={(e) => {
                  e.target.style.height = "auto";
                  e.target.style.height = Math.min(e.target.scrollHeight, 100) + "px";
                }}
                disabled={isLoading}
              />

              <button
                data-testid="ai-send-btn"
                onClick={() => sendMessage()}
                disabled={!input.trim() || isLoading}
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full transition-all disabled:opacity-30"
                style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
                aria-label="Send message"
                type="button"
              >
                <IoSend className="h-4 w-4 text-white" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pre-fill confirmation dialog — basic mode applicant only */}
      {preFillModal && (
        <PreFillModal
          preFilled={preFillModal.preFilled}
          remaining={preFillModal.remaining}
          headerBg={effectiveHeaderColor}
          headerTextColor={headerIconColor}
          accentColor={effectiveHeaderColor}
          buttonColor={primaryColor}
          buttonTextColor={buttonTextPrimary}
          fontFamily={fontFamily}
          onConfirm={handlePreFillConfirm}
          onSkip={handlePreFillSkip}
        />
      )}

      {/* Silent field-error modal — basic mode applicant only */}
      {fieldErrorModal && (
        <FieldErrorModal
          fieldLabel={fieldErrorModal.fieldLabel}
          fieldType={fieldErrorModal.fieldType}
          currentValue={fieldErrorModal.currentValue}
          description={fieldErrorModal.description}
          suggestion={fieldErrorModal.suggestion}
          retryNote={fieldErrorModal.retryNote}
          headerBg={effectiveHeaderColor}
          headerTextColor={headerIconColor}
          accentColor={effectiveHeaderColor}
          fontFamily={fontFamily}
          onKeep={handleFieldErrorKeep}
          onSave={handleFieldErrorSave}
        />
      )}

      {/* Hover-translation tooltip — shown when translation mode is active */}
      {translationTooltip && (
        <div
          style={{
            position: "fixed",
            left: translationTooltip.x,
            top: translationTooltip.y,
            transform: "translate(-50%, -100%)",
            zIndex: 99999,
            pointerEvents: "none",
            background: "rgba(30,20,60,0.92)",
            color: "#fff",
            fontSize: "12px",
            lineHeight: "1.4",
            padding: "4px 10px",
            borderRadius: "6px",
            maxWidth: "260px",
            whiteSpace: "normal",
            boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
          }}
        >
          {translationTooltip.text}
        </div>
      )}

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>
    </>
  );
}

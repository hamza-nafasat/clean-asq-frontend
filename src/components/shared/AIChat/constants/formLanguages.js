// form language names mapped to BCP-47 codes
export const FORM_LANG_TO_BCP47 = {
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

// unicode script ranges that identify a form language
export const SCRIPT_LANGUAGE_PATTERNS = [
  { language: "Arabic", pattern: /[\u0600-\u06FF]/g },
  { language: "Chinese", pattern: /[\u4E00-\u9FFF]/g },
  { language: "Japanese", pattern: /[\u3040-\u30FF]/g },
  { language: "Korean", pattern: /[\uAC00-\uD7AF]/g },
  { language: "Russian", pattern: /[\u0400-\u04FF]/g },
  { language: "Hebrew", pattern: /[\u0590-\u05FF]/g },
  { language: "Thai", pattern: /[\u0E00-\u0E7F]/g },
  { language: "Hindi", pattern: /[\u0900-\u097F]/g },
];

// common field words that identify a latin-script form language
export const WORD_LANGUAGE_PATTERNS = [
  { language: "Spanish", pattern: /\b(nombre|empresa|dirección|ciudad|país|fecha|teléfono|correo|apellido)\b/ },
  { language: "French", pattern: /\b(nom|prénom|adresse|entreprise|ville|pays|téléphone|courriel|date)\b/ },
  { language: "Portuguese", pattern: /\b(nome|empresa|endereço|cidade|estado|país|telefone|cpf|cnpj)\b/ },
  { language: "German", pattern: /\b(vorname|nachname|unternehmen|anschrift|straße|stadt|land|telefon|datum)\b/ },
  { language: "Italian", pattern: /\b(nome|azienda|indirizzo|città|paese|telefono|codice fiscale|data)\b/ },
];

export const APPLICANT_GREETINGS = {
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

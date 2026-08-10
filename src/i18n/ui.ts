// Diccionario para strings que viven dentro de <script> o en atributos,
// donde no se puede usar el componente <T>. El texto visible normal usa <T>.
export type Lang = 'es' | 'en';

export const ui = {
  es: {
    contactErrorSend: 'Error al enviar el mensaje. Intenta de nuevo.',
    contactErrorNetwork: 'Error de conexión. Intenta de nuevo.',
    statusStackUnavailable: 'Stack no disponible',
    whatsappMessage:
      'Hola, estuve viendo tu perfil y me gustaría conversar sobre una oportunidad laboral o proyecto. ¿Podemos coordinar?',
  },
  en: {
    contactErrorSend: 'Failed to send the message. Please try again.',
    contactErrorNetwork: 'Connection error. Please try again.',
    statusStackUnavailable: 'Stack unavailable',
    whatsappMessage:
      "Hi, I came across your profile and I'd love to talk about a job opportunity or project. Could we set up a chat?",
  },
} as const;

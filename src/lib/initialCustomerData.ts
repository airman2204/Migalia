import { CustomerConversation, CustomerMessage } from '@/types';

export const INITIAL_CONVERSATIONS: CustomerConversation[] = [
  {
    id: 'conv-ig-1',
    platform: 'instagram',
    customerHandle: '@sofia_montes_puebla',
    customerName: 'Sofía Montes',
    customerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    customerPhone: '+52 222 458 9120',
    lastMessage: '¡Hola! Me encantó la publicación de las Cookie Fries. ¿Hacen mesas de postres para bodas de 120 personas?',
    lastMessageTime: 'Hace 15 min',
    unreadCount: 1,
    status: 'quote_sent',
    category: 'Pedido Evento',
    assignedTo: 'partner-1',
    notes: 'Boda en San Andrés Cholula para noviembre. Interesada en barra de Cookie Fries con 3 dips (frutos rojos, dulce de leche y avellana).',
    quotedAmount: 9600,
    createdAt: '2026-09-20',
    tags: ['Boda', 'Cookie Fries', 'Evento Grande', 'Cholula'],
  },
  {
    id: 'conv-ig-2',
    platform: 'instagram',
    customerHandle: '@valentina_gourmet',
    customerName: 'Valentina R.',
    customerAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    customerPhone: '+52 222 190 3344',
    lastMessage: '¿Tienen opciones con harina de almendra o keto para los pasteles?',
    lastMessageTime: 'Hace 45 min',
    unreadCount: 2,
    status: 'pending',
    category: 'Duda Menú & Alérgenos',
    assignedTo: 'partner-2',
    notes: 'Cliente pregunta por línea libre de gluten / keto. Revisar catálogo con Susy.',
    createdAt: '2026-09-21',
    tags: ['Keto', 'Sin Gluten', 'Menú'],
  },
  {
    id: 'conv-ig-3',
    platform: 'instagram',
    customerHandle: '@carlos_arq_puebla',
    customerName: 'Carlos Mendívil',
    customerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    customerPhone: '+52 222 612 8840',
    lastMessage: 'Excelente, ya realicé la transferencia del anticipo para el pastel de cumpleaños. Les mandé el comprobante.',
    lastMessageTime: 'Ayer, 18:30',
    unreadCount: 0,
    status: 'order_confirmed',
    category: 'Cotización de Pastel',
    assignedTo: 'partner-1',
    notes: 'Pastel Red Velvet 20 pax con diseño minimalista tono marfil y detalles dorados. Entrega 28 de septiembre.',
    quotedAmount: 1450,
    orderReference: 'ORD-2026-0928',
    createdAt: '2026-09-18',
    tags: ['Pastel Personalizado', 'Pagado', 'Red Velvet'],
  },
  {
    id: 'conv-ig-4',
    platform: 'instagram',
    customerHandle: '@mariana_lozano_studio',
    customerName: 'Mariana Lozano',
    customerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    lastMessage: '¿A qué hora abren la boutique los sábados para pasar por cajas de degustación?',
    lastMessageTime: 'Ayer, 12:10',
    unreadCount: 0,
    status: 'resolved',
    category: 'Horarios & Ubicación',
    assignedTo: 'partner-2',
    notes: 'Confirmado horario sábados 9:00 AM a 8:00 PM. Pasará a Sonata.',
    createdAt: '2026-09-19',
    tags: ['Horarios', 'Degustación', 'Sonata'],
  },
  {
    id: 'conv-ig-5',
    platform: 'instagram',
    customerHandle: '@dulces_momentos_mx',
    customerName: 'Andrea Celis',
    customerAvatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
    customerPhone: '+52 222 889 0012',
    lastMessage: 'Hola, ¿manejan precio mayoreo si quiero 40 conos de Cookie Fries para un baby shower?',
    lastMessageTime: '18 Sep',
    unreadCount: 0,
    status: 'in_progress',
    category: 'Pedido Evento',
    assignedTo: 'partner-1',
    notes: 'Cotizar con 15% de descuento por volumen + empaque personalizado con listón rosa.',
    quotedAmount: 3200,
    createdAt: '2026-09-18',
    tags: ['Baby Shower', 'Mayoreo', 'Cookie Fries'],
  }
];

export const INITIAL_MESSAGES: Record<string, CustomerMessage[]> = {
  'conv-ig-1': [
    {
      id: 'msg-1-1',
      conversationId: 'conv-ig-1',
      sender: 'customer',
      senderName: 'Sofía Montes',
      content: '¡Hola! Me encantó la publicación de las Cookie Fries en su Instagram Reels 🥐✨. ¿Hacen mesas de postres para bodas?',
      timestamp: '11:20 AM',
      status: 'read'
    },
    {
      id: 'msg-1-2',
      conversationId: 'conv-ig-1',
      sender: 'agent',
      senderName: 'Mario (Migalia)',
      content: '¡Hola Sofía! Qué gusto saludarte. Sí, totalmente. Contamos con estaciones dulces interactivas y bar de Cookie Fries con dips artesanales para bodas y eventos especiales en Puebla y Cholula. ¿Para cuántos invitados y qué fecha la tienes planeada?',
      timestamp: '11:25 AM',
      status: 'read'
    },
    {
      id: 'msg-1-3',
      conversationId: 'conv-ig-1',
      sender: 'customer',
      senderName: 'Sofía Montes',
      content: 'Es para el 14 de noviembre en San Andrés Cholula, seremos aproximadamente 120 personas. Me gustaría cotizar la barra con 3 dips diferentes.',
      timestamp: '11:32 AM',
      status: 'read'
    },
    {
      id: 'msg-1-4',
      conversationId: 'conv-ig-1',
      sender: 'agent',
      senderName: 'Mario (Migalia)',
      content: 'Excelente fecha Sofía. Para 120 invitados te recomendamos el paquete "Boutique Experience": incluye 240 conos kraft con Cookie Fries calientitas, 3 salsas artesanales (Frutos Rojos con Maracuyá, Dulce de Leche quemado al bourbon y Crema de Avellana Piamonte) y montaje con vajilla de cerámica marfil. El costo estimado es de $9,600 MXN. ¿Te gustaría agendar una prueba de degustación en nuestro taller?',
      timestamp: '11:40 AM',
      status: 'read'
    },
    {
      id: 'msg-1-5',
      conversationId: 'conv-ig-1',
      sender: 'customer',
      senderName: 'Sofía Montes',
      content: '¡Me parece perfecto! ¿Qué días tienen disponibles para la degustación esta semana?',
      timestamp: '11:48 AM',
      status: 'read'
    }
  ],
  'conv-ig-2': [
    {
      id: 'msg-2-1',
      conversationId: 'conv-ig-2',
      sender: 'customer',
      senderName: 'Valentina R.',
      content: 'Buenas tardes, vi sus pasteles en Instagram y se ven espectaculares. Una duda: ¿tienen opciones con harina de almendra o keto?',
      timestamp: '12:05 PM',
      status: 'read'
    },
    {
      id: 'msg-2-2',
      conversationId: 'conv-ig-2',
      sender: 'customer',
      senderName: 'Valentina R.',
      content: 'Es para un cumpleaños este fin de semana, somos 3 personas diabéticas en la familia.',
      timestamp: '12:06 PM',
      status: 'sent'
    }
  ],
  'conv-ig-3': [
    {
      id: 'msg-3-1',
      conversationId: 'conv-ig-3',
      sender: 'customer',
      senderName: 'Carlos Mendívil',
      content: 'Hola amigos de Migalia, quiero apartar un pastel Red Velvet para 20 personas este 28 de septiembre.',
      timestamp: 'Ayer, 16:10',
      status: 'read'
    },
    {
      id: 'msg-3-2',
      conversationId: 'conv-ig-3',
      sender: 'agent',
      senderName: 'Susy (Migalia)',
      content: '¡Hola Carlos! Claro que sí, con betún de queso mascarpone y reducción de frutos rojos. El total es de $1,450 MXN con anticipo del 50%. Te comparto nuestra cuenta CLABE BBVA.',
      timestamp: 'Ayer, 16:20',
      status: 'read'
    },
    {
      id: 'msg-3-3',
      conversationId: 'conv-ig-3',
      sender: 'customer',
      senderName: 'Carlos Mendívil',
      content: 'Excelente, ya realicé la transferencia del anticipo para el pastel de cumpleaños. Les mandé el comprobante.',
      timestamp: 'Ayer, 18:30',
      status: 'read'
    }
  ]
};

import Anthropic from '@anthropic-ai/sdk';

export const TOOL_DEFINITIONS: Anthropic.Tool[] = [
  {
    name: 'search_hbo_competentie',
    description:
      'Zoek HBO-i competentiedefinities via vector search. Returns chunks gesorteerd op relevantie, met velden laag, activiteit, niveau, content en similarity. De metadata-velden (laag/activiteit/niveau) zijn autoritatief: als die overeenkomen met je vraag, vertrouw die chunk dan ook als de body andere bewoordingen gebruikt. Het eerste resultaat is doorgaans de juiste match. Roep deze tool max 1-2 keer per vraag aan.',
    input_schema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Beschrijf wat je zoekt in natuurlijke taal, bijvoorbeeld "Infrastructure Analyse niveau 2".',
        },
        top_k: {
          type: 'integer',
          description: 'Aantal terug te geven chunks. Standaard 5.',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_student_profiel',
    description: 'Haal het profiel van een student op: naam, opleiding, semester en projectbeschrijving.',
    input_schema: {
      type: 'object',
      properties: {
        student_id: { type: 'integer', description: 'ID van de student.' },
      },
      required: ['student_id'],
    },
  },
  {
    name: 'get_student_voortgang',
    description: 'Haal de competentie-voortgang van een student op. Optioneel filteren op laag en/of activiteit.',
    input_schema: {
      type: 'object',
      properties: {
        student_id: { type: 'integer' },
        laag: {
          type: 'string',
          description: 'Optioneel. Bijv. Infrastructure, Software, User Interaction.',
        },
        activiteit: {
          type: 'string',
          description: 'Optioneel. Bijv. Analyse, Advise, Design, Realise, Manage & Control.',
        },
      },
      required: ['student_id'],
    },
  },
  {
    name: 'get_student_activiteiten',
    description: 'Haal de geplande en afgeronde activiteiten van een student op, optioneel binnen een datumbereik.',
    input_schema: {
      type: 'object',
      properties: {
        student_id: { type: 'integer' },
        vanaf: { type: 'string', description: 'Optioneel. ISO-datum YYYY-MM-DD.' },
        tot: { type: 'string', description: 'Optioneel. ISO-datum YYYY-MM-DD.' },
      },
      required: ['student_id'],
    },
  },
];

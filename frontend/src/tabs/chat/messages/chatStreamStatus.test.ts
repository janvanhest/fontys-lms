import { describe, expect, it } from 'vitest';
import {
  getStatusFromEventText,
  getStatusFromToolCall,
  toolCallToBubble,
} from './chatStreamStatus';

describe('getStatusFromToolCall', () => {
  it.each([
    ['search_activities', 'Activiteiten bekijken...', 'activities'],
    ['search_course_content', 'Bronnen bekijken...', 'sources'],
    ['perform_ui_action', 'Paneel openen...', 'panel'],
    ['unknown_tool', 'Extra context ophalen...', 'tool'],
  ])('returns status metadata for %s', (name, label, icon) => {
    expect(getStatusFromToolCall(JSON.stringify({ name }))).toMatchObject({ label, icon });
  });
});

describe('getStatusFromEventText', () => {
  it.each([
    ['Nadenken...', 'thinking'],
    ['Tool uitvoeren...', 'tool'],
    ['Bezig...', 'spark'],
  ])('maps %s to %s', (label, icon) => {
    expect(getStatusFromEventText(label)).toMatchObject({ label, icon });
  });
});

describe('toolCallToBubble', () => {
  it.each([
    ['search_activities', 'Activiteiten bekeken', 'activities'],
    ['get_student_context', 'Studentprofiel bekeken', 'student'],
    ['search_course_content', 'Bronnen bekeken', 'sources'],
  ])('returns a bubble for %s', (name, label, icon) => {
    expect(toolCallToBubble(name)).toEqual({ name, label, icon });
  });

  it.each(['perform_ui_action', 'unknown_tool'])('returns null for %s', (name) => {
    expect(toolCallToBubble(name)).toBeNull();
  });
});

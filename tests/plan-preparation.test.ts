import { expect, it } from '@jest/globals';
import { rescheduledEvidence, preparationItems } from '@/utils/planning';
import type { ActivityAssessment } from '@/utils/planning';

const assessment: ActivityAssessment = {
  start: '2099-09-15T02:00:00Z', end: '2099-09-15T02:30:00Z', status: 'caution', score: 24,
  summary: 'Mưa', reasons: ['Mưa 40%'], risks: ['Khả năng mưa tăng'],
  checklist: [{id: 'water', label: 'Nước uống', icon: 'heat-hydration'}, {id: 'umbrella', label: 'Ô hoặc áo mưa', icon: 'rain-protection'}],
};

it('keeps prepared items still needed, removes obsolete ones and leaves new items unchecked', () => {
  const update = rescheduledEvidence(assessment, ['water', 'sun']);
  expect(update.checked_items).toEqual(['water']);
  expect(update.preparation).toBe('Nước uống · Ô hoặc áo mưa');
  expect(update.baseline_risks).toEqual(assessment.risks);
  expect(preparationItems(update.preparation).map(([id]) => id)).toEqual(['water', 'umbrella']);
});

it('does not permit rescheduling into unknown, hazardous or elapsed windows', () => {
  for (const status of ['unknown', 'avoid'] as const) expect(() => rescheduledEvidence({...assessment, status}, [])).toThrow();
  expect(() => rescheduledEvidence(assessment, [], Date.parse(assessment.start))).toThrow();
});

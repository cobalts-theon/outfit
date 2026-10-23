import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { changeActivityPlan, listActivityPlans, saveActivityPlan, rescheduleActivityPlan, nextActivityPlan, type PlanInput } from '@/services/plans';
import { requireSupabaseClient } from '@/services/supabase';

jest.mock('expo-sqlite/localStorage/install', () => ({}));

jest.mock('@/services/supabase', () => ({ requireSupabaseClient: jest.fn() }));

const entries = new Map<string, string>();

const storage = {
  getItem: (key: string) => entries.get(key) ?? null,
  setItem: (key: string, value: string) => entries.set(key, value),
};

const input: PlanInput = {
  activity: 'walking', location_label: 'Hà Nội', latitude: 21, longitude: 105,
  time_zone: 'Asia/Ho_Chi_Minh', starts_at: '2099-09-08T07:00:00.000Z',
  ends_at: '2099-09-08T07:30:00.000Z', policy_version: 'walking-v1',
  reasons: ['US AQI tối đa 40'], preparation: 'Mang nước.',
};

beforeEach(() => {
  entries.clear();
  jest.clearAllMocks();
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: storage });
});

describe('activity plan persistence', () => {
  it('persists and reloads guest plans without a backend, then cancels and deletes', async () => {
    const saved = await saveActivityPlan(input);
    expect(await listActivityPlans()).toEqual([saved]);
    await changeActivityPlan(saved.id, { status: 'cancelled' });
    expect((await listActivityPlans())[0].status).toBe('cancelled');
    await changeActivityPlan(saved.id, 'delete');
    expect(await listActivityPlans()).toEqual([]);
    expect(requireSupabaseClient).not.toHaveBeenCalled();
  });
  it('rejects duplicate guest plans without overwriting the first', async () => {
    await saveActivityPlan(input);
    await expect(saveActivityPlan(input)).rejects.toThrow('đã lưu');
    expect(await listActivityPlans()).toHaveLength(1);
  });
  it('does not erase corrupt local data', async () => {
    storage.setItem('weather.guest-walking-plans.v1', 'corrupt');
    await expect(saveActivityPlan(input)).rejects.toThrow();
    expect(storage.getItem('weather.guest-walking-plans.v1')).toBe('corrupt');
  });
  it('does not fall back to guest storage when an authenticated write fails', async () => {
    const error = new Error('network unavailable');
    const single = jest.fn(async () => ({ data: null, error }));
    const insert = jest.fn(() => ({ select: () => ({ single }) }));
    jest.mocked(requireSupabaseClient).mockReturnValue({ from: () => ({ insert }) } as never);
    await expect(saveActivityPlan(input, 'owner-123')).rejects.toBe(error);
    expect(insert).toHaveBeenCalledWith({ ...input, user_id: 'owner-123' });
    expect(await listActivityPlans()).toEqual([]);
  });
});

describe('account plan rescheduling', () => {
 const assessment = {start: '2099-09-09T07:00:00.000Z', end: '2099-09-09T07:30:00.000Z', status: 'suitable' as const, score: 1, summary: 'Clear', reasons: ['Clear'], risks: [], checklist: [{id: 'water', label: 'Nước uống', icon: 'heat-hydration'}]};
 it('updates the existing owned plan, guarding status, original time and checklist', async () => {
  const plan = {...await saveActivityPlan({...input, checked_items:['water','sun'], reminder_enabled:true}), user_id:'owner'};
  const maybeSingle = jest.fn(async () => ({data: {...plan, starts_at:assessment.start}, error:null}));
  const chain = {eq: jest.fn(), filter: jest.fn(), select: jest.fn(), maybeSingle};
  chain.eq.mockReturnValue(chain); chain.filter.mockReturnValue(chain); chain.select.mockReturnValue(chain);
  const update = jest.fn((_value: unknown) => chain);
  jest.mocked(requireSupabaseClient).mockReturnValue({from:()=>({update})} as never);
  const saved = await rescheduleActivityPlan(plan, assessment, 'owner');
  expect(saved.id).toBe(plan.id);
  expect(update).toHaveBeenCalledWith(expect.objectContaining({checked_items:['water'], starts_at:assessment.start}));
  expect(update.mock.calls[0][0]).not.toHaveProperty('reminder_enabled');
  expect(update.mock.calls[0][0]).not.toHaveProperty('user_id');
  expect(chain.eq).toHaveBeenCalledWith('user_id','owner');
  expect(chain.eq).toHaveBeenCalledWith('status','planned');
  expect(chain.eq).toHaveBeenCalledWith('starts_at',plan.starts_at);
  expect(chain.filter).toHaveBeenCalledWith('checked_items','eq','{"water","sun"}');
 });
 it('rejects changed/cancelled/foreign plans and never creates a replacement', async () => {
  const plan = {...await saveActivityPlan(input), user_id:'owner'};
  const chain = {eq: jest.fn(), filter: jest.fn(), select: jest.fn(), maybeSingle: jest.fn(async()=>({data:null,error:null}))};
  chain.eq.mockReturnValue(chain); chain.filter.mockReturnValue(chain); chain.select.mockReturnValue(chain);
  const update = jest.fn((_value: unknown) => chain);
  jest.mocked(requireSupabaseClient).mockReturnValue({from:()=>({update})} as never);
  await expect(rescheduleActivityPlan(plan,assessment,'other')).rejects.toThrow('thay đổi');
  await expect(rescheduleActivityPlan({...plan,status:'cancelled'},assessment,'owner')).rejects.toThrow('thay đổi');
  expect(update).not.toHaveBeenCalled();
  await expect(rescheduleActivityPlan(plan,assessment,'owner')).rejects.toThrow('vừa thay đổi');
  expect(await listActivityPlans()).toHaveLength(1);
 });
 it('looks up the next future planned activity without a descending history limit', async () => {
  const chain = {eq:jest.fn(),gt:jest.fn(),order:jest.fn(),limit:jest.fn(),maybeSingle:jest.fn(async()=>({data:null,error:null}))};
  for (const fn of [chain.eq,chain.gt,chain.order,chain.limit]) fn.mockReturnValue(chain);
  jest.mocked(requireSupabaseClient).mockReturnValue({from:()=>({select:()=>chain})} as never);
  expect(await nextActivityPlan('owner')).toBeNull();
  expect(chain.eq).toHaveBeenCalledWith('user_id','owner');
  expect(chain.eq).toHaveBeenCalledWith('status','planned');
  expect(chain.gt).toHaveBeenCalledWith('starts_at',expect.any(String));
  expect(chain.order).toHaveBeenCalledWith('starts_at',{ascending:true});
  expect(chain.limit).toHaveBeenCalledWith(1);
 });
});

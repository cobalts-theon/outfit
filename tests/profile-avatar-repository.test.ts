import { beforeEach, describe, expect, it, jest } from '@jest/globals';

jest.mock('@/services/supabase', () => ({
  requireSupabaseClient: jest.fn(),
}));
jest.mock('expo-file-system', () => ({
  File: jest.fn(),
}));

import {
  assertProfileAvatarSize,
  buildProfileAvatarPath,
  createProfileAvatarSignedUrl,
  PROFILE_AVATAR_MAX_BYTES,
  resolveProfileAvatarMimeType,
  uploadProfileAvatar,
} from '@/services/account';
import { File } from 'expo-file-system';
import { requireSupabaseClient } from '@/services/supabase';

const mockRequireSupabaseClient = jest.mocked(requireSupabaseClient);
const mockFile = jest.mocked(File);
const mockUpload =
  jest.fn<
    (
      path: string,
      bytes: ArrayBuffer,
      options: unknown,
    ) => Promise<{ data: unknown; error: Error | null }>
  >();
const mockRemove = jest.fn<(paths: string[]) => Promise<{ data: unknown; error: Error | null }>>();
const mockCreateSignedUrl = jest.fn<
  (
    path: string,
    expiresIn: number,
  ) => Promise<{
    data: { signedUrl: string } | null;
    error: Error | null;
  }>
>();
const mockStorageFrom = jest.fn(() => ({
  upload: mockUpload,
  remove: mockRemove,
  createSignedUrl: mockCreateSignedUrl,
}));
const mockSingle =
  jest.fn<() => Promise<{ data: Record<string, unknown> | null; error: Error | null }>>();
const mockSelect = jest.fn(() => ({ single: mockSingle }));
const mockEq = jest.fn(() => ({ select: mockSelect }));
const mockUpdate = jest.fn(() => ({ eq: mockEq }));
const mockFrom = jest.fn(() => ({ update: mockUpdate }));

describe('profile avatar repository helpers', () => {
  beforeEach(() => {
    mockRequireSupabaseClient.mockReset().mockReturnValue({
      storage: { from: mockStorageFrom },
      from: mockFrom,
    } as never);
    mockFile.mockReset();
    mockUpload.mockReset();
    mockRemove.mockReset().mockResolvedValue({ data: [], error: null });
    mockCreateSignedUrl.mockReset();
    mockStorageFrom.mockClear();
    mockSingle.mockReset();
    mockSelect.mockClear();
    mockEq.mockClear();
    mockUpdate.mockClear();
    mockFrom.mockClear();
  });

  it('normalizes supported MIME types and keeps files inside the user folder', () => {
    const mimeType = resolveProfileAvatarMimeType({
      uri: 'file:///cache/cropped-avatar.jpg',
      mimeType: 'IMAGE/JPEG',
    });

    expect(mimeType).toBe('image/jpeg');
    expect(buildProfileAvatarPath('user-123', mimeType, 'avatar-1')).toBe('user-123/avatar-1.jpg');
  });

  it('infers the type from the filename when the picker omits MIME metadata', () => {
    expect(
      resolveProfileAvatarMimeType({
        uri: 'file:///cache/selection',
        fileName: 'portrait.HEIC',
      }),
    ).toBe('image/heic');
  });

  it('prefers the cropped payload type over stale picker metadata', () => {
    expect(
      resolveProfileAvatarMimeType({
        uri: 'file:///cache/cropped-avatar.jpg',
        fileName: 'original.HEIC',
        mimeType: 'image/heic',
      }),
    ).toBe('image/jpeg');
  });

  it('rejects unsupported file types', () => {
    expect(() =>
      resolveProfileAvatarMimeType({
        uri: 'file:///cache/avatar.svg',
        mimeType: 'image/svg+xml',
      }),
    ).toThrow('profile_avatar_unsupported_type');
  });

  it('enforces the same five-megabyte limit as the Storage bucket', () => {
    expect(() => assertProfileAvatarSize(PROFILE_AVATAR_MAX_BYTES)).not.toThrow();
    expect(() => assertProfileAvatarSize(PROFILE_AVATAR_MAX_BYTES + 1)).toThrow(
      'profile_avatar_too_large',
    );
  });

  it('uploads binary data, updates the profile path, and removes the previous image', async () => {
    const bytes = new Uint8Array([1, 2, 3]).buffer;
    const profile = {
      id: 'user-123',
      full_name: 'Nguyễn An',
      avatar_url: 'user-123/new-avatar.jpg',
      created_at: '2026-09-02T00:00:00.000Z',
    };
    const readBytes = jest.fn<() => Promise<ArrayBuffer>>().mockResolvedValue(bytes);
    mockFile.mockImplementation(
      () =>
        ({
          exists: true,
          size: bytes.byteLength,
          arrayBuffer: readBytes,
        }) as never,
    );
    mockUpload.mockResolvedValue({ data: { path: profile.avatar_url }, error: null });
    mockSingle.mockResolvedValue({ data: profile, error: null });

    await expect(
      uploadProfileAvatar('user-123', 'user-123/old-avatar.png', {
        uri: 'file:///cache/new-avatar.jpg',
        mimeType: 'image/jpeg',
      }),
    ).resolves.toEqual(profile);

    expect(mockUpload).toHaveBeenCalledWith(expect.stringMatching(/^user-123\/.+\.jpg$/), bytes, {
      cacheControl: '3600',
      contentType: 'image/jpeg',
      upsert: false,
    });
    expect(mockFile).toHaveBeenCalledWith('file:///cache/new-avatar.jpg');
    expect(readBytes).toHaveBeenCalledTimes(1);
    expect(mockUpdate).toHaveBeenCalledWith({
      avatar_url: expect.stringMatching(/^user-123\/.+\.jpg$/),
    });
    expect(mockRemove).toHaveBeenCalledWith(['user-123/old-avatar.png']);
  });

  it('rejects a missing native picker file before contacting Storage', async () => {
    mockFile.mockImplementation(() => ({ exists: false, size: null }) as never);

    await expect(
      uploadProfileAvatar('user-123', null, {
        uri: 'file:///cache/missing-avatar.jpg',
        mimeType: 'image/jpeg',
      }),
    ).rejects.toThrow('profile_avatar_unreadable_file');

    expect(mockUpload).not.toHaveBeenCalled();
  });

  it('creates an expiring URL through the private Storage bucket', async () => {
    mockCreateSignedUrl.mockResolvedValue({
      data: { signedUrl: 'https://example.test/signed-avatar' },
      error: null,
    });

    await expect(createProfileAvatarSignedUrl('user-123/avatar.jpg')).resolves.toBe(
      'https://example.test/signed-avatar',
    );
    expect(mockCreateSignedUrl).toHaveBeenCalledWith('user-123/avatar.jpg', 60 * 60);
  });
});

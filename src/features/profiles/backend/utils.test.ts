import { describe, it, expect } from 'vitest';
import { extractClerkUser, type ClerkWebhook } from './utils';

describe('extractClerkUser', () => {
  it('primary email이 설정된 경우 해당 이메일을 선택한다', () => {
    const payload: ClerkWebhook = {
      type: 'user.created',
      data: {
        id: 'user_123',
        email_addresses: [
          { id: 'em_1', email_address: 'primary@example.com' },
          { id: 'em_2', email_address: 'secondary@example.com' },
        ],
        primary_email_address_id: 'em_1',
        first_name: 'Jane',
        last_name: 'Doe',
        image_url: 'https://picsum.photos/96',
      },
    };

    const result = extractClerkUser(payload);
    expect(result).not.toBeNull();
    expect(result!.clerkUserId).toBe('user_123');
    expect(result!.email).toBe('primary@example.com');
    expect(result!.fullName).toBe('Jane Doe');
    expect(result!.imageUrl).toBe('https://picsum.photos/96');
  });

  it('primary email id가 없으면 첫 번째 이메일을 사용한다', () => {
    const payload: ClerkWebhook = {
      type: 'user.created',
      data: {
        id: 'user_456',
        email_addresses: [
          { id: 'em_2', email_address: 'first@example.com' },
          { id: 'em_3', email_address: 'second@example.com' },
        ],
        first_name: null,
        last_name: null,
        username: 'handle',
      },
    };

    const result = extractClerkUser(payload);
    expect(result).not.toBeNull();
    expect(result!.email).toBe('first@example.com');
    expect(result!.fullName).toBe('handle');
  });

  it('id가 없으면 null을 반환한다', () => {
    const payload: ClerkWebhook = { type: 'user.created', data: { username: 'ghost' } as any };
    const result = extractClerkUser(payload);
    expect(result).toBeNull();
  });
});


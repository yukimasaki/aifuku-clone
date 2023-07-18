import type { Prisma, Profile } from '@prisma/client';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod'

const item = z.object({
  id: z.number().int(),
  uid: z.string().length(28),
  email: z.string().email('形式が不正です'),
  displayName: z.string().max(255, '255文字以内で入力してください'),
  tenantId: z.number().int(),
});

export const ProfileResponseSchema: z.ZodType<Profile> = item;
export type ProfileResponse = z.infer<typeof ProfileResponseSchema>;

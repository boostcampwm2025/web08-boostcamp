import { z } from "zod";

// Zod 스키마: 1-6자, 모든 유니코드 허용
export const nicknameSchema = z
  .string()
  .min(1, "닉네임을 입력해주세요.")
  .max(6, "닉네임은 최대 6자까지 입력 가능합니다.");

export type Nickname = z.infer<typeof nicknameSchema>;
